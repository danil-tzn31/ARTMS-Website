# ARTMS — Showcase Site · Art Direction & Technical Spec

Personal project by Dani. A single-page scroll narrative for ARTMS (Modhaus,
debuted 2024-05-31): a hero, three eras, five members told as one story, and a
credits page that names whose work all of it is.

---

## 1. Stack

| Layer | Choice | Why |
|---|---|---|
| Build | **Vite** | No SSR needed; fastest HMR for animation iteration |
| UI | **React 19 + TypeScript** | Typed content model for eras, members and the members' story |
| Styling | **Tailwind CSS v4** (CSS-first `@theme`) | Design tokens live in CSS vars, so GSAP can write them directly |
| Scroll | **Lenis** | Smooth scroll, driven by the GSAP ticker (single RAF loop) |
| Motion — page | **GSAP 3 + ScrollTrigger** | Scrubbed, pinned, timeline-based storytelling |
| Motion — UI | **Framer Motion** | The member dossier only: `AnimatePresence` for its exit. Code-split, loaded on first intent |
| Images | **sharp** prebuild script | Sources run 0.7–38 MB. Non-negotiable |
| Video | **ffmpeg** prebuild script | A 366 MB master becomes two small web files |
| Deploy | Static → Vercel | Pure static output |

**The two motion libraries split by job, not by taste:** GSAP owns anything
tied to scroll position; Framer Motion owns anything tied to mount and
unmount. They never animate the same property on the same element.

### Lenis ↔ GSAP wiring

```ts
const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9 })
lenis.on('scroll', () => ScrollTrigger.update())
gsap.ticker.add((t) => lenis.raf(t * 1000))
gsap.ticker.lagSmoothing(0)
```

One RAF loop; ScrollTrigger reads Lenis's scroll. Never run a separate
`requestAnimationFrame` alongside the ticker. While the dossier is open the
ticker callback comes off and the global timeline pauses — stopping Lenis
alone stops the scrolling, not the work.

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

> Haseul does not appear in Hyper-Ego promotional material — she appears only
> on the opening track. There is no `HaseulEgo` photo, and **the site treats
> that as a designed state, never a broken image**: an empty dashed circle in
> her chapter, and a `부재 / ABSENT` placard in her dossier.

### Members

| Member | Hangul | Colour | Animal | Eras |
|---|---|---|---|---|
| Heejin | 희진 | Vivid Pink `#FF2E88` | Rabbit | Dall · Icarus · Ego |
| Haseul | 하슬 | Green `#2FBF71` | White Bird | Dall · Icarus |
| Kim Lip | 김립 | Red `#E01B24` | Owl | Dall · Icarus · Ego |
| Jinsoul | 진솔 | Blue `#1B4FE0` | Blue Betta | Dall · Icarus · Ego |
| Choerry | 최리 | Purple `#8B2FE0` | Bat | Dall · Icarus · Ego |

### The members' story

The members section follows xio_orbit's reading of the group, *ARTMS' Map of
the Soul*: the five members as five parts of one psyche, from the face shown
to the world down to the part kept deepest. The chapters run in that order,
not the order of `MEMBERS`.

| Depth | Member | Part | Where |
|---|---|---|---|
| 01 | Choerry | Persona | the surface |
| 02 | Kim Lip | Ego | under the surface |
| 03 | Heejin | Self | the centre |
| 04 | Jinsoul | Shadow | below |
| 05 | Haseul | Anima | the deepest |

The words — a line per part, a line per member per era, an optional prologue —
live in `src/data/member-story.ts` and are mine to write. Every one of them can
be empty: a missing part line falls back to the part's name, a missing era
line to the era's title track. Nothing placeholder-ish ever renders.

---

## 3. Palette — the narrative spine

The palettes are not decoration; they drive a **luminance arc** across the
whole page. Every surface reads from root custom properties, so changing them
re-skins everything at once.

```
HERO        Dall          Club Icarus     Hyper-Ego   Members            Roll call
#08060C  →  #0B0710   →   #050705     →   #EFEDE7  →  light, then dark → light
near-black  violet-black  toxic black     off-white   from the Shadow
```

