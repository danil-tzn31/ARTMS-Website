import { useEffect, useState } from 'react'
import { getLenis } from '@/lib/useLenis'
import { pad } from '@/lib/format'
import { SECTIONS } from '@/data/sections'

/**
 * Vertical nav mounted on the right-hand frame rule. Each item is a label plus
 * a tick that extends to meet the rule when active — the rule and the nav are
 * the same object, which is the whole idea.
 *
 * Active state comes from IntersectionObserver rather than a ScrollTrigger, so
 * it keeps working if the GSAP layer is disabled for reduced motion.
 */
export function NavRail() {
  const [active, setActive] = useState<string>('hero')

  useEffect(() => {
    const targets = SECTIONS.map(({ id }) => document.getElementById(id)).filter(
      (el): el is HTMLElement => Boolean(el),
    )
    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-45% 0px -45% 0px', threshold: [0, 0.25, 0.5, 1] },
    )

    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  const go = (id: string) => {
    const el = document.getElementById(id)
    if (!el) return
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.4 })
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <nav
      aria-label="Sections"
      className="pointer-events-auto absolute right-0 top-1/2 hidden -translate-y-1/2 md:block"
    >
      <ul className="flex flex-col items-end gap-2.5">
        {SECTIONS.map(({ id, label }, i) => {
          const isActive = active === id
          return (
            <li key={id} className="flex items-center gap-2">
              {/* The nav sits over whatever the page is doing behind it —
                  hero video, a 100vw era title, a photograph. It needs its own
                  ground or it becomes unreadable exactly when the page is at
                  its loudest. Tinted rather than solid, so it still reads as
                  mounted on the frame rather than as a floating box. */}
              <span
                className="flex items-center gap-2 px-1.5 py-0.5"
                style={{ background: 'color-mix(in srgb, var(--bg) 86%, transparent)' }}
              >
                <span
                  className="u-mono-sm tabular-nums"
                  style={{ color: isActive ? 'var(--accent)' : 'transparent' }}
                  aria-hidden="true"
                >
                  {pad(i + 1, 2)}
                </span>
                <button
                  type="button"
                  onClick={() => go(id)}
                  aria-current={isActive ? 'true' : undefined}
                  className="u-mono-sm transition-colors duration-300"
                  style={{ color: isActive ? 'var(--accent)' : 'var(--ink-dim)' }}
                >
                  {label}
                </button>
              </span>
              <span
                className="block h-px transition-all duration-500"
                style={{
                  width: isActive ? 34 : 14,
                  background: isActive ? 'var(--accent)' : 'var(--rule-strong)',
                }}
                aria-hidden="true"
              />
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
