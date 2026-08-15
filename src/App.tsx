import { useCallback, useRef, useState } from 'react'
import { EdgeFrame } from '@/components/chrome/EdgeFrame'
import { NavRail } from '@/components/chrome/NavRail'
import { InvertToggle } from '@/components/chrome/InvertToggle'
import { Cursor } from '@/components/chrome/Cursor'
import { Filters } from '@/components/chrome/Filters'
import { Screen } from '@/components/chrome/Screen'
import { Marquee } from '@/components/chrome/Marquee'
import { Preloader } from '@/components/chrome/Preloader'
import { Wordmark } from '@/components/chrome/Wordmark'
import { Hero } from '@/components/sections/Hero'
import { useLenis, useScrollVelocity } from '@/lib/useLenis'
import { useInvert } from '@/lib/useInvert'
import { useEraTheme } from '@/lib/useEraTheme'
import { useClock } from '@/lib/useClock'

const TICKER = [
  'ARTMS',
  'Devine All Love & Live',
  'Virtual Angel',
  'Club Icarus',
  'Blue Blood',
  'Hyper-Ego',
  'Heejin',
  'Haseul',
  'Kim Lip',
  'Jinsoul',
  'Choerry',
]

export default function App() {
  const scope = useRef<HTMLDivElement>(null)
  const { inverted, toggle } = useInvert()
  const time = useClock()

  // The preloader owns the first three seconds. The page underneath is mounted
  // and animating the whole time, so the handoff lands on a hero that has
  // already played its intro rather than on one that starts cold.
  const [booted, setBooted] = useState(false)
  const onBooted = useCallback(() => setBooted(true), [])

  useLenis()
  useScrollVelocity()
  useEraTheme(scope)

  return (
    <div ref={scope}>
      <a className="u-skip-link" href="#eras">
        Skip to content
      </a>

      <Filters />
      <Screen />
      <Cursor />

      {!booted && <Preloader onDone={onBooted} />}

      <EdgeFrame>
        {/* Mounted on the top rule. */}
        <div className="pointer-events-auto absolute -top-3 left-3">
          <a
            href="#hero"
            className="block px-2 py-1"
            style={{ background: 'var(--bg)', color: 'var(--ink)' }}
            data-cursor="Top"
          >
            <Wordmark height={16} title="ARTMS — home" />
          </a>
        </div>

        <div className="absolute -top-4 right-1/2 translate-x-1/2">
          <span style={{ background: 'var(--bg)' }} className="block px-1.5">
            <InvertToggle inverted={inverted} onToggle={toggle} />
          </span>
        </div>

        <NavRail />

        {/* Mounted on the bottom rule. */}
        <div className="absolute -bottom-2.5 left-3">
          <span className="u-mono-sm px-1.5" style={{ background: 'var(--bg)' }}>
            Fan Archive — Not Affiliated With Modhaus
          </span>
        </div>
        <div className="absolute -bottom-2.5 right-3">
          <span
            className="u-mono-sm px-1.5 tabular-nums"
            style={{ background: 'var(--bg)', color: 'var(--ink-dim)' }}
          >
            {time} KST
          </span>
        </div>
      </EdgeFrame>

      <main>
        <Hero />
        <Marquee items={TICKER} />

        {/* Sections land here in the next phases. The placeholders keep the
            nav rail and the era palette driver wired to real anchors. */}
        <section id="eras" className="min-h-[60vh]" />
        <section id="members" className="min-h-[60vh]" />
        <section id="credits" className="min-h-[40vh]" />
      </main>
    </div>
  )
}