| Token | Hero | Dall | Icarus | Hyper-Ego | Members, Shadow on |
|---|---|---|---|---|---|
| `--bg` | `#08060C` | `#0B0710` | `#050705` | `#EFEDE7` | `#0C0C0E` |
| `--ink` | `#E8E6F0` | `#EADCF2` | `#D8FFD8` | `#121110` | `#ECEAE5` |
| `--accent` | `#C9A7F0` | `#C9A7F0` | `#00FF5A` | `#E5241B` | the member's colour |

- **Eras fade.** Each era panel crossfades the palette as it enters
  (`useEraTheme`). Three changes, far apart, with nothing sticky on screen.
- **Members cut.** In the members section the accent becomes each member's
  colour, and the page turns dark from Jinsoul's chapter down (`useDepthTheme`).
  Those changes are cuts, not fades: a fading root variable restyles and
  repaints the whole page every frame, and with the sticky figures and their
  filters on screen that made the Heejin → Jinsoul boundary visibly stutter.
  Measured at 4× CPU throttle, the cut took dropped-frame time from 1.3 s to
  about 0.75 s — the same as not changing the palette at all.
- `--rule` and `--rule-strong` are mixed from `--ink` in `tokens.css`, so they
  follow every change by themselves. Nothing writes them directly.

By the third era the page has inverted *itself*, which is why the manual
invert toggle reads as a theme the site already believes in rather than a
novelty. It lives on the top frame rule only.

---

## 4. Typography

| Role | Family | Notes |
|---|---|---|
| Display | **Archivo** (variable, wdth 62–125, wght 100–900) | Width set per role and held — the hero at 78, the preloader at 74. **The width axis never animates**: tried on the hero, it read as a stretched mark until you scrolled |
| Micro / UI | **Space Mono** 400/700 | Labels, metadata, tracklists, nav |
| Statement serif | **PP Right Didone** Light Italic | Statements, era subtitles, era names in the member chapters, part names on the map |
| Era titles | **Ancial** (Club Icarus), **Aboensis** (Hyper-Ego) | Uppercase-only faces, one static weight each. Set in the era title and its marquee item, nowhere else. Dall stays in Archivo |
| Korean | **Noto Sans KR**, subset to 23 glyphs | Hangul only — `npm run fonts` builds a 2.5 kB file instead of the 539 kB published slice |

Ancial and Aboensis are subset to the handful of capitals they actually draw
(3.4 kB and 6.7 kB) — `CLUB ICARUS` and `HYPER-EGO`, space and hyphen included.

### Scale

Display type is set in `vw` with `clamp()` floors, deliberately oversized.

- **Hero wordmark** — `clamp(6.5rem, 39vw, 50rem)`, clipped by the viewport
  edge on purpose.
- **Era titles** — sized so the longest line spans the viewport exactly. The
  size comes from each face's **ink width**, measured in the browser, not its
  advance width: for a grotesque the two agree, but Aboensis draws 8% wider
  than its advance and starts left of its own origin. Hyper-Ego is held to
  72% of the width — at full width its two lines stood taller than the screen.
- **Member names** — `clamp(4rem, 9vw, 9rem)`; the outlined name behind each
  figure runs `clamp(8rem, 21vw, 24rem)` off the left edge.
- **Statements** — `clamp(1.9rem, 4.2vw, 4.4rem)` on the members map and the
  roll call; `clamp(1.5rem, 3.2vw, 3.4rem)` elsewhere.
- **Micro type** — 12–15 px, `0.1–0.13em` tracking, uppercase. Small next to
  the display sizes, never small enough to squint at.

### Ink bleed

One SVG filter chain on display type, `filter: url(#inkbleed)` (and a softer
`#inkbleed-soft` for mid-size headings):

```
feTurbulence(fractalNoise, baseFrequency .013 .052, octaves 3)   — static
  → feDisplacementMap(scale 2.6)
  → feGaussianBlur(0.45)
  → feComponentTransfer / feFuncA   (alpha crush, re-hardens the edge)
```

Two traps, both of which cost real time:

- The chain runs with `color-interpolation-filters="sRGB"`. The SVG default is
  linearRGB, which shifts every colour passing through.
- The alpha crush uses `feFuncA`, not `feColorMatrix`. Boosting alpha in a
  colour matrix leaves premultiplied RGB untouched, so light glyphs render
  near-black.

