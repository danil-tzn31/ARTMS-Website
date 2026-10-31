import { useRef } from 'react'
import { CHAPTERS, LINE_TIP } from '@/data/member-story'
import { MEMBER_BY_ID } from '@/data/members'
import { Wordmark } from '@/components/chrome/Wordmark'
import { Spark } from '@/components/Spark'
import { gsap, useGSAP } from '@/lib/gsap'

/** How long the sequence holds the screen, past its own height. */
const PIN_LENGTH = '+=150%'

/**
 * Circle diameter at the end, once the five have closed into one. Big, so the
 * last frame is the circle and not a small mark in an empty screen.
 */
const SIZE = { sm: 'min(64vw, 36vh)', lg: 'min(26vw, 38vh)' }

/**
 * How small the stage starts on desktop. Five circles stacked at full size
 * would run off the top and bottom of the screen, so the stack forms at this
 * scale and the stage grows to full size as the circles close up.
 */
const STACK_SCALE = 0.58

/** Stacked: each circle this far below the one before, as % of its own size. */
const STACK_STEP = 50

/** Closed: each circle this far off the shared centre, as % of its size. */
const CLUSTER_RADIUS = 15

/* Positions are percentages of each circle's own size, so they survive resize
   without invalidating anything. The stage is exactly one circle in size, so
   the same numbers work as `top` percentages for the sparks. */
const stacked = (i: number) => ({ xPercent: 0, yPercent: (i - 2) * STACK_STEP })
const clustered = (i: number) => {
  const a = (i / CHAPTERS.length) * Math.PI * 2 - Math.PI / 2
  return {
    xPercent: Math.cos(a) * CLUSTER_RADIUS,
    yPercent: Math.sin(a) * CLUSTER_RADIUS,
  }
}

/**
 * The map closes.
 *
 * The line that has run down the whole section keeps going into this one and
 * draws to the centre of the screen. There its spark splits into five, one
 * per member in depth order; each flies to its place in a stack and swells
 * into her circle. The circles then slide into one spot — multiply, so where
 * all five overlap the colour goes to near-black and the wordmark sits in it.
 * The line that opened the section on the map is what closes it.
 *
 * The draw down to the centre happens before the pin, on the same viewport
 * line as every other line in the section, so it reads as one line from the
 * first circle on the map to the last frame here.
 *
 * Desktop only. Everywhere else, and under reduced motion, the closed circle
 * is the whole of it.
 */
