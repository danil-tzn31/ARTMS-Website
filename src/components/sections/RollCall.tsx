import { useRef } from 'react'
import { CHAPTERS } from '@/data/member-story'
import { MEMBER_BY_ID } from '@/data/members'
import { Wordmark } from '@/components/chrome/Wordmark'
import { gsap, useGSAP } from '@/lib/gsap'

/** How long the sequence holds the screen, past its own height. */
const PIN_LENGTH = '+=120%'

/** Circle diameter, narrow and wide. Height-capped so the stacked state fits. */
const SIZE = { sm: 'min(36vw, 24vh)', lg: 'min(15vw, 22vh)' }

/** Stacked: each circle this far below the one before, as % of its own size. */
const STACK_STEP = 50

/** Closed: each circle this far off the shared centre, as % of its size. */
const CLUSTER_RADIUS = 15

/* Positions are percentages of each circle's own size, so they survive resize
   without invalidating anything. */
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
 * The five circles come back small in depth order and slide into one spot —
 * multiply, so where all five cover each other the colour goes to near-black
 * and the wordmark sits in it. All five stay. An earlier cut walked Haseul's
 * circle back out for Hyper-Ego, and it read as the section ending on someone
 * leaving; the chapter already tells that part, at the length it deserves.
 *
 * Desktop only, one timeline on one trigger. Everywhere else, and under reduced
 * motion, the closed circle is the whole of it.
 */
export function RollCall() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const section = root.current
      if (!section) return
      const mm = gsap.matchMedia()

      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        const circles = gsap.utils.toArray<HTMLElement>('[data-roll-circle]', section)
        const mark = section.querySelector<HTMLElement>('[data-roll-mark]')
        const label = section.querySelector<HTMLElement>('[data-roll-label]')
        if (!mark || !label) return

        // The markup is drawn at the final frame, as a translate in %. GSAP
        // would read that back as pixels and add its own percentages on top,
        // so zero the pixel half before the timeline takes over.
        gsap.set(circles, { x: 0, y: 0 })

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

        // 0 → 0.4: back, small, in depth order.
        circles.forEach((c, i) => {
          tl.fromTo(
            c,
            { ...stacked(i), scale: 0.6, autoAlpha: 0 },
            { ...stacked(i), scale: 1, autoAlpha: 1, duration: 0.18 },
            i * 0.055,
          )
        })

        // 0.4 → 0.8: one spot, overlapping, the wordmark over them.
        circles.forEach((c, i) => tl.to(c, { ...clustered(i), duration: 0.3 }, 0.4))
        tl.fromTo(
          mark,
          { autoAlpha: 0, scale: 0.92 },
          { autoAlpha: 1, scale: 1, duration: 0.2 },
          0.55,
        )
        tl.fromTo(
          label,
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.12 },
          0.62,
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

      <p
        data-roll-label
        aria-hidden="true"
        className="u-mono absolute inset-x-0 top-[12vh] text-center"
      >
        Five members — one soul
      </p>

      <div aria-hidden="true" className="roll-stage relative">
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