The turbulence is static. It used to animate `baseFrequency` so the texture
breathed, and together with a drifting scanline layer that held the page at
11.7 fps while it sat still. The filter also switches off while the page is
scrolling, below 768 px, on touch screens and under reduced motion — the
texture is for when the page is still, which is when it can be seen.

---

## 5. Layout system — how it avoids looking like a template

A 12-column grid exists, but **nothing starts at column 1 twice in a row.**

1. **Edge frame.** A hairline rule inset 20 px (28 px from `lg`) runs the full
   page. The navigation sits *on* it: wordmark on the top rule, the invert
   toggle centred on the top rule, the section rail on the right rule, the
   fan-archive notice and live KST clock on the bottom rule.
2. **Alternating anchor.** Hero from the top-left bleed, eras alternating
   edges, members down the centre line, credits back to the bottom-left.
3. **Overlap is required.** Photos overlap type at mixed z-order. Nothing
   sits in a tidy card.
4. **Staggered statements.** Multi-line statements break by hand and indent
   unevenly per line.
5. **Numbered markers.** Every section carries an `N°00x / NAME` mono marker
   with a hairline running out to the frame.

---

## 6. Section choreography

### Preloader
Two and a half seconds — one rotation of the sigil — then gone for the
session. A boot sequence loading the three eras by name, not a percentage of
anything. Skipped under reduced motion.

### N°001 — HERO
The hero footage full-bleed, graded down (`brightness .92 · saturate .82`)
and pushed under the scanline and grain stack. `ARTMS` at wdth 78 sits over it
with `mix-blend-mode: difference`, so it inverts whatever the footage is doing.
Label and member count top-left, live Seoul time top-right, and bottom-left a
serif line — *Angel software, booting.* — over the three era names. The hero
pins for 90% of a screen while the wordmark rises and shrinks and the footage
pushes in.

### Interstitial — TRANSMISSION
A mono ticker at display size on an opaque band, inset to the frame. Words
alternate solid and outlined; Club Icarus and Hyper-Ego are set in their own
faces. It drifts on its own, speeds up with scroll velocity, and reverses when
the scroll does.

### N°002 — ERAS
Three panels, not pinned — the palette change carries the beat, and three
pinned screens in a row feels like the page has stopped responding.

- The title spans the viewport flush to one edge, alternating sides, and wipes
  in from its baseline.
- Subtitle and statement in the serif; release type and a large dotted date.
- Tracklist on a sticky right rail. Hovering or focusing a track crossfades
  the panel's photo; every photo is also visible in the cascade.
- Group photos in a hand-placed cascade — a `{ top, left, width, rotate, z,
  ratio }` per photo, never a formula — parallaxed at depths from 0.4 to 1.4.

### N°003 — MEMBERS
The members as a descent through one soul.

**The map.** The statement *Five members. / One soul, / split five ways.*,
then five overlapping circles on the page's centre line, outer world at the
top, inner world at the bottom. A line draws down the axis with a spark on its
tip that takes each member's colour as it enters her circle; each circle opens
as the line reaches it. The circles are filled, so the line passes behind
them. The page darkens behind Shadow and Anima, previewing the descent. Each
circle is a button to its chapter.

**The chapters.** Figure left, text right. Each member has one background-cut
photo standing in a circle of her colour, her head breaking out of the top.
The figure is sticky while three era beats scroll past; each beat changes how
she looks, not which photo shows:

| Era | Look |
|---|---|
| Dall | White bloom — brightness lift and a double white glow |
| Club Icarus | Pulled halfway to a single toxic-green ramp (`#era-toxic`), with a green glow |
| Hyper-Ego | Red echoes (`#era-echo-red`) offset behind her, kept inside the circle |

The three looks are stacked copies of one image; a `data-active` attribute
written straight from the scroll triggers picks the visible one, so scrolling
never re-renders anything. Each figure's fit in its circle — height, head
position, how far the crown breaks out — is hand-tuned per member in
`FIGURE_FIT`, so heads come out close in size across very different photos.

On the right: chapter number and depth, name, hangul, animal, colour, the
part line, then the three beats, the last one ending in **Open the full
file**. The chapter's line runs down the centre of the page in her colour,
continuing the map's axis, with her spark on its tip.

