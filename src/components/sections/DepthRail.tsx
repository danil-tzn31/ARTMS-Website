import { useEffect, useState } from 'react'
import type { Member } from '@/types'
import { CHAPTERS } from '@/data/member-story'
import { MEMBER_BY_ID } from '@/data/members'

interface DepthRailProps {
  onJump: (member: Member) => void
}

/**
 * Where you are in the descent: a hairline down the left of the chapters with
 * one tick per part, the current one filled in her colour. The nav rail owns
 * the right edge, so this owns the left — the two read as a pair of gauges.
 *
 * IntersectionObserver rather than ScrollTrigger, like NavRail, so it keeps
 * working with the GSAP layer switched off for reduced motion.
 */
export function DepthRail({ onJump }: DepthRailProps) {
  const [active, setActive] = useState<string>(CHAPTERS[0]?.member ?? '')

  useEffect(() => {
    const targets = CHAPTERS.map((c) =>
      document.getElementById(`chapter-${c.member}`),
    ).filter((el): el is HTMLElement => Boolean(el))
    if (targets.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((e) => e.isIntersecting)
        if (visible) setActive(visible.target.id.replace('chapter-', ''))
      },
      // A thin band across the middle of the screen: exactly one chapter can
      // be crossing it at a time, so there is never a tie to resolve.
      { rootMargin: '-49% 0px -49% 0px' },
    )
    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  return (
    <nav
      aria-label="Depth"
      className="pointer-events-none absolute inset-y-0 left-[calc(var(--frame)+10px)] z-10 hidden lg:block"
    >
      <div className="pointer-events-auto sticky top-[34vh]">
        <span
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-[4px] w-px"
          style={{ background: 'var(--rule-strong)' }}
        />
        <ol className="relative flex flex-col gap-5 py-2">
          {CHAPTERS.map((chapter) => {
            const member = MEMBER_BY_ID[chapter.member]
            const isActive = active === chapter.member
            return (
              <li key={chapter.member} className="relative">
                <button
                  type="button"
                  onClick={() => onJump(member)}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`${chapter.part} — ${member.name}`}
                  className="flex items-center gap-3"
                >
                  <span
                    aria-hidden="true"
                    className="block size-[9px] rounded-full border transition-colors duration-300"
                    style={{
                      borderColor: isActive ? member.color : 'var(--rule-strong)',
                      background: isActive ? member.color : 'var(--bg)',
                    }}
                  />
                  <span
                    className="u-mono-sm px-1 transition-colors duration-300"
                    style={{
                      color: isActive ? 'var(--ink)' : 'var(--ink-dim)',
                      background: 'color-mix(in srgb, var(--bg) 86%, transparent)',
                    }}
                  >
                    {chapter.part}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
