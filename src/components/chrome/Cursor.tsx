import { useEffect, useRef, useState } from 'react'
import { gsap } from '@/lib/gsap'

/**
 * A crosshair that lags the pointer slightly and picks up a label from whatever
 * it is over (`data-cursor="View"`).
 *
 * Position is written straight to the element via gsap.quickTo — putting mouse
 * coordinates into React state would re-render the tree on every mousemove.
 * Only the label, which changes rarely, lives in state.
 */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null)
  const [label, setLabel] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)')
    if (!fine.matches) return

    const el = ref.current
    if (!el) return

    const xTo = gsap.quickTo(el, 'x', { duration: 0.32, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.32, ease: 'power3' })

    const onMove = (e: PointerEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
      setVisible(true)

      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor]')
      setLabel(target?.dataset.cursor ?? null)
    }

    const onLeave = () => setVisible(false)

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[120] hidden md:block"
      style={{ opacity: visible ? 1 : 0, transition: 'opacity 200ms linear' }}
    >
      <div className="relative -translate-x-1/2 -translate-y-1/2">
        <span
          className="absolute left-1/2 top-1/2 block h-px w-4 -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'var(--accent)' }}
        />
        <span
          className="absolute left-1/2 top-1/2 block h-4 w-px -translate-x-1/2 -translate-y-1/2"
          style={{ background: 'var(--accent)' }}
        />
        {label && (
          <span
            className="u-mono-sm absolute left-4 top-3 whitespace-nowrap px-1.5 py-1"
            style={{ background: 'var(--accent)', color: 'var(--bg)' }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  )
}
