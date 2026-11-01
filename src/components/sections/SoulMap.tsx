import { useRef } from 'react'
import type { Member } from '@/types'
import { CHAPTERS, FIRST_DARK, LINE_TIP, PROLOGUE } from '@/data/member-story'
import { MEMBER_BY_ID } from '@/data/members'
import { SectionMarker } from '@/components/SectionMarker'
import { DEPTH_DARK } from '@/lib/useDepthTheme'
import { pad } from '@/lib/format'
import { gsap, TOUCH, useGSAP } from '@/lib/gsap'
import { Spark } from '@/components/Spark'

const STATEMENT = ['Five members.', 'One soul,', 'split five ways.']
/** Indent per statement line, in rem. Uneven on purpose — see EraPanel. */
const STATEMENT_INDENT = [0, 4.5, 1.6]

/**
 * Diameter of each circle relative to the map's unit, in depth order. At 1440
 * wide the unit is 400px, so these come out at 340 / 440 / 320 / 440 / 340 —
 * the Ego and the Shadow drawn largest, the way the reading weights them.
 */
const DIAMETERS = [0.85, 1.1, 0.8, 1.1, 0.85]

/** How far each circle climbs into the one above it, as a fraction of the smaller. */
const OVERLAP = 0.28

/** The map's unit, wide and narrow. */
const UNIT = { lg: '27.8vw', sm: '46vw' }

/** Room above the first circle and below the last for the world labels. */
const LABEL_ROOM = 0.32

/** Stack the circles: each one's top, in units, and the stack's full height. */
const LAYOUT = (() => {
  const tops: number[] = []
  let y = LABEL_ROOM
  DIAMETERS.forEach((d, i) => {
    const prev = DIAMETERS[i - 1]
    if (prev !== undefined) y -= OVERLAP * Math.min(prev, d)
    tops.push(y)
    y += d
  })
  return { tops, height: y + LABEL_ROOM }
})()

interface SoulMapProps {
  onJump: (member: Member) => void
}

/**
 * The prologue: five overlapping circles, outer world at the top and inner
 * world at the bottom. It is the section's table of contents and its argument
 * at once — every chapter below opens one of these circles.
 *
 * The page turns dark behind the lower circles, so the map previews the
 * descent the chapters are about to make. That darkness is local to the map; the
 * global palette only flips once Jinsoul's chapter is actually on screen.
 */
