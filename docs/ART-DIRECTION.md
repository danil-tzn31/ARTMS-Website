# ARTMS — Showcase Site · Art Direction & Technical Spec

Personal project by Dani. Single-page scroll narrative showcasing ARTMS
(Modhaus, debuted 2024-05-31) across three eras and five members.

---

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Build | **Vite 8** | No SSR needed; fastest HMR for animation iteration |
| UI | **React 19 + TypeScript** | Typed content model for eras/members |
| Styling | **Tailwind CSS v4** (CSS-first `@theme`) | Design tokens live in CSS vars, so GSAP can tween them directly |
| Scroll | **Lenis** | Required. Driven by the GSAP ticker (single RAF loop) |
| Motion — page | **GSAP 3 + ScrollTrigger** | Scrubbed, pinned, timeline-based storytelling |
| Motion — UI | **Framer Motion** | Member dossier overlay: shared layout + `AnimatePresence` exit |
| Images | **sharp** prebuild script | Sources are 5–38 MB. Non-negotiable. |
| Deploy | Static → Vercel / Netlify | Pure static output |

**Division of labour between the two motion libraries is deliberate, not
redundant:** GSAP owns anything tied to scroll position; Framer Motion owns
anything tied to component mount/unmount. They never animate the same property
on the same element.

### Lenis ↔ GSAP wiring (the part people get wrong)

```ts
const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9 })
lenis.on('scroll', ScrollTrigger.update)
gsap.ticker.add((t) => lenis.raf(t * 1000))
gsap.ticker.lagSmoothing(0)
```

One RAF loop, ScrollTrigger reads Lenis's virtual scroll. Never run
`requestAnimationFrame(raf)` separately alongside the ticker.

---

## 2. Content model

### Eras

| Era | Type | Released | Title track | Tracks |
|---|---|---|---|---|
| **Dall — Devine All Love & Live** | 1st studio album | 2024-05-31 | Virtual Angel | 11 |
| **Club Icarus** | 1st mini album | 2025-06-13 | Icarus | 6 |
| **Hyper-Ego** | 2nd mini album | 2026-08-07 | Blue Blood | 6 |

**Dall** — url / Virtual Angel / Sparkle / The Hitchhiker's Guide to the Galaxy /
Flower Rhythm / Candy Crush / Air / Unf/Air / 조난 (Distress) / Butterfly Effect /
Birth

**Club Icarus** — Club for the Broken / Icarus / Obsessed / Goddess /
Verified Beauty / BURN

**Hyper-Ego** — From Wings To Soul / BORN STUNNER / Blue Blood / ICARUS GANG /
HYPER CRUSH / Pixel Memory

> Haseul does not appear in Hyper-Ego promotional material (she appears only on
> the opening track). The media folder reflects this — there is no `HaseulEgo`
> photo. **The site must handle this as a designed state, not a broken image.**
> Her Hyper-Ego slot renders as a typographic placard: `HASEUL — 부재 / ABSENT ·
> FROM WINGS TO SOUL`. This turns a data gap into the most emotionally loaded
> moment on the page.

### Members

| Member | Hangul | Colour | Animal | Eras |
|---|---|---|---|---|
| Heejin | 희진 | Vivid Pink `#FF2E88` | Rabbit | Dall · Icarus · Ego |
| Haseul | 하슬 | Green `#2FBF71` | White Bird | Dall · Icarus |
| Kim Lip | 김립 | Red `#E01B24` | Owl | Dall · Icarus · Ego |
| Jinsoul | 진솔 | Blue `#1B4FE0` | Blue Betta | Dall · Icarus · Ego |
| Choerry | 최리 | Purple `#8B2FE0` | Bat | Dall · Icarus · Ego |

---

## 3. Palette — the narrative spine

The three era palettes are not decoration; they drive a **global luminance arc**.
Root CSS custom properties are tweened by ScrollTrigger as each era enters, so
the entire page re-skins in place.

```
HERO        Dall             Club Icarus       Hyper-Ego
#08060C  →  #0B0710       →  #050705        →  #EFEDE7
near-black  violet-black     toxic black       off-white
```

