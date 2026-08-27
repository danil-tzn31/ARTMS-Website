import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'

interface MarqueeProps {
  items: string[]
  /** Base drift in px/s while the page is still. */
  speed?: number
  className?: string
}

/**
 * A mono ticker band whose direction follows the scroll direction and whose
 * speed rides scroll velocity. It never stops entirely, so the page always has
 * a pulse — but it reverses the instant the visitor scrolls back up, which is
 * the detail that makes it feel connected to the page rather than decorative.
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
          if (dir !== direction.current) {
            direction.current = dir
            gsap.to(tween, { timeScale: dir, duration: 0.35, overwrite: true })
          }
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
      ref={root}
      className={`relative overflow-hidden py-2.5 ${className}`}
      style={{ borderBlock: '1px solid var(--rule)' }}
      aria-hidden="true"
    >
      <div ref={track} className="flex w-max will-change-transform">
        {content.map((item, i) => (
          <span key={i} className="u-mono-sm flex items-center whitespace-nowrap">
            <span style={{ color: i % 3 === 1 ? 'var(--accent)' : 'var(--ink-dim)' }}>
              {item}
            </span>
            <span className="px-5" style={{ color: 'var(--rule-strong)' }}>
              ///
            </span>
          </span>
        ))}
      </div>
    </div>
  )
}
