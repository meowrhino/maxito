export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function stripHTMLTags(value) {
  return String(value || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

export function truncateText(text, maxLength = 160) {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLength) return clean;
  return clean.slice(0, maxLength - 3).trimEnd() + '...';
}

export function randomChoice(items) {
  return items[Math.floor(Math.random() * items.length)];
}

export function collectTextNodes(container) {
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let current = walker.nextNode();
  while (current) {
    textNodes.push(current);
    current = walker.nextNode();
  }
  return textNodes;
}

export function wrapPatternMatches(container, { pattern, className, mode = 'first', excludeSelector }) {
  const textNodes = collectTextNodes(container);
  const globalPattern = pattern.global ? pattern : new RegExp(pattern.source, `${pattern.flags}g`);

  for (const node of textNodes) {
    if (!node.parentElement || node.parentElement.closest(excludeSelector)) continue;
    const original = node.textContent || '';
    if (!globalPattern.test(original)) continue;
    globalPattern.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let last = 0;
    let match = globalPattern.exec(original);

    while (match) {
      if (match.index > last) {
        frag.appendChild(document.createTextNode(original.slice(last, match.index)));
      }

      const trigger = document.createElement('a');
      trigger.href = '#';
      trigger.className = className;
      trigger.textContent = match[0];
      trigger.setAttribute('aria-label', match[0]);
      frag.appendChild(trigger);

      last = match.index + match[0].length;
      match = mode === 'all' ? globalPattern.exec(original) : null;
    }

    if (last < original.length) {
      frag.appendChild(document.createTextNode(original.slice(last)));
    }

    node.parentNode.replaceChild(frag, node);

    if (mode === 'first') return;
  }
}

export function wrapLastMatchPerRule(container, rules, excludeSelector) {
  const textNodes = collectTextNodes(container);
  const combinedPattern = new RegExp(rules.map(rule => `(${rule.pattern.source})`).join('|'), 'gi');
  const ruleForMatch = (match) => rules.findIndex((rule, i) => match[i + 1] !== undefined);

  // Two passes are required because "last occurrence" per rule can only be known
  // once every text node has been scanned.
  const totals = rules.map(() => 0);
  textNodes.forEach(node => {
    if (!node.parentElement || node.parentElement.closest(excludeSelector)) return;
    const original = node.textContent || '';
    let match = combinedPattern.exec(original);
    while (match) {
      const ruleIndex = ruleForMatch(match);
      if (ruleIndex !== -1) totals[ruleIndex] += 1;
      match = combinedPattern.exec(original);
    }
  });

  const seen = rules.map(() => 0);
  textNodes.forEach(node => {
    if (!node.parentElement || node.parentElement.closest(excludeSelector)) return;
    const original = node.textContent || '';
    if (!combinedPattern.test(original)) return;
    combinedPattern.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let last = 0;
    let match = combinedPattern.exec(original);
    while (match) {
      const matchedText = match[0];
      const ruleIndex = ruleForMatch(match);

      if (match.index > last) {
        frag.appendChild(document.createTextNode(original.slice(last, match.index)));
      }

      if (ruleIndex !== -1) {
        seen[ruleIndex] += 1;
        if (seen[ruleIndex] === totals[ruleIndex]) {
          const trigger = document.createElement('a');
          trigger.href = '#';
          trigger.className = rules[ruleIndex].className;
          trigger.textContent = matchedText;
          trigger.setAttribute('aria-label', matchedText);
          frag.appendChild(trigger);
        } else {
          frag.appendChild(document.createTextNode(matchedText));
        }
      } else {
        frag.appendChild(document.createTextNode(matchedText));
      }

      last = match.index + match[0].length;
      match = combinedPattern.exec(original);
    }

    if (last < original.length) {
      frag.appendChild(document.createTextNode(original.slice(last)));
    }

    node.parentNode.replaceChild(frag, node);
  });
}

export function replaceFirstPhraseWithNode(container, phrase, createNode) {
  const escaped = escapeRegExp(phrase);
  const regex = new RegExp(escaped, 'i');
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);
  const textNodes = [];
  let node = walker.nextNode();

  while (node) {
    textNodes.push(node);
    node = walker.nextNode();
  }

  for (const textNode of textNodes) {
    if (!textNode.parentElement || textNode.parentElement.closest('a')) continue;
    const original = textNode.textContent || '';
    const match = original.match(regex);
    if (!match || match.index === undefined) continue;

    const start = match.index;
    const end = start + match[0].length;
    const frag = document.createDocumentFragment();

    if (start > 0) frag.appendChild(document.createTextNode(original.slice(0, start)));
    frag.appendChild(createNode(match[0]));
    if (end < original.length) frag.appendChild(document.createTextNode(original.slice(end)));

    textNode.parentNode.replaceChild(frag, textNode);
    return true;
  }

  return false;
}