export function RollCall() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const section = root.current
      if (!section) return
      const mm = gsap.matchMedia()

      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const q = (sel: string) => section.querySelector<HTMLElement>(sel)
        const circles = gsap.utils.toArray<HTMLElement>('[data-roll-circle]', section)
        const seeds = gsap.utils.toArray<HTMLElement>('[data-roll-seed]', section)
        const axis = q('[data-roll-axis]')
        const line = q('[data-roll-line]')
        const rider = q('[data-roll-rider]')
        const spark = q('[data-roll-spark]')
        const stage = q('[data-roll-stage]')
        const mark = q('[data-roll-mark]')
        const label = q('[data-roll-label]')
        if (!axis || !line || !rider || !spark || !stage || !mark || !label) return

        // The markup is drawn at the final frame, as a translate in %. GSAP
        // would read that back as pixels and add its own percentages on top,
        // so zero the pixel half before the timelines take over.
        gsap.set(circles, { x: 0, y: 0 })

        // Before the pin: the line draws from the top of the section to its
        // centre. It starts when the section's top crosses LINE_TIP and ends
        // when the centre does — half a screen later, which is exactly the
        // line's own length — so the tip holds still on that viewport line the
        // whole way, the same as on the map and through every chapter.
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: section,
              start: `top ${LINE_TIP}`,
              end: `top ${parseFloat(LINE_TIP) - 50}%`,
              scrub: true,
            },
          })
          .fromTo(line, { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0)
          .fromTo(rider, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, 0)
          .fromTo(rider, { top: '0%' }, { top: '100%', duration: 1 }, 0)

        // The two timelines never touch the same property on the same
        // element: the draw moves the rider and scales the line, the pin
        // flares the spark inside the rider and fades the axis around both.

        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: section,
            start: 'top top',
            end: PIN_LENGTH,
            pin: true,
            scrub: 0.8,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        })

        // 0 → 0.12: the spark flares where the line ends.
        tl.to(spark, { scale: 1.8, duration: 0.1 }, 0)

        // 0.1 → 0.42: it splits — five sparks fly out to the stack, in depth
        // order, and each swells into her circle as it lands.
        tl.to(spark, { autoAlpha: 0, scale: 0.6, duration: 0.06 }, 0.1)
        seeds.forEach((seed, i) => {
          const at = 0.1 + i * 0.05
          tl.fromTo(seed, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.01 }, at)
          tl.fromTo(
            seed,
            { top: '50%' },
            { top: `${50 + (i - 2) * STACK_STEP}%`, duration: 0.1 },
            at,
          )
          tl.to(seed, { autoAlpha: 0, duration: 0.05 }, at + 0.1)
          const circle = circles[i]
          if (circle) {
            tl.fromTo(
              circle,
              { ...stacked(i), scale: 0, autoAlpha: 1 },
              { ...stacked(i), scale: 1, duration: 0.12, ease: 'power2.out' },
              at + 0.07,
            )
          }
        })

        // The line has delivered all five: it fades, clearing the space the
        // label is about to use.
        tl.to(axis, { autoAlpha: 0, duration: 0.08 }, 0.42)

        // 0.48 → 0.8: one spot, overlapping, the wordmark over them.
        circles.forEach((c, i) => tl.to(c, { ...clustered(i), duration: 0.28 }, 0.48))
        tl.fromTo(stage, { scale: STACK_SCALE }, { scale: 1, duration: 0.28 }, 0.48)
        tl.fromTo(
          mark,
          { autoAlpha: 0, scale: 0.92 },
          { autoAlpha: 1, scale: 1, duration: 0.18 },
          0.62,
        )
        tl.fromTo(
          label,
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.12 },
          0.68,
        )
        // The rest is a hold: the closed circle stays put while the pin runs out.
        tl.to({}, { duration: 0.2 }, 0.8)
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      id="roll-call"
      aria-label="Roll call"
      className="roll-call relative flex h-[100svh] items-center justify-center overflow-hidden"
      style={{ '--roll-sm': SIZE.sm, '--roll-lg': SIZE.lg } as React.CSSProperties}
    >
      <p className="u-sr-only">The five circles close into one.</p>

      {/* The section's line, from the top edge down to the centre, with the
          spark on its tip. Desktop only, like the chapters' thread it
          continues. */}
      <div
        data-roll-axis
        aria-hidden="true"
        className="absolute top-0 left-1/2 hidden h-1/2 motion-reduce:hidden lg:block"
      >
        <span
          data-roll-line
          className="absolute inset-y-0 left-0 w-[2px] -translate-x-1/2 origin-top"
          style={{ background: 'var(--ink)' }}
        />
        <span data-roll-rider className="absolute left-0">
          <Spark
            data-roll-spark
            className="roll-spark"
            style={{ color: 'var(--ink)' }}
          />
        </span>
      </div>

      {/* Set at statement size, in the serif the map's statement opened with —
          it is the same sentence, answered. */}
      <p
        data-roll-label
        aria-hidden="true"
        className="u-serif absolute inset-x-0 top-[11vh] text-center"
        style={{ fontSize: 'clamp(1.9rem, 4.2vw, 4.4rem)', lineHeight: 1.05 }}
      >
        Five members — one soul
      </p>

      <div data-roll-stage aria-hidden="true" className="roll-stage relative">
        {CHAPTERS.map((chapter, i) => {
          const member = MEMBER_BY_ID[chapter.member]
          const rest = clustered(i)
          return (
            <div
              key={chapter.member}
              data-roll-circle={chapter.member}
              className="roll-circle absolute inset-0 rounded-full"
              style={{
                background: member.color,
                transform: `translate(${rest.xPercent}%, ${rest.yPercent}%)`,
              }}
            />
          )
        })}

        {/* One spark per member, waiting at the centre for the split. */}
        {CHAPTERS.map((chapter) => (
          <Spark
            key={chapter.member}
            data-roll-seed
            className="roll-seed absolute left-1/2"
            style={{ top: '50%', color: MEMBER_BY_ID[chapter.member].color }}
          />
        ))}

        <div
          data-roll-mark
          className="absolute top-1/2 left-1/2 w-[105%] -translate-x-1/2 -translate-y-1/2"
          style={{ color: 'var(--bg)' }}
        >
          <Wordmark fluid title="ARTMS" />
        </div>
      </div>
    </section>
  )
}
