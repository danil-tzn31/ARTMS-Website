import { useRef } from 'react'
import { type Credit, CREDITS, COLOPHON } from '@/data/credits'
import { SectionMarker } from '@/components/SectionMarker'
import { Wordmark } from '@/components/chrome/Wordmark'
import { useClock } from '@/lib/useClock'
import { getLenis } from '@/lib/useLenis'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'

function CreditRow({ credit }: { credit: Credit }) {
  const name = credit.url ? (
    <a
      href={credit.url}
      target="_blank"
      rel="noopener noreferrer"
      data-cursor="Open"
      className={`inline-flex items-baseline gap-1.5 underline decoration-1 underline-offset-4 transition-colors ${
        credit.verbatim ? 'normal-case' : ''
      }`}
      style={{ textDecorationColor: 'var(--rule-strong)' }}
    >
      {credit.name}
      <span aria-hidden="true" style={{ color: 'var(--accent)' }}>
        ↗
      </span>
      <span className="u-sr-only">(opens in a new tab)</span>
    </a>
  ) : (
    credit.name
  )

  return (
    <div
      data-credit
      className="grid grid-cols-[10rem_1fr] gap-x-6 py-4 sm:grid-cols-[13rem_1fr]"
      style={{ borderTop: '1px solid var(--rule)' }}
    >
      <dt className="u-mono u-dim">{credit.label}</dt>
      <dd className="u-mono" style={{ color: 'var(--ink)' }}>
        {name}
        {credit.note && <span className="u-mono u-dim ml-3">— {credit.note}</span>}
      </dd>
    </div>
  )
}

/**
 * The last thing on the page.
 *
 * Anchored bottom-left, per the alternating-anchor rule — Hero came off the
 * top-left bleed, Eras alternated edges, Members ran centre-out, so this one
 * settles back to the left.
 *
 * Everything here is somebody else's work being named. The site is a fan
 * archive with no claim on any of it, which is why the disclaimer is set at
 * statement size rather than hidden in small print at the bottom.
 */
export function Credits() {
  const root = useRef<HTMLElement>(null)
  const time = useClock()
  const year = new Date().getFullYear()

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const section = root.current
      if (!section) return

      const triggers: ScrollTrigger[] = []

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'top 30%',
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      })
      if (tl.scrollTrigger) triggers.push(tl.scrollTrigger)

      tl.fromTo(
        '[data-credits-fade]',
        { autoAlpha: 0, y: 30 },
        { autoAlpha: 1, y: 0, ease: 'none', stagger: 0.06 },
        0,
      ).fromTo(
        '[data-credit]',
        { autoAlpha: 0, x: -18 },
        { autoAlpha: 1, x: 0, ease: 'none', stagger: 0.08 },
        0.15,
      )

      // The closing wordmark wipes up as it enters, so the page ends on the
      // same mark it opened with — and on the same kind of move.
      const mark = gsap.fromTo(
        '[data-closing-mark]',
        { clipPath: 'inset(0 0 100% 0)' },
        {
          clipPath: 'inset(0 0 0% 0)',
          ease: 'none',
          scrollTrigger: {
            trigger: '[data-closing-mark]',
            start: 'top 95%',
            end: 'bottom bottom',
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        },
      )
      if (mark.scrollTrigger) triggers.push(mark.scrollTrigger)

      return () => triggers.forEach((t) => t.kill())
    },
    { scope: root },
  )

  const toTop = () => {
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(0, { duration: 1.6 })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer
      ref={root}
      id="credits"
      className="relative overflow-x-clip pt-[14vh]"
      aria-labelledby="credits-heading"
    >
      <div className="px-[calc(var(--frame)+28px)]">
        <SectionMarker
          n="004"
          label="Credits"
          side="left"
          className="w-full lg:w-1/2"
        />

        <h2
          id="credits-heading"
          data-credits-fade
          className="u-serif mt-[8vh] max-w-[24ch]"
          style={{ fontSize: 'clamp(1.5rem, 3.2vw, 3.4rem)', lineHeight: 1.12 }}
        >
          <span className="u-sr-only">Credits — </span>
          <span className="block">None of this is mine.</span>
          <span className="block" style={{ paddingLeft: 'clamp(1rem, 5vw, 5.5rem)' }}>
            It is only gathered.
          </span>
        </h2>

        <dl className="mt-[10vh] max-w-[68ch]">
          {CREDITS.map((credit) => (
            <CreditRow key={credit.label} credit={credit} />
          ))}
        </dl>

        <p
          data-credits-fade
          className="u-body mt-10 max-w-[58ch]"
          style={{ color: 'var(--ink-dim)' }}
        >
          A fan-made archive, built for the love of it and for nothing else. All
          photography, artwork and video belong to Modhaus and to the scanners who
          shared them. Not affiliated with, endorsed by, or connected to Modhaus or
          ARTMS. If you own something here and would rather it were not, please reach
          out to me so I could take it down.
        </p>

        {/* Colophon — the typefaces are borrowed work too. */}
        <dl
          data-credits-fade
          className="mt-[10vh] grid max-w-[68ch] grid-cols-1 gap-x-10 gap-y-2 sm:grid-cols-2"
        >
          {COLOPHON.map((item) => (
            <div key={item.label} className="grid grid-cols-[7rem_1fr] gap-x-4">
              <dt className="u-mono-sm u-dim">{item.label}</dt>
              <dd className="u-mono-sm">
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`underline decoration-1 underline-offset-4 ${
                      item.verbatim ? 'normal-case' : ''
                    }`}
                    style={{ textDecorationColor: 'var(--rule)' }}
                  >
                    {item.name}
                  </a>
                ) : (
                  item.name
                )}
              </dd>
            </div>
          ))}
        </dl>

        {/* Utility row. */}
        <div
          data-credits-fade
          className="mt-[10vh] flex flex-wrap items-center gap-x-8 gap-y-4 pb-[8vh]"
          style={{ borderTop: '1px solid var(--rule)', paddingTop: '2rem' }}
        >
          <button
            type="button"
            onClick={toTop}
            data-cursor="Top"
            className="u-mono inline-flex items-center gap-2 px-3 py-2"
            style={{ border: '1px solid var(--rule-strong)' }}
          >
            <span aria-hidden="true">↑</span> Back to top
          </button>

          <p className="u-mono u-dim tabular-nums">
            Seoul <span style={{ color: 'var(--accent)' }}>{time}</span> KST
          </p>

          <p className="u-mono u-dim">© {year} — Fan project</p>
        </div>
      </div>

      {/* Closing wordmark, edge to edge, scanlines reading through it. */}
      <div
        data-closing-mark
        className="w-full px-[calc(var(--frame)+8px)] pb-[max(var(--frame),1.5rem)]"
        style={{ color: 'var(--ink)' }}
      >
        <Wordmark fluid title="ARTMS" />
      </div>
    </footer>
  )
}
