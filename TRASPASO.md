# Traspaso: la web a la cuenta de Max

Max ya tiene su copia, `maxazc/web`, que publica `maxazemar.com` con GitHub
Pages (*legacy*: sirve los ficheros de `main` tal cual). Es la versión de antes
(un `data.json`, sin build): sus direcciones `/en/god` dan **404** (las sirve el
`404.html`) y Google no las ve. La nueva la publica su Cloudflare con
Workers Builds; el DNS de `maxazemar.com` ya está en Cloudflare.

Todo viaja dentro del repositorio: el código, los JSON, las fotos y cómo se
publica (`wrangler.jsonc`). En su copia la Action no corre (lleva
`if: github.repository_owner == 'meowrhino'`) y el build, al no estar en
GitHub, publica en la raíz con el `url` de `site.json`.

Tiempo: unos 30 minutos, más lo que tarden los DNS.

## Antes

- [ ] `main` de meowrhino al día y sin cambios a medias (`git status` limpio).
- [ ] ¿Ha tocado algo Max en su copia desde el 2026-06-17 (su último commit)?
      `gh api repos/maxazc/web/commits --jq '.[0:3][].commit.message'`. Si sí, pasar
      sus cambios aquí antes de seguir (`data.json` → `projects/<slug>/project.json`).
- [ ] Que nos deje escribir en `maxazc/web`: Settings → Collaborators → `meowrhino`,
      con **Write** (hoy no podemos).
- [ ] El DNS de `maxazemar.com` está en Cloudflare (`*.ns.cloudflare.com`). Mirar **en
      qué cuenta**: tiene que ser la de Max.

## 1. La versión nueva, en una rama de su copia

Las dos copias no comparten historia. Se sube a una rama aparte para que su web
siga igual mientras se prepara Cloudflare:

- [ ] `git push https://github.com/maxazc/web.git main:receta`

## 2. Cloudflare (con Max, en su cuenta)

- [ ] **Workers & Pages → Create → Import a repository** → `maxazc/web`, rama de
      producción **`receta`**. Lo demás lo lee de `wrangler.jsonc` (instala sharp con
      `npm install`, build `node build/build.mjs`, sale `dist/`).
- [ ] Mirar la web en su `*.workers.dev`: el about, un proyecto con su efecto (`/god/`,
      `/arbre/`), el catalán (`/ca/foc/`).
- [ ] **Settings → Domains & Routes → Add → Custom domain**: `maxazemar.com` (y `www`).
      Cloudflare cambia los registros que apuntaban a GitHub Pages.

## 3. `main` pasa a ser la versión nueva

- [ ] Guardar la de antes: `git push https://github.com/maxazc/web.git <sha-de-su-main>:refs/heads/antes`.
- [ ] `git push --force-with-lease=main:<sha-de-su-main> https://github.com/maxazc/web.git main`
      (desde nuestra `main`).
- [ ] En Cloudflare, rama de producción → **`main`**. Borrar la rama `receta`.
- [ ] Max, en su repo: Settings → Pages → **Unpublish site** (ya no sirve nada).

## 4. Que nos deje entrar en Cloudflare

- [ ] Manage account → Members → nos invita. Ahí se ve el error entero de un build que falla.

## 5. Comprobar en su dominio

- [ ] El about, `/god/`, `/ca/god/`, y una dirección vieja (`/en/god` → `/god/`).
- [ ] `curl -sI https://maxazemar.com/god/` da **200** (antes, 404).
- [ ] `view-source:`: `canonical` y `og:url` con `maxazemar.com`, y **sin**
      `<meta name="robots" content="noindex">`.
- [ ] `/robots.txt` dice `Allow` y `/sitemap.xml` tiene las direcciones de su dominio.
- [ ] Compartir un proyecto por WhatsApp: sale su foto (la og).

## 6. Search Console, con su cuenta de Google

- [ ] Dar de alta el dominio (el registro TXT, en el DNS de Cloudflare) y enviar `sitemap.xml`.

## 7. Max en su ordenador

Con él delante, siguiendo [GUIA.md](GUIA.md) ("La primera vegada"):

- [ ] Clona **su** repositorio, no el de meowrhino (si ya lo tenía, **Sincronitza**: la
      estructura cambia entera).
- [ ] Live Server: **Go Live** y ve la vista prèvia.
- [ ] Un cambio pequeño (una coma en el about), Confirma → Sincronitza, y la boleta verde.

## 8. Al acabar

- [ ] Fila de maxito en `JAMstack/inventario.md` con las dos direcciones (github.io y su dominio).
- [ ] La copia de meowrhino sigue en github.io con `noindex`: no compite en Google.
