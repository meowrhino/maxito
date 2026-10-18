# Guia de la web

El portfoli de Max Azemar. <https://maxazemar.com>

> **Regla d'or: només toques `data/` i `projects/`.** La resta és el codi.

## Què hi ha

```
data/site.json             el nom, el domini i el menú: quins projectes surten, en quin ordre
data/CV.pdf, …             els PDF que enllacen els textos
projects/<slug>/           un projecte, una carpeta:
  project.json               els seus textos i enllaços
  img/                       les seves fotos: 1.webp, 2.webp…
```

El **slug** és el nom de la carpeta i el de l'adreça: `projects/god/` →
`maxazemar.com/god/`. Minúscules, números i guions, sense accents ni espais.
**No el canviïs** un cop publicat: trencaria els enllaços que ja circulen.

## La primera vegada: preparar VS Code

Només es fa un cop.

1. A VS Code: **Fitxer → Nova finestra** i, a la benvinguda, **Clona el repositori Git…** →
   **Clona des de GitHub**. Entra amb el teu compte, tria el teu repositori i una carpeta.
2. En obrir-la, VS Code et proposa instal·lar **Live Server** (a baix a la dreta): **Instal·la**.
3. A baix a la dreta surt **Go Live**: és la vista prèvia.

**VS Code t'ajuda amb els camps**: si passes el ratolí per sobre d'un (`"title"`, `"photos"`…)
et diu què és, i si n'escrius un malament o hi poses una cosa que no toca, ho subratlla en
vermell. Per veure quins camps pots posar, dins de les claus prem **Ctrl+Espai**. Ho sap per
la primera línia de cada JSON (`"$schema": …`): **no l'esborris**.

## Afegir un projecte, pas a pas

1. **Copia una carpeta** de `projects/` que s'hi assembli i posa-li el nom nou (el slug):
   `projects/arbre/` → `projects/bosc/`.
2. **Les fotos**: passa-les per [imgToWeb](https://meowrhino.github.io/imgToWeb/), **en Chrome o
   Firefox** (Safari no sap fer `.webp`), qualitat 85 %. Surten numerades (`1.webp`, `2.webp`…):
   esborra les de la carpeta copiada i posa-hi aquestes a `img/`.
3. **Els textos**: obre `project.json` i canvia el que calgui (els camps, a sota).
4. **Al menú**: a `data/site.json`, afegeix el slug a la llista on vulguis que surti, al lloc
   on vulguis que surti: `"projects": ["god", "bosc", "foc"]`.
5. **Go Live** per veure-ho, i després **Pujar els canvis**.

Per **treure** un projecte de la web, treu-lo de la llista de `data/site.json`: la carpeta es
pot quedar.

## Els camps d'un projecte (`project.json`)

```json
{
  "title": "GOD TO GREAT",
  "text": {
    "en": ["First paragraph…", "Photo by: <a href='https://bbonaventura.com/'>Bernat Bonaventura</a>"],
    "ca": ["Primer paràgraf…", "Foto per: <a href='https://bbonaventura.com/'>Bernat Bonaventura</a>"]
  },
  "photos": ["1"],
  "links": [
    { "text": "CV.pdf", "url": "data/CV.pdf" },
    { "text": "meowrhino.studio", "url": "https://meowrhino.studio", "prefix": "web: ", "space": true }
  ]
}
```

| camp | què fa |
|---|---|
| `title` | el títol, al menú i a la pàgina. Si és igual en els dos idiomes, un sol text; si no, `{ "en": "…", "ca": "…" }` |
| `text` | el text, una llista de paràgrafs per idioma. Un enllaç dins del text: `<a href='https://…'>així</a>` (amb cometes simples); un PDF de la web: `<a href='data/CV.pdf'>així</a>`. També `<em>cursiva</em>` i `<strong>negreta</strong>`. El principi surt a Google |
| `photos` | les fotos de `img/`, pel número i sense `.webp`: `["1", "2"]`. Cada una és una diapositiva; el text surt amb la primera. La primera surt també en compartir l'enllaç |
| `links` | *opcional*: els enllaços de sota el text. `text` (el que es llegeix), `url` (on porta), `prefix` (*opcional*, el que va abans sense enllaç) i `space: true` (*opcional*, un espai abans) |

Els grups del menú són les llistes de `data/site.json` (`about`, `work`, `collective`): entre
una i l'altra hi ha un espai. **`about` ha de ser el primer**: és la portada.

## Veure-ho abans de pujar-ho

**Go Live** a baix a la dreta de VS Code. S'obre la web al navegador i es refresca sola cada
cop que deses. Si hi ha alguna cosa que no es publicaria (una coma, un camp mal escrit), surt
en pantalla en lloc de la web, i diu on.

## Pujar els canvis

1. Pestanya **Control de codi font** (les tres boletes unides, a l'esquerra).
2. Escriu què has fet (`projecte nou: bosc`) i **Confirma** (*Commit*). Si pregunta si vols
   afegir tots els canvis: **Sí**.
3. **Sincronitza els canvis** (*Sync*).
4. En un parell de minuts és a la web. A GitHub, al costat de l'últim canvi surt una boleta:
   groc és que està publicant, verd que ja està, vermell que alguna cosa no quadra.

**Abans de començar a tocar**, dona també a **Sincronitza**, per baixar el que hagi canviat.

## Què surt a Google i en compartir

| on | d'on surt |
|---|---|
| el títol de la pàgina | `title` del projecte, i el nom de `data/site.json` |
| el text de sota, a Google | el principi del primer paràgraf de `text` |
| la imatge en compartir (WhatsApp, Instagram…) | la primera foto de `photos`, que la web posa en el format que toca |

## Si surt en vermell

La web no es trenca: es queda com estava fins que s'arregla. Clica la boleta vermella, després
**Details**, i llegeix l'últim missatge, que diu el fitxer i què passa:

- **"no és un JSON vàlid"** → gairebé sempre **una coma** de més o de menys, o unes cometes
  sense tancar, a prop d'aquella línia.
- **"\"fotos\" no és un camp d'aquí (mal escrit?). Els que hi ha: title, text, photos, links"** →
  un camp mal escrit: copia'l de la llista que surt al missatge.
- **"\"photos\" diu \"3\", i no hi ha cap img/3.webp"** → a `photos` hi ha una foto que no és a `img/`.
- **"\"lists\" diu \"bosc\", i no hi ha cap projects/bosc/project.json"** → el slug de
  `site.json` i el nom de la carpeta no són iguals.

Els avisos amb ⚠ no aturen res: només diuen que alguna cosa potser no és com volies.