A **depth rail** on the left edge — Persona to Anima — shows where you are
and jumps between chapters. Desktop only.

**Haseul.** Her Hyper-Ego beat leaves the circle standing without her: the
figure fades, the circle turns dashed, and `부재 / ABSENT / Present on — From
Wings To Soul` sits inside it. Her line turns dashed across that beat.

**The dossier.** A full-screen record per member: name, hangul, legal name,
birth date, animal, colour, eras, and era tabs over a fixed 4:3 photo frame.
The frame never changes shape between tabs; every photo's crop is aimed with
its own `object-position`. Escape, the close button and the backdrop all
dismiss it; focus is trapped while open and returned to the button that opened
it.

**The roll call.** The line keeps going into the last screen and draws to its
centre. When the screen pins, the spark splits into five — one per member, in
depth order — and each flies to a stack and swells into her circle. The five
slide into one spot (`multiply`, isolated so the line stays behind), the stage
grows to full size, and the wordmark and *Five members — one soul* settle over
it.

### N°004 — CREDITS
Anchored bottom-left. *None of this is mine. / It is only gathered.* — the
fan-archive statement set large, not buried in small print. Credits for media,
scans and the lore reading; a colophon naming every typeface and its designer;
back to top, a live Seoul timestamp, and a full-width `ARTMS` wordmark that
wipes in as the last thing on the page.

---

## 7. Global effects

| Effect | Implementation |
|---|---|
| Scanlines | Fixed `repeating-linear-gradient`, 3 px pitch, `overlay` at rest. Static — the drift held the page at 11.7 fps while it sat still |
| Grain | Fixed SVG `feTurbulence` layer, `overlay` at rest |
| While scrolling | Scanlines and grain drop their blend mode (opacity compensated) and the ink bleed switches off; a blended full-viewport layer re-blends every frame |
| Invert mode | `filter: invert(1) hue-rotate(180deg)` on `html` — **never on a wrapper**, which would become the containing block for every fixed element and break the frame, the overlays and ScrollTrigger's pin. Persisted per visitor and restored before first paint |
| Cursor | Mono crosshair with a contextual label (`OPEN`, `CLOSE`…) read from `data-cursor`. Fine pointers only |
| Chromatic split | ±1.2 px red/cyan offset on headings marked `data-chroma`, driven by scroll velocity and declared only while moving. The velocity loop sleeps when the page is still |

---

## 8. Media pipeline

**Images** — `npm run media`. 27 sources: 8 group shots, 14 member photos and
5 background-cut figures. Each becomes AVIF + WebP at 640 / 1280 / 1920, plus
one at the source's own width when it is narrower than 1920 — without that, a
1877 px photo topped out at 1280 and looked soft on a retina screen. Photos get
a 20 px LQIP blur-up; cut-outs don't (a blurred silhouette is a smudge) and
keep their alpha. Cut-outs are trimmed to their silhouette so every crown sits
at the top of its box. `MEDIA_ONLY=slug,slug` redoes just those files.
Sources stay untouched in `artms media resources`.

**Video** — `npm run video`. The master is a 54 s 4K/60 clip. It is denoised
(grain wrecks inter-frame compression), scaled, dropped to 24 fps and encoded
H.264 CRF 38 at two widths: 960 (5.2 MB) for phones and 1280 (9.1 MB) from
1024 px up, chosen by the `<video>` itself. 1920 came out near 20 MB and,
under the scanlines and grain, did not look four times better. A poster frame
and a 1200×630 Open Graph image come from the same pass. VP9 is opt-in only.

---

## 9. Non-negotiables

- **`prefers-reduced-motion`**: the preloader is skipped, every scrubbed
  timeline resolves to its end state, the marquee and CRT sweep hold still,
  the chromatic split never renders, the member figures show the plain photo,
  and the roll call is its final frame. The page stays complete and legible.
- **Below `lg`**: nothing pins or sticks. Chapters stack figure, text, beats;
  the depth rail and the lines are desktop only.
- **Keyboard**: every interactive thing is a real `<button>` or `<a>`; map
  circles, rail ticks and file buttons included. The dossier traps focus and
  returns it.
- **No dead placeholder content.** Every string on the page is real, and every
  credit is one that was checked — a wrong attribution is not a smaller error
  than a missing one.
