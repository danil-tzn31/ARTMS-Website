import { useRef, useState } from 'react'
import type { Era } from '@/types'
import { Picture } from '@/components/Picture'
import { SectionMarker } from '@/components/SectionMarker'
import { formatDotted } from '@/lib/format'
import { gsap, ScrollTrigger, useGSAP, wipe } from '@/lib/gsap'

/**
 * Where each photo sits inside its panel. Hand-authored per era rather than
 * generated: a formula produces a grid wearing a costume, and the whole point
 * of this section is that it should not look placed by a machine.
 *
 * `top`/`left` are percentages of the panel box, `w` is a viewport width, and
 * `depth` scales the parallax so the images separate as they travel.
 */
interface Shot {
  top: string
  left: string
  /** Desktop width, in vw. */
  w: string
  rotate: number
  z: number
  depth: number
  /**
   * Frame aspect ratio. Defaults to FRAME (4:3).
   *
   * The scans arrive between 1.26 and 2.54, and letting each keep its own
   * shape made the cascade look like a pile of loose prints. Every frame is
   * now authored, and the image covers it — so the composition is a set of
   * deliberate crops rather than an accident of how each photo was scanned.
   */
  ratio?: number
  /** object-position for the crop. Default centre. */
  focus?: string
}

/** The house frame for era photography. */
const FRAME = 4 / 3

/**
 * Phone width for a shot: roughly double the desktop vw, capped so it still
 * bleeds rather than boxing itself in. Derived rather than authored — the
 * desktop composition is the design, the phone one is a legible reduction of
 * it, and keeping two hand-tuned numbers per photo in sync is a losing game.
 */
function smallWidth(w: string): string {
  const vw = Number.parseFloat(w)
  return `${Math.min(vw * 1.95, 104).toFixed(0)}vw`
}

const LAYOUTS: Record<Era['id'], Shot[]> = {
  // Two wide frames. The first runs under the title so the type sits in the
  // photograph rather than beside it.
  dall: [
    { top: '13%', left: '-7vw', w: '52vw', rotate: -1.4, z: 1, depth: 0.5 },
    { top: '55%', left: '45vw', w: '45vw', rotate: 2.2, z: 12, depth: 1.3 },
  ],
  // Four, including a 2.5:1 panorama that runs off the left edge as a band —
  // the widest thing on the page, and the reason this panel is the tallest.
  icarus: [
    { top: '11%', left: '50vw', w: '44vw', rotate: 1.1, z: 12, depth: 0.6 },
    { top: '38%', left: '-6vw', w: '36vw', rotate: -2, z: 1, depth: 1.1 },
    { top: '58%', left: '29vw', w: '31vw', rotate: 1.6, z: 12, depth: 1.4 },
    // The one authored exception. Its source is a 2.54:1 panorama with the
    // members spread across the full width; cropping that to 4:3 keeps the
    // middle third and throws the rest away. A panorama is a different kind of
    // photograph, so it gets a frame that admits it.
    { top: '80%', left: '-9vw', w: '80vw', rotate: 0, z: 1, depth: 0.4, ratio: 12 / 5 },
  ],
  ego: [
    { top: '12%', left: '4vw', w: '47vw', rotate: 1, z: 1, depth: 0.6 },
    { top: '58%', left: '43vw', w: '54vw', rotate: -1.6, z: 12, depth: 1.25 },
  ],
}

/**
 * Titles are broken into lines by hand so every panel has a comparable number
 * of characters per line. Left to a single vw size, "Dall" would sit small and
 * "Club Icarus" would run off both edges.
 */
const TITLE_LINES: Record<Era['id'], string[]> = {
  dall: ['Dall'],
  icarus: ['Club', 'Icarus'],
  ego: ['Hyper', 'Ego'],
}