| Token | Hero | Dall | Icarus | Hyper-Ego |
|---|---|---|---|---|
| `--bg` | `#08060C` | `#0B0710` | `#050705` | `#EFEDE7` |
| `--ink` | `#E8E6F0` | `#EADCF2` | `#D8FFD8` | `#111111` |
| `--accent` | `#C9A7F0` | `#C9A7F0` | `#00FF5A` | `#E5241B` |
| `--accent-2` | `#FFC2DE` | `#FFC2DE` | `#0B3D1B` | `#8A8580` |

**Why this matters:** the page inverts *itself* by the third era. The manual
invert toggle therefore reads as a theme the site already believes in, rather
than a novelty button bolted on because the reference site had one.

---

## 4. Typography

| Role | Family | Notes |
|---|---|---|
| Display | **Archivo** (variable, wdth 62–125, wght 100–900) | The width axis is animated — headlines compress and expand on scroll |
| Micro / UI | **Space Mono** 400/700 | All labels, metadata, tracklists, nav |
| Angelcore accent | **Instrument Serif** italic | Sparingly — era subtitles, member hangul romanisation |
| Korean | **Noto Sans KR**, subset to 23 glyphs | Hangul only — `npm run fonts` builds a 2.5 kB file instead of the 539 kB published slice |

### Scale

Display type is set in `vw` with `clamp()` floors, deliberately oversized:

- Hero wordmark: `clamp(6rem, 26vw, 34rem)` — **intentionally clipped by the
  viewport edge**, letterforms bleeding off-canvas left and right
- Era titles: `clamp(4rem, 14vw, 20rem)`
- Member index rows: `clamp(3rem, 9vw, 12rem)`
- Micro type: `10px / 0.14em tracking / uppercase` — the deliberate size gap
  between display and micro *is* the visual system

### Grain & ink bleed

A single SVG filter chain, applied to display type via `filter: url(#inkbleed)`:

```
feTurbulence(fractalNoise, baseFrequency .013 .052, octaves 3)
  → feDisplacementMap(scale 2.6)
  → feGaussianBlur(0.45)
  → feComponentTransfer / feFuncA (alpha crush, re-hardens the edge)

The whole chain runs with color-interpolation-filters="sRGB". Two traps worth
recording, both of which cost real time to find:

  · The SVG default is linearRGB, which shifts every colour passing through.
  · Crushing alpha with feColorMatrix leaves premultiplied RGB untouched, so
    the browser divides by the larger alpha on the way out and light glyphs
    render near-black. feFuncA avoids it.
```

`baseFrequency` is animated on a slow 8.3 s loop so the texture breathes. A second
static grain layer (`feTurbulence` at 0.8 opacity, `mix-blend-mode: overlay`)
sits fixed over the whole viewport.

**Performance guard:** SVG filters on huge text are expensive. They are applied
only to elements currently in the viewport, promoted with `will-change: filter`,
and dropped entirely under `prefers-reduced-motion` and below 768 px.

---

## 5. Layout system — how it avoids looking like a template

A 12-column grid exists, but **nothing is allowed to start at column 1 twice in
a row.** Placement rules:

1. **Edge frame.** A hairline rule inset 20 px from all four viewport edges runs
   the full page. The navbar is not *near* the edge — it sits *on* this frame:
   wordmark on the top rule, vertical nav rail on the right rule (gobold-style,
   labels + tick marks), status ticker on the bottom rule, invert toggle on the
   top rule at centre-right in a red-outlined mono box.
2. **Alternating anchor.** Each section anchors from a different edge — Hero
   from the top-left bleed, Eras from the right, Members from a centred axis,
   Footer from the bottom-left.
3. **Overlap is required.** Photos overlap the type layer at ±8–14 % offsets
   with mixed z-order. Nothing sits in a tidy card.
4. **Baseline breaks.** Multi-line statements stagger their indents per line
   (the `bleibtgleich.dev` move) — line 2 starts at col 4, line 3 at col 2.
5. **Numbered markers.** Every section carries a `N°001 / HERO` mono marker in
   the margin (the `pxpush` move), pinned opposite the content anchor.

---

## 6. Section choreography

