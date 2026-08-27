# ARTMS — Virtual Angel Archive

A fan-made showcase site for the K-pop group **ARTMS**, built as a single-page
scroll narrative across their three eras: *Dall (Devine All Love & Live)*,
*Club Icarus*, and *Hyper-Ego*.

Not affiliated with Modhaus. All photography belongs to its respective owners
and scanners — see the credits section of the site.

---

## Quick start

```bash
npm install
npm run dev
```

> **First run on a new machine:** run `npm install` locally even if
> `node_modules/` is already present. `sharp`, `rollup` and `esbuild` ship
> platform-specific binaries, and a tree installed on another OS will not run.

Then, once, to generate the assets the site loads:

```bash
npm run media    # responsive AVIF/WebP derivatives + LQIP placeholders
npm run video    # hero video re-encode + poster frame
npm run fonts    # 2.5 kB Korean subset
```

`public/media/` and `public/fonts/` are committed, so this is only needed after
changing the source scans.

---

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check, then production build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run media` | Rebuild image derivatives (resumable; `-- --force` to redo all) |
| `npm run video` | Re-encode the hero video and poster |
| `npm run fonts` | Rebuild the Korean font subset |
| `npm run lint` | oxlint |
| `npm run format` | Prettier |
| `npm run typecheck` | `tsc` only |

---

## Stack

- **Vite 8** + **React 19** + **TypeScript** (strict)
- **Tailwind CSS v4** — CSS-first `@theme`; era palettes are plain custom
  properties so GSAP can tween them directly
- **GSAP 3 + ScrollTrigger** — everything tied to scroll position
- **Framer Motion** — everything tied to mount/unmount (the member dossier)
- **Lenis** — smooth scroll, driven by the GSAP ticker on a single RAF loop
- **sharp** / **ffmpeg** / **subset-font** — build-time asset pipeline

The two animation libraries have a hard boundary: GSAP owns scroll, Framer
Motion owns presence. They never animate the same property on the same element.

---

## Source media

The original scans are multi-megabyte files and are **not** in this repo. They
live beside it, in a folder the pipeline reads at build time:

```
Downloads/
├─ artms/                    ← this repo
└─ artms media resources/    ← originals (Group/, Members/, Hero Video/)
```

Point the pipeline elsewhere with `MEDIA_SRC`:

```bash
MEDIA_SRC="/path/to/scans" npm run media
```

`scripts/media.config.mjs` maps every source filename to the slug the app refers
to it by. That mapping is explicit on purpose — renaming a scan fails loudly
instead of silently dropping a photo from the page.

---

## Structure

```
src/
├─ components/
│  ├─ chrome/       edge frame, nav rail, scanlines, grain, cursor, marquee
│  └─ sections/     hero, eras, members, credits
├─ data/            eras, members, credits, generated media manifest
├─ lib/             gsap setup, lenis, era palette driver, formatting
└─ styles/          tokens, base, effects
```

- Art direction, layout rules and section choreography:
  [`docs/ART-DIRECTION.md`](docs/ART-DIRECTION.md)
- Git commands for this repo, with commit-message conventions:
  [`docs/GIT.md`](docs/GIT.md)

## Deploy

Static output, hosted on Vercel — `vercel.json` carries the build command and
the cache policy. Two tiers, because only one of them is fingerprinted:

- `/assets/*` is hashed by Vite and can never go stale, so it gets a year,
  `immutable`.
- `/media/*`, `/brand/*` and `/fonts/*` keep stable, meaningful filenames, so
  they get a week with a month of `stale-while-revalidate` — fast on repeat
  visits, but a rescanned photo is not stranded in caches for a year.

`vercel.json` is validated against a strict schema on deploy; it rejects any
key it does not know, comments included, so the reasoning lives here instead.

## Status

| Phase | | |
|---|---|---|
| 1 | Scaffold + tooling | done |
| 2 | Asset pipeline (images, video, fonts, brand) | done |
| 3 | Shell — edge frame, nav rail, screen effects, scroll wiring | done |
| 4 | Hero | done |
| 5 | Preloader + brand assets + type scale | done |
| 6 | Eras | done |
| 7–8 | Member index + dossier | done |
| 9 | Footer + credits | done |
| 10 | Polish, a11y, perf, deploy | done |

## Measured

| | Target | Actual |
|---|---|---|
| JS, first load (gzip) | < 130 kB | **127 kB** — app 82.7 + GSAP 44.4 |
| Deferred (gzip) | — | 43.1 kB dossier + Framer Motion, fetched on hover |
| CSS (gzip) | < 12 kB | **6.9 kB** |
| LCP (local) | < 2.5 s | **0.50 s** |
| CLS | < 0.1 | **0.0001** |
| Horizontal scroll | none | none at 390 / 768 / 1024 / 1440 / 1920 |
| Tab stops | all visible | 36, all with a focus ring |

---

## Accessibility

- `prefers-reduced-motion` resolves every scrubbed timeline to its end state;
  scanline drift, the CRT sweep and the marquee all stop. The site stays
  complete and legible.
- Member rows are real buttons; the dossier traps focus and restores it on close.
- The invert control is a real toggle with `aria-pressed`.
