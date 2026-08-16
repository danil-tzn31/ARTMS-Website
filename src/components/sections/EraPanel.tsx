import { useRef, useState } from 'react'
import type { Era } from '@/types'
import { Picture } from '@/components/Picture'
import { SectionMarker } from '@/components/SectionMarker'
import { formatDotted } from '@/lib/format'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'

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
}

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
    { top: '80%', left: '-9vw', w: '80vw', rotate: 0, z: 1, depth: 0.4 },
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
 * Average advance per uppercase glyph, in em, MEASURED off the rendered face
 * at wdth 78 / wght 800 — not estimated.
 *
 * A single average does not work here. Archivo's advances vary enough between
 * words that one constant made "Icarus" 91% of the viewport and "Hyper" 99%;
 * with a shift on top, the narrow I fell off the left edge entirely and the era
 * read as CARUS. Clipping a letterform is the effect. Deleting a letter is a
 * typo, and these names appear exactly once each.
 *
 * Re-measure with a Range over the line and divide by (fontSize × characters)
 * if the words or the face ever change.
 */
const TITLE_ADVANCE: Record<Era['id'], number> = {
  dall: 0.526, // 'Dall'
  icarus: 0.518, // 'Icarus'
  ego: 0.562, // 'Hyper'
}

/** Longest line spans the full viewport, flush to one edge, overflowing neither. */
const TARGET_SPAN = 100

function titleSize(era: Era, lines: string[]): string {
  const longest = Math.max(...lines.map((l) => l.length))
  const vw = TARGET_SPAN / (longest * TITLE_ADVANCE[era.id])
  // A floor, not a clamp. An upper bound would silently break the promise that
  // every era title spans the viewport — "Dall" needs 47.5vw and a 34rem cap
  // held it at 37.8vw, so it stopped 20% short while the other two ran edge to
  // edge. The floor only matters on very narrow screens.
  return `max(3.5rem, ${vw.toFixed(1)}vw)`
}

/**
 * Breaks a statement into two lines at a word boundary near the middle, so the
 * second line can be indented against the first. One line has nothing to
 * stagger against; three lines at this size would not fit.
 */
function splitStatement(statement: string): [string, string] {
  const words = statement.split(' ')
  const mid = Math.ceil(words.length / 2)
  return [words.slice(0, mid).join(' '), words.slice(mid).join(' ')]
}

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

      tl.fromTo(
        '[data-title-line]',
        { clipPath: 'inset(0 0 108% 0)', xPercent: flush === 'left' ? -4 : 4 },
        {
          clipPath: 'inset(0 0 -8% 0)',
          xPercent: 0,
          ease: 'none',
          stagger: 0.12,
        },
        0,
      )
        .fromTo(
          '[data-panel-fade]',
          { autoAlpha: 0, y: 38 },
          { autoAlpha: 1, y: 0, ease: 'none', stagger: 0.07 },
          0.1,
        )
        .fromTo(
          '[data-release]',
          { clipPath: 'inset(0 0 100% 0)' },
          { clipPath: 'inset(0 0 0% 0)', ease: 'none' },
          0.2,
        )

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
          some over it. */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
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
                alt=""
                sizes="(max-width: 1024px) 92vw, 46vw"
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
            className="u-display fx-inkbleed w-max"
            style={
              {
                '--wdth': 78,
                fontSize: titleSize(era, lines),
                fontVariationSettings: '"wdth" var(--wdth), "wght" 800',
                fontStretch: 'normal',
              } as React.CSSProperties
            }
          >
            {lines.map((line) => (
              <span key={line} data-title-line className="block">
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
            {splitStatement(era.statement).map((row, i) => (
              <span
                key={row}
                className="block"
                style={{ paddingLeft: i === 1 ? 'clamp(1rem, 6vw, 7rem)' : 0 }}
              >
                {row}
              </span>
            ))}
          </p>

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
                      aria-describedby={`era-${era.id}-tracklist-hint`}
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
            <p
              id={`era-${era.id}-tracklist-hint`}
              className="u-mono-sm u-dim mt-4 pt-3"
              style={{ borderTop: '1px solid var(--rule)' }}
            >
              Focus a track to isolate its frame
            </p>
          </div>
        </div>
      </div>
    </article>
  )
}