/**
 * How wide the longest line actually DRAWS, in em — ink, not advance —
 * measured in the browser with canvas ink extents at the face and tracking the
 * title renders with.
 *
 * The distinction only started to matter when the brush faces arrived. For a
 * grotesque the two numbers agree to a rounding error, so sizing off advances
 * was fine while all three titles were Archivo. Aboensis draws 3.54em across a
 * 3.26em advance and begins a quarter of an em to the left of its own origin,
 * which is how "Hyper" measured a perfect 100% span in its layout box and still
 * ran off both edges of the screen. The box is not where the paint is.
 *
 * Re-measure with ctx.measureText() at a known size if a name or a face moves.
 */
const TITLE_INK: Record<Era['id'], number> = {
  dall: 2.105, // 'Dall' — Archivo, wdth 78 / wght 800
  icarus: 2.92, // 'Icarus' — Ancial
  ego: 3.538, // 'Hyper' — Aboensis
}

/* How far the glyphs reach outside their own advance box. Padding the heading
   by this makes its border box equal to the ink, which is what w-max and the
   flush-edge alignment both assume — and it keeps working if the panel order
   ever flips and the title goes flush right instead. */
const TITLE_OVERHANG: Partial<Record<Era['id'], { start: number; end: number }>> = {
  ego: { start: 0.234, end: 0.045 },
}

/* Leading, for the faces where 0.82 off .u-display would drop one line onto the
   next. "Hyper" trails 0.578em below its baseline and "Ego" stands 0.594em
   above the one after it, so anything under 1.172 collides; the rest is air.
   Ancial clears 0.82 on its own with a little room to spare. */
const TITLE_LEADING: Partial<Record<Era['id'], number>> = {
  ego: 1.22,
}

/* Only these two eras wear their own face. Dall stays on the display family. */
const TITLE_FACE: Partial<Record<Era['id'], string>> = {
  icarus: 'u-face u-face-icarus',
  ego: 'u-face u-face-ego',
}

/** Longest line spans the full viewport, flush to one edge, overflowing neither. */
const TARGET_SPAN = 100

/* Where going full width costs more than it buys. Aboensis carries 2.46em of
   ink between the top of "Hyper" and the bottom of "Ego", so at full width the
   pair stands 994px tall — on a 900px screen "Ego" starts below the fold and
   the era photo vanishes under the strokes. Three quarters of the frame keeps
   the whole title on screen and the photo legible through it. The other two
   faces sit close enough to their advances that they do not need this. */
const TITLE_SPAN: Partial<Record<Era['id'], number>> = {
  ego: 72,
}

function titleSize(era: Era): string {
  const vw = (TITLE_SPAN[era.id] ?? TARGET_SPAN) / TITLE_INK[era.id]
  // A floor, not a clamp. A blanket upper bound would cut titles short without
  // saying so — "Dall" needs 47.5vw and a 34rem cap held it at 37.8vw, 20% shy
  // of the edge, while the other two ran full width. Where a title genuinely
  // should stop short it says so in TITLE_SPAN. The floor only matters on very
  // narrow screens.
  return `max(3.5rem, ${vw.toFixed(1)}vw)`
}

/**
 * Indent applied to each statement line, as a multiple of the base step, cycled
 * by line index. Not a straight increase: a monotonic staircase reads as a bad
 * bullet list, whereas an uneven return keeps the block feeling typeset.
 */
const STATEMENT_INDENT = [0, 1, 0.4, 1.3]

interface EraPanelProps {
  era: Era
  index: number
}