export function SoulMap({ onJump }: SoulMapProps) {
  const root = useRef<HTMLDivElement>(null)
  const darkFrom = CHAPTERS.findIndex((c) => c.part === FIRST_DARK)
  const darkTop = LAYOUT.tops[darkFrom] ?? 0
  // Where the band starts, and where the line flips to light ink and back. The
  // band fades out over its last fifth; the flip back sits halfway through it.
  const bandTop = darkTop - 0.1
  const lineDark = (darkTop / LAYOUT.height) * 100
  const lineLight = ((bandTop + 0.9 * (LAYOUT.height - bandTop)) / LAYOUT.height) * 100

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const map = root.current?.querySelector<HTMLElement>('[data-map]')
      const circles = gsap.utils.toArray<HTMLElement>('[data-map-circle]', root.current)
      if (!map || circles.length === 0) return

      const head = gsap.utils.toArray<HTMLElement>('[data-map-head]', root.current)
      gsap.fromTo(
        head,
        { y: 34, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          stagger: 0.08,
          ease: 'none',
          scrollTrigger: {
            trigger: root.current,
            start: 'top 78%',
            end: 'top 30%',
            scrub: 0.7,
          },
        },
      )

      // One timeline for the axis: the line draws, the spark rides its tip
      // and takes on each member's colour as it enters her circle, and each
      // circle opens as the line reaches it. Tying the circles to the tip,
      // rather than to their own triggers, keeps the three in step at any
      // scroll speed.
      const line = map.querySelector<HTMLElement>('[data-map-line]')
      const spark = map.querySelector<HTMLElement>('[data-map-spark]')
      if (!line || !spark) return

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: map,
          start: `top ${LINE_TIP}`,
          end: `bottom ${LINE_TIP}`,
          scrub: 0.4,
        },
      })
      tl.fromTo(
        line,
        { clipPath: 'inset(0 0 100% 0)' },
        { clipPath: 'inset(0 0 0% 0)', duration: 1 },
        0,
      )
      tl.fromTo(spark, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, 0)
      tl.fromTo(spark, { top: '0%' }, { top: '100%', duration: 1 }, 0)
      // Handed over, not left behind: the first chapter's spark takes the tip
      // from here, on the same line, on the same frame.
      tl.to(spark, { autoAlpha: 0, duration: 0.02 }, 0.98)
      const rings = gsap.utils.toArray<HTMLElement>('[data-map-ring]', root.current)
      circles.forEach((circle, i) => {
        const at = (LAYOUT.tops[i] ?? 0) / LAYOUT.height
        const member = CHAPTERS[i] && MEMBER_BY_ID[CHAPTERS[i].member]
        // On touch screens the circles are simply there, already open. The
        // line still draws through them.
        if (!TOUCH) {
          tl.fromTo(
            [circle, rings[i]].filter(Boolean),
            { scale: 0.85, autoAlpha: 0 },
            { scale: 1, autoAlpha: 1, duration: 0.07 },
            Math.max(0, at - 0.03),
          )
        }
        if (member) tl.to(spark, { color: member.color, duration: 0.04 }, at)
      })
    },
    { scope: root },
  )

  return (
    <div ref={root} className="relative pt-[14vh]">
      <div className="px-[calc(var(--frame)+28px)]">
        <SectionMarker
          n="003"
          label="Members"
          side="left"
          className="w-full lg:w-1/2"
        />

        <h2
          id="members-heading"
          data-map-head
          className="u-serif mt-[8vh] lg:ml-[6%]"
          style={{ fontSize: 'clamp(1.9rem, 4.2vw, 4.4rem)', lineHeight: 1.08 }}
        >
          <span className="u-sr-only">Members — </span>
          {STATEMENT.map((line, i) => (
            <span
              key={line}
              className="block"
              style={{ paddingLeft: `${STATEMENT_INDENT[i] ?? 0}rem` }}
            >
              {line}
            </span>
          ))}
        </h2>
        <p data-map-head className="u-body mt-6 max-w-[42ch] lg:ml-[calc(6%+1.6rem)]">
          Scroll down through her soul — from the face she shows the world to the part
          she keeps deepest.
        </p>
        {PROLOGUE && (
          <p
            data-map-head
            className="u-body u-dim mt-4 max-w-[52ch] lg:ml-[calc(6%+1.6rem)]"
          >
            {PROLOGUE}
          </p>
        )}
      </div>

      <div
        data-map
        className="soul-map relative mt-[10vh]"
        style={
          {
            '--u-sm': UNIT.sm,
            '--u-lg': UNIT.lg,
            height: `calc(var(--u) * ${LAYOUT.height})`,
          } as React.CSSProperties
        }
      >
        {/* The deep end of the map. Fades in above the Shadow and out below
            the inner-world label, so the first chapter still starts on light. */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0"
          style={{
            top: `calc(var(--u) * ${bandTop})`,
            background: `linear-gradient(to bottom, transparent, ${DEPTH_DARK['--bg']} 14%, ${DEPTH_DARK['--bg']} 80%, transparent)`,
          }}
        />

        {/* The axis the circles hang on: a faint guide, the line that draws
            down it, and the spark on the line's tip. */}
        <span
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-1/2 w-px"
          style={{ background: 'var(--rule)' }}
        />
        {/* Ink on the light, the dark set's ink across the band, ink again
            once the band has faded — or the line vanishes into whichever one
            it is crossing. Drawn with a clip rather than a scale so the colour
            changes stay where the band is. 2px and centred on the axis, the
            same as the chapters' thread it runs into. */}
        <span
          data-map-line
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-1/2 w-[2px] -translate-x-1/2"
          style={{
            background: `linear-gradient(to bottom, var(--ink) ${lineDark}%, ${DEPTH_DARK['--ink']} ${lineDark}%, ${DEPTH_DARK['--ink']} ${lineLight}%, var(--ink) ${lineLight}%)`,
          }}
        />
        {/* No z-index: it sits under the circles' fills, so it slips out of
            sight inside each circle and shows only where the line is bare. */}
        <Spark
          data-map-spark
          className="map-spark absolute left-1/2"
          style={{ color: 'var(--ink)' }}
        />

        <span className="u-mono absolute top-0 left-1/2 ml-3">Outer world</span>

        <ol className="contents">
          {CHAPTERS.map((chapter, i) => {
            const member = MEMBER_BY_ID[chapter.member]
            const d = DIAMETERS[i] ?? 1
            const top = LAYOUT.tops[i] ?? 0
            const dark = i >= darkFrom
            return (
              <li key={chapter.member} className="contents">
                <button
                  type="button"
                  data-map-circle
                  data-cursor="Open"
                  aria-label={`Open ${member.name}, ${chapter.part}`}
                  onClick={() => onJump(member)}
                  className="soul-circle absolute flex flex-col items-center justify-center rounded-full"
                  style={
                    {
                      width: `calc(var(--u) * ${d})`,
                      height: `calc(var(--u) * ${d})`,
                      top: `calc(var(--u) * ${top})`,
                      left: `calc(50% - var(--u) * ${d / 2})`,
                      // Filled (see .soul-circle), so the axis passes behind
                      // the circle rather than through its label. The ring is
                      // drawn separately, above every fill — see below.
                      zIndex: i + 1,
                      '--member': member.color,
                      '--disc': dark ? DEPTH_DARK['--bg'] : 'var(--bg)',
                      ...(dark && {
                        '--ink': DEPTH_DARK['--ink'],
                        '--ink-dim': DEPTH_DARK['--ink-dim'],
                        color: DEPTH_DARK['--ink'],
                      }),
                    } as React.CSSProperties
                  }
                >
                  <span
                    className="u-serif"
                    style={{ fontSize: `calc(var(--u) * ${d * 0.2})`, lineHeight: 1 }}
                  >
                    {chapter.part}
                  </span>
                  <span className="u-mono-sm u-dim mt-2">
                    {pad(i + 1, 2)} · {member.name}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>

        {/* The rings, in a layer of their own above every circle's fill. Drawn
            on the circles themselves, each opaque fill covered the lower arc of
            the circle above it, and the map stopped reading as five
            overlapping circles and became a stack of discs. */}
        {CHAPTERS.map((chapter, i) => {
          const d = DIAMETERS[i] ?? 1
          return (
            <span
              key={chapter.member}
              data-map-ring
              aria-hidden="true"
              className="pointer-events-none absolute z-10 rounded-full"
              style={{
                width: `calc(var(--u) * ${d})`,
                height: `calc(var(--u) * ${d})`,
                top: `calc(var(--u) * ${LAYOUT.tops[i] ?? 0})`,
                left: `calc(50% - var(--u) * ${d / 2})`,
                border: `2px solid ${MEMBER_BY_ID[chapter.member].color}`,
              }}
            />
          )
        })}

        <span
          className="u-mono absolute left-1/2 ml-3"
          style={{
            bottom: `calc(var(--u) * ${LABEL_ROOM * 0.4})`,
            color: DEPTH_DARK['--ink'],
          }}
        >
          Inner world
        </span>

        {/* Inside the map rather than under it: the map's bottom edge is where
            the first chapter's thread starts, and anything between the two
            would be a gap in the line. Below it on phones, where there is no
            line to break and the map is too narrow for this and the inner
            world label to share a row. */}
        <p
          className="u-mono-sm absolute right-[calc(var(--frame)+28px)] -bottom-8 lg:bottom-4"
          style={{ color: 'var(--ink-dim)' }}
        >
          Map reading after <span className="normal-case">xio_orbit</span>
        </p>
      </div>
    </div>
  )
}
