import { useEffect, useRef } from 'react'
import type { Member } from '@/types'
import { MEMBERS } from '@/data/members'
import { Picture } from '@/components/Picture'
import { gsap } from '@/lib/gsap'

interface MemberHoverPhotoProps {
  /** The member currently under the pointer, or null. */
  member: Member | null
}

/**
 * A frame that trails the cursor across the member index.
 *
 * Position is written straight to the element with gsap.quickTo. Putting mouse
 * coordinates into React state would re-render this subtree — and the image
 * inside it — on every mousemove.
 *
 * Mounts only for fine pointers. On touch there is no hover state to express,
 * and on keyboard the row's own colour fill carries the same signal; a photo
 * chasing an invisible cursor would just be a floating artefact.
 */
export function MemberHoverPhoto({ member }: MemberHoverPhotoProps) {
  const ref = useRef<HTMLDivElement>(null)
  const fine = useRef(false)

  useEffect(() => {
    fine.current =
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!fine.current) return

    const el = ref.current
    if (!el) return

    const xTo = gsap.quickTo(el, 'x', { duration: 0.55, ease: 'power3' })
    const yTo = gsap.quickTo(el, 'y', { duration: 0.55, ease: 'power3' })
    // Rotation tracks horizontal velocity, so the frame banks into the
    // direction of travel and settles level. Cheap, and it is the difference
    // between "an image is following the cursor" and "an object has weight".
    const rTo = gsap.quickTo(el, 'rotate', { duration: 0.8, ease: 'power3' })

    let lastX = 0
    const onMove = (e: PointerEvent) => {
      xTo(e.clientX)
      yTo(e.clientY)
      rTo(gsap.utils.clamp(-9, 9, (e.clientX - lastX) * 0.5))
      lastX = e.clientX
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-[60] hidden md:block"
      style={{
        opacity: member ? 1 : 0,
        transition: 'opacity 260ms var(--ease-out-expo)',
      }}
    >
      <div
        className="-translate-x-1/2 -translate-y-1/2"
        style={{ width: 'clamp(180px, 16vw, 280px)' }}
      >
        {/* All five frames stay mounted and stacked, cross-fading between
            each other. Mounting on hover would mean decoding an image at the
            exact moment the pointer arrives — which is when a stall is most
            visible, and the reason cursor-follow galleries so often feel
            broken on the first pass through. */}
        <div className="relative">
          {MEMBERS.map((m) => {
            const slug = m.photos.dall ?? m.photos.icarus
            if (!slug) return null
            const active = member?.id === m.id
            return (
              <div
                key={m.id}
                className={active ? 'relative' : 'absolute inset-0'}
                style={{
                  outline: `1px solid ${m.color}`,
                  outlineOffset: 3,
                  opacity: active ? 1 : 0,
                  transition: 'opacity 220ms var(--ease-out-expo)',
                }}
              >
                <Picture slug={slug} alt="" sizes="280px" className="w-full" />
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