export function EraPanel({ era, index }: EraPanelProps) {
  const root = useRef<HTMLElement>(null)
  const [activeTrack, setActiveTrack] = useState<number | null>(null)

  const shots = LAYOUTS[era.id]
  const lines = TITLE_LINES[era.id]
  // Which viewport edge the title sits flush against. Alternates so no two
  // panels in a row anchor from the same side.
  const flush: 'left' | 'right' = index % 2 === 0 ? 'left' : 'right'

  /** Which photo a given track row points at. */
  const shotForTrack = (i: number) => i % era.photos.length

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const panel = root.current
      if (!panel) return

      const triggers: ScrollTrigger[] = []

      // Parallax. One timeline per photo, all reading the same panel trigger,
      // separated only by depth.
      gsap.utils.toArray<HTMLElement>('[data-shot]', panel).forEach((el) => {
        const depth = Number(el.dataset.depth ?? 1)
        const tween = gsap.fromTo(
          el,
          { yPercent: depth * 9 },
          {
            yPercent: depth * -9,
            ease: 'none',
            scrollTrigger: {
              trigger: panel,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        )
        if (tween.scrollTrigger) triggers.push(tween.scrollTrigger)
      })

      // Entry. Everything reveals by clip, offset and fade — never by
      // deforming a letterform. See docs/BUILD-PLAN.md §3.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: panel,
          start: 'top 78%',
          end: 'top 18%',
          scrub: 0.8,
          invalidateOnRefresh: true,
        },
      })
      if (tl.scrollTrigger) triggers.push(tl.scrollTrigger)

      const [titleFrom, titleTo] = wipe(
        { clipPath: 'inset(0 0 108% 0)', xPercent: flush === 'left' ? -4 : 4 },
        { clipPath: 'inset(0 0 -8% 0)', xPercent: 0 },
      )
      const [releaseFrom, releaseTo] = wipe(
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)' },
      )

      tl.fromTo(
        '[data-title-line]',
        titleFrom,
        { ...titleTo, ease: 'none', stagger: 0.12 },
        0,
      )
        .fromTo(
          '[data-panel-fade]',
          { autoAlpha: 0, y: 38 },
          { autoAlpha: 1, y: 0, ease: 'none', stagger: 0.07 },
          0.1,
        )
        .fromTo('[data-release]', releaseFrom, { ...releaseTo, ease: 'none' }, 0.2)

      // Tracklist rows enter once, on their own trigger — the panel timeline is
      // scrubbed, and a scrubbed list reveal reads as a scrollbar.
      const batch = ScrollTrigger.batch(
        gsap.utils.toArray<HTMLElement>('[data-track]', panel),
        {
          start: 'top 88%',
          once: true,
          onEnter: (els) =>
            gsap.fromTo(
              els,
              { autoAlpha: 0, y: 22 },
              { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.04, ease: 'power3.out' },
            ),
        },
      )
      triggers.push(...batch)

      return () => triggers.forEach((t) => t.kill())
    },
    { scope: root, dependencies: [era.id, flush] },
  )

  return (
    <article
      ref={root}
      id={`era-${era.id}`}
      aria-labelledby={`era-${era.id}-title`}
      className={
        'relative min-h-[105vh] overflow-x-clip px-[calc(var(--frame)+28px)] ' +
        // Extra right padding on desktop so the content column clears the nav
        // rail mounted on the right frame edge. The hero can let its wordmark
        // run under the nav — it is decoration there. A tracklist cannot.
        'lg:min-h-[150vh] lg:pr-[calc(var(--frame)+124px)]'
      }
    >
      {/* Photo cascade. Sits at mixed z so some frames run under the type and
          some over it.

          Not aria-hidden. The scatter is a compositional device, but the
          photographs themselves are the archive — hiding them would leave a
          screen-reader user with the tracklist and nothing to look at. */}
      <div className="pointer-events-none absolute inset-0">
        {era.photos.map((slug, i) => {
          const shot = shots[i]
          if (!shot) return null
          const dimmed = activeTrack !== null && shotForTrack(activeTrack) !== i
          return (
            <div
              key={slug}
              data-shot
              data-depth={shot.depth}
              className="absolute will-change-transform"
              style={
                {
                  top: shot.top,
                  left: shot.left,
                  '--shot-w': shot.w,
                  '--shot-w-sm': smallWidth(shot.w),
                  zIndex: shot.z,
                  transform: `rotate(${shot.rotate}deg)`,
                } as React.CSSProperties
              }
            >
              <Picture
                slug={slug}
                alt={`ARTMS in the ${era.title} era — group photograph ${i + 1} of ${era.photos.length}`}
                sizes="(max-width: 1024px) 92vw, 46vw"
                ratio={shot.ratio ?? FRAME}
                focus={shot.focus ?? 'center 40%'}
                className="w-full"
              />
              {/* Dimming plate rather than an opacity change on the image, so
                  the LQIP underneath never shows through mid-transition. */}
              <span
                className="pointer-events-none absolute inset-0 transition-opacity duration-[320ms]"
                style={{
                  background: 'var(--bg)',
                  opacity: dimmed ? 0.72 : 0,
                }}
              />
            </div>
          )
        })}
      </div>

      <div className="relative z-20 grid grid-cols-12 gap-x-4 pt-[12vh] pb-[16vh]">
        <SectionMarker
          n={`002.${index + 1}`}
          label={era.label}
          side={flush === 'left' ? 'left' : 'right'}
          className={
            flush === 'left'
              ? 'col-span-12 lg:col-span-5'
              : 'col-span-12 lg:col-start-8 lg:col-span-5'
          }
        />

        {/* Title — its own row, with the article's padding cancelled so the
            letterforms reach the true viewport edge rather than stopping at a
            content margin. That flush edge is the effect; nothing overflows,
            because an era name that loses a character stops being a name. */}
        <div
          className={
            'col-span-12 mt-[5vh] flex ' +
            '-mx-[calc(var(--frame)+28px)] lg:-mr-[calc(var(--frame)+124px)] ' +
            (flush === 'left' ? 'justify-start' : 'justify-end')
          }
        >
          <h2
            id={`era-${era.id}-title`}
            className={`u-display fx-inkbleed fx-chroma w-max ${TITLE_FACE[era.id] ?? ''}`}
            data-chroma
            style={
              {
                fontSize: titleSize(era),
                // Archivo's axes, and only for the eras still set in Archivo —
                // written inline, these would otherwise beat the .u-face class
                // and ask a static font for a width axis it does not have.
                ...(TITLE_FACE[era.id]
                  ? {}
                  : {
                      '--wdth': 78,
                      fontVariationSettings: '"wdth" var(--wdth), "wght" 800',
                      fontStretch: 'normal',
                    }),
                ...(TITLE_OVERHANG[era.id] && {
                  paddingInlineStart: `${TITLE_OVERHANG[era.id]!.start}em`,
                  paddingInlineEnd: `${TITLE_OVERHANG[era.id]!.end}em`,
                }),
                ...(TITLE_LEADING[era.id] && { lineHeight: TITLE_LEADING[era.id] }),
              } as React.CSSProperties
            }
          >
            {/* The visual lines are hand-broken, so read together they come out
                as "ClubIcarus". The heading announces the real title and the
                broken lines are decoration. */}
            <span className="u-sr-only">{era.title}</span>
            {lines.map((line) => (
              <span key={line} data-title-line aria-hidden="true" className="block">
                {line}
              </span>
            ))}
          </h2>
        </div>

        {/* Left column: subtitle, statement, release block. The deep bottom
            padding is what gives the tracklist opposite it room to stick. */}
        <div className="col-span-12 mt-[8vh] pb-[22vh] lg:col-span-6 lg:col-start-2">
          {era.subtitle && (
            <p
              data-panel-fade
              className="u-serif u-over-media"
              style={{ fontSize: 'clamp(1.3rem, 2.4vw, 2.6rem)' }}
            >
              {era.subtitle}
            </p>
          )}

          {/* Statement, staggered per line — the bleibtgleich move. */}
          <p
            data-panel-fade
            className="u-serif u-over-media mt-[9vh]"
            style={{ fontSize: 'clamp(1.5rem, 3.2vw, 3.4rem)', lineHeight: 1.12 }}
          >
            {era.statement.map((line, i) => (
              <span
                key={line}
                className="block"
                style={{
                  paddingLeft: `calc(clamp(1rem, 6vw, 7rem) * ${
                    STATEMENT_INDENT[i % STATEMENT_INDENT.length]
                  })`,
                }}
              >
                {line}
              </span>
            ))}
          </p>

          {era.statementSource && (
            <p
              data-panel-fade
              className="u-mono u-dim u-over-media mt-5"
              style={{
                paddingLeft: `calc(clamp(1rem, 6vw, 7rem) * ${STATEMENT_INDENT[1]})`,
              }}
            >
              — {era.statementSource}
            </p>
          )}

          <div data-panel-fade className="u-over-media mt-[11vh]">
            <p className="u-mono u-dim">{era.releaseType}</p>
            <p
              data-release
              className="u-display mt-2 tabular-nums"
              style={
                {
                  '--wdth': 78,
                  fontSize: 'clamp(2.5rem, 7vw, 9rem)',
                  fontVariationSettings: '"wdth" var(--wdth), "wght" 800',
                  fontStretch: 'normal',
                } as React.CSSProperties
              }
            >
              {formatDotted(era.released)}
            </p>
            <p className="u-mono mt-4">
              <span className="u-dim">Title track </span>
              <span style={{ color: 'var(--accent)' }}>{era.titleTrack}</span>
            </p>
          </div>
        </div>

        {/* Right rail: the tracklist. Auto-placement puts it in the same grid
            row as the column above because their column spans do not overlap,
            which is what lets it stretch and its inner block stick. */}
        <div className="col-span-12 mt-[10vh] lg:col-span-4 lg:col-start-9 lg:mt-0">
          <div
            className="lg:sticky lg:top-[16vh]"
            style={{
              // The photo cascade runs behind this rail on purpose, so the
              // list needs its own ground to stay readable. A tinted plate
              // rather than a solid one: the photograph should still be
              // present underneath, the way a spec sheet laid on a contact
              // print is.
              background: 'color-mix(in srgb, var(--bg) 82%, transparent)',
              backdropFilter: 'blur(7px)',
              WebkitBackdropFilter: 'blur(7px)',
              borderLeft: '1px solid var(--rule-strong)',
              padding: '1.25rem 1.25rem 1.5rem',
            }}
          >
            <p className="u-mono-sm u-dim mb-4">
              Tracklist — {era.tracks.length} tracks
            </p>
            <ol aria-label={`${era.title} tracklist`} className="w-full">
              {era.tracks.map((track, i) => {
                const isActive = activeTrack === i
                return (
                  <li
                    key={track.no}
                    data-track
                    style={{ borderTop: '1px solid var(--rule)' }}
                  >
                    <button
                      type="button"
                      onMouseEnter={() => setActiveTrack(i)}
                      onMouseLeave={() => setActiveTrack(null)}
                      onFocus={() => setActiveTrack(i)}
                      onBlur={() => setActiveTrack(null)}
                      className="flex w-full items-baseline gap-3 py-2.5 text-left"
                      data-cursor={era.photos.length > 1 ? 'Frame' : undefined}
                    >
                      <span
                        className="u-mono tabular-nums transition-colors duration-200"
                        style={{ color: isActive ? 'var(--accent)' : 'var(--ink-dim)' }}
                      >
                        {String(track.no).padStart(2, '0')}
                      </span>
                      <span className="u-mono flex-1" style={{ color: 'var(--ink)' }}>
                        {track.title}
                        {track.hangul && (
                          <span className="u-kr u-dim ml-2 normal-case tracking-normal">
                            {track.hangul}
                          </span>
                        )}
                      </span>
                      {track.isTitleTrack && (
                        <span
                          className="u-mono-sm whitespace-nowrap"
                          style={{ color: 'var(--accent)' }}
                        >
                          ◆ Title
                        </span>
                      )}
                      {track.isPreRelease && !track.isTitleTrack && (
                        <span className="u-mono-sm u-dim whitespace-nowrap">
                          Pre-release
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ol>
            <div
              className="mt-4"
              style={{ borderTop: '1px solid var(--rule)' }}
              aria-hidden="true"
            />
          </div>
        </div>
      </div>
    </article>
  )
}
