/* The content, the studio way (JAMstack): data/site.json says what is
   published and in which list ("lists", in order); each project lives in
   projects/<slug>/project.json with its photos in img/1.webp, 2.webp…
   Fields in English, languages per field ({ "en", "ca" }).

   The site's JS (render.js, the effects) still works with the old shape:
   { slug: [ { image, group, title_cat, title_en, text_cat, text_en, links } ] }.
   toSlides() turns one into the other, so the JS and the build don't change.
   Used by the browser (js/core/data.js) and by build/build.mjs: no DOM, no disk. */

// "lists": { "about": { "projects": [...] }, "work": … } → ["about", "god", …]
export const listedSlugs = (site) =>
  Object.values(site.lists || {}).flatMap((list) => list.projects || []);

export function toSlides(site, projects) {
  const out = {};
  // a text is "the same in every language" or { "en": …, "ca": … }; the JS says 'cat'
  const pair = (key, v) => (v && typeof v === 'object' && !Array.isArray(v)
    ? { [`${key}_en`]: v.en, [`${key}_cat`]: v.ca }
    : { [`${key}_en`]: v, [`${key}_cat`]: v });
  Object.values(site.lists || {}).forEach((list, i) => {
    for (const slug of list.projects || []) {
      const p = projects[slug];
      const photos = (p.photos || []).map((n) => `projects/${slug}/img/${n}.webp`);
      const first = {
        ...pair('text', p.text),
        links: (p.links || []).map((l) => ({
          url: l.url, ...pair('text', l.text), ...pair('prefix', l.prefix), spacer_before: !!l.space,
        })),
      };
      // one slide per photo (the text and the links, on the first one); the
      // list is the group: the gaps in the menu go between lists
      out[slug] = (photos.length ? photos : [null]).map((image, k) => ({
        image, group: i + 1, ...pair('title', p.title), ...(k ? {} : first),
      }));
    }
  });
  return out;
}