### N°001 — HERO
Full-bleed `hero.mp4`, desaturated and pushed under a scanline +
grain stack. `ARTMS` at 26 vw clipped top and sides. Corner metadata: `EST.
2024 · MODHAUS`, live KST clock, `5 MEMBERS / 3 ERAS`. On scroll the wordmark
compresses along Archivo's width axis and docks into the top frame rule as the
permanent nav mark — one continuous FLIP, not a fade-swap.

### Interstitial — TRANSMISSION
Full-width mono marquee band. Direction and velocity are driven by Lenis scroll
velocity; it reverses when the user reverses. Cheap, and immediately reads as
hand-built.

### N°002 — ERAS
Three stacked panels, each pinned for the duration of its own reveal. On entry
the root palette tokens tween to that era's set (see §3).

Per panel:
- Era title, enormous, bleeding off the **right** edge, rotated `-90°` on wide
  viewports
- Release date as a large numeral block, bottom-left, mono
- Tracklist as a numbered mono column pinned to the right rail. **Hovering a
  track cross-fades the group photo behind it** and pushes the track number to
  the accent colour
- Group photos in a scattered overlapping cascade at mixed scales, parallaxed at
  differing depths (`y: -8%` to `+14%`)

### N°003 — MEMBERS
**Not a row of five cards.** An oversized index list — five full-width name rows
stacked, each with animal glyph + colour swatch + era ticks as mono metadata.

- Hover: the member's colour floods the row from the left as a clip-path wipe,
  the name switches to inverted ink, and a photo follows the cursor with damped
  lag
- Click: full-screen **dossier overlay** (Framer Motion shared layout). Left
  rail — name, hangul, animal, colour hex, era participation. Right — per-era
  photo strip with era tabs. `Esc` and a mono close control both dismiss; focus
  is trapped and restored to the originating row

### N°004 — FOOTER
Giant `ARTMS` wordmark scanline-warped across the full width (`pxpush` move).
Credits grid for media owners and scanners. Invert toggle, back-to-top, KST
timestamp, `© 2026 — FAN PROJECT · NOT AFFILIATED WITH MODHAUS`.

---

## 7. Global effects

| Effect | Implementation |
|---|---|
| Scanlines | Fixed `repeating-linear-gradient`, 3 px pitch, `mix-blend-mode: overlay`, slow vertical drift + rare flicker keyframe |
| Grain | Fixed SVG `feTurbulence` layer, `overlay`, 0.08 opacity |
| Invert mode | `filter: invert(1) hue-rotate(180deg)` on the root wrapper — media inverts too, deliberately. Persisted per visitor |
| Cursor | Mono crosshair with contextual label (`VIEW` / `DRAG` / `CLOSE`). Hidden on touch |
| Chromatic aberration | ±1 px R/B offset on display type during fast scroll only, driven by Lenis velocity |

---

## 8. Non-negotiables

- **`prefers-reduced-motion`**: all scrubbed timelines resolve to their end
  state, scanline drift and flicker stop, marquees hold still. The site stays
  fully legible and complete.
- **Keyboard**: member rows are real `<button>`s; the dossier traps focus and
  restores it on close.
- **Images**: `sharp` emits AVIF + WebP at 640 / 1280 / 1920 with a base64
  LQIP blur-up — 23 sources, 69 derivatives per format, 13 MB total. Sources
  stay untouched in `artms media resources`.
- **Video**: the 60 s 1080p master is denoised (grain destroys inter-frame
  compression — a straight 720p/CRF30 pass was still 17 MB), scaled to 960p24
  and encoded H.264 CRF 36 → 5.3 MB, plus a 39 kB poster. VP9 is opt-in only:
  every browser that runs this site plays H.264, and the VP9 pass costs minutes
  of CPU to save bytes nobody downloads twice.
- **No dead placeholder content.** Every string on the page is real.

---

## 9. Build phases (one commit each)

1. Scaffold + tooling + design tokens + asset pipeline
2. Shell: edge frame, navbar, scanlines, grain, invert, Lenis/GSAP wiring
3. Hero
4. Eras
5. Members + dossier overlay
6. Footer + credits
7. Polish: reduced-motion, a11y pass, perf budget, deploy config
