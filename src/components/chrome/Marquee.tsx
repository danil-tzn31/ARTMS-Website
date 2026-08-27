import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'

interface MarqueeProps {
  items: string[]
  /** Base drift in px/s while the page is still. */
  speed?: number
  className?: string
}

/**
 * The transmission band between the hero and the eras — a mono ticker's job
 * done at display size.
 *
 * Three things are load-bearing rather than decorative:
 *
 * 1. The band is opaque. It used to have no background at all, which meant the
 *    hero video played straight through it: the hero is pinned for 90% of a
 *    viewport past its own start, so it is still sitting behind this band while
 *    the band crosses the screen, and its scrim has not finished closing.
 * 2. It is inset to the edge frame, not full-bleed. The frame is the page's
 *    outer rule; a band that runs past it reads as a mistake rather than as a
 *    deliberate overhang.
 * 3. Words alternate solid and outlined. A single weight at this size is a wall
 *    of type — the alternation is what gives the band rhythm as it moves, and
 *    it is doing the work the old grey mono row could not do at 12px.
 */
export function Marquee({ items, speed = 28, className = '' }: MarqueeProps) {
  const root = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const direction = useRef(1)
  const applied = useRef(1)

  useGSAP(
    () => {
      const el = track.current
      if (!el) return

      // The track holds the content twice; wrapping at -50% is therefore
      // seamless regardless of how wide the content ends up.
      const tween = gsap.to(el, {
        xPercent: -50,
        ease: 'none',
        duration: el.scrollWidth / 2 / speed,
        repeat: -1,
      })

      const st = ScrollTrigger.create({
        trigger: root.current,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate(self) {
          const dir = self.direction === -1 ? -1 : 1
          direction.current = dir

          // ScrollTrigger fires this on every scroll frame. Tweening the
          // timeScale from here allocated — and immediately overwrote — a tween
          // per frame; the visible difference between 2.10x and 2.14x is nil,
          // so only retarget once the speed has actually moved.
          const boost = 1 + Math.min(Math.abs(self.getVelocity()) / 900, 4)
          const next = dir * boost
          if (Math.abs(next - applied.current) < 0.25) return
          applied.current = next
          gsap.to(tween, { timeScale: next, duration: 0.4, overwrite: true })
        },
      })

      return () => {
        st.kill()
        tween.kill()
      }
    },
    { scope: root },
  )

  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.set(track.current, { xPercent: 0 })
  }, [])

  const content = [...items, ...items]

  return (
    <div
      className={`relative ${className}`}
      aria-hidden="true"
      style={{
        marginInline: 'var(--frame)',
        background: 'var(--bg)',
        borderBlock: '1px solid var(--rule-strong)',
      }}
    >
      <div ref={root} className="relative overflow-hidden">
        <div ref={track} className="flex w-max py-3 will-change-transform">
          {content.map((item, i) => (
            <span
              key={i}
              className="u-display flex items-center whitespace-nowrap uppercase"
              style={{
                fontSize: 'clamp(1.6rem, 4.4vw, 3.75rem)',
                lineHeight: 0.94,
                letterSpacing: '-0.02em',
                fontWeight: 700,
                // Outlined words are drawn with a stroke and no fill. Under the
                // invert toggle both states invert together, because the stroke
                // reads currentColor's token rather than a baked colour.
                ...(i % 2
                  ? { color: 'var(--accent)' }
                  : {
                      color: 'transparent',
                      // Only the prefixed form exists; Firefox aliases it.
                      WebkitTextStroke: '1px var(--ink)',
                    }),
              }}
            >
              {item}
              <span
                className="px-6"
                style={{ color: 'var(--rule-strong)', WebkitTextStroke: '0' }}
              >
                /
              </span>
            </span>
          ))}
        </div>

        {/* Scanlines, matched to the global pitch. Plain alpha rather than a
            blend mode: a blended layer makes the compositor re-blend whatever
            is underneath on every frame the band moves, and on a dark band the
            two are indistinguishable. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(to bottom, rgb(0 0 0 / 0.34) 0 1px, transparent 1px var(--scanline-pitch))',
          }}
        />
      </div>

      {/* Anchored, not scrolling — the text runs underneath it. */}
      <div
        className="u-mono-sm absolute left-0 top-0 flex h-full items-center gap-2 px-4 uppercase"
        style={{
          background: 'var(--accent)',
          color: 'var(--bg)',
          letterSpacing: '0.2em',
          fontWeight: 700,
        }}
      >
        <span className="fx-blink" aria-hidden="true">
          ◉
        </span>
        <span className="hidden sm:inline">Transmission</span>
      </div>
    </div>
  )
}
