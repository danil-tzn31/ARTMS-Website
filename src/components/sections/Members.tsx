import { useRef, useState } from 'react'
import type { Member } from '@/types'
import { MEMBERS } from '@/data/members'
import { SectionMarker } from '@/components/SectionMarker'
import { MemberRow } from './MemberRow'
import { MemberHoverPhoto } from './MemberHoverPhoto'
import { MemberDossier } from './MemberDossier'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'

const STATEMENT = ['Five, and the shapes', 'they arrived in.']

export function Members() {
  const root = useRef<HTMLElement>(null)
  const [hovered, setHovered] = useState<Member | null>(null)
  const [selected, setSelected] = useState<Member | null>(null)

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const section = root.current
      if (!section) return

      const triggers: ScrollTrigger[] = []

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 78%',
          end: 'top 26%',
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      })
      if (tl.scrollTrigger) triggers.push(tl.scrollTrigger)

      tl.fromTo(
        '[data-members-head]',
        { autoAlpha: 0, y: 34 },
        { autoAlpha: 1, y: 0, ease: 'none', stagger: 0.08 },
        0,
      )

      // Rows wipe up from their own baseline rather than fading. At this size a
      // fade reads as the page failing to load; a clip reads as type being set.
      const batch = ScrollTrigger.batch(
        gsap.utils.toArray<HTMLElement>('[data-member-row]', section),
        {
          start: 'top 90%',
          once: true,
          onEnter: (els) =>
            gsap.fromTo(
              els,
              { clipPath: 'inset(0 0 100% 0)', y: 30 },
              {
                clipPath: 'inset(0 0 0% 0)',
                y: 0,
                duration: 0.85,
                stagger: 0.07,
                ease: 'expo.out',
              },
            ),
        },
      )
      triggers.push(...batch)

      return () => triggers.forEach((t) => t.kill())
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      id="members"
      className="relative overflow-x-clip py-[14vh]"
      aria-labelledby="members-heading"
    >
      <div className="px-[calc(var(--frame)+28px)]">
        <SectionMarker
          n="003"
          label="Members"
          side="right"
          className="ml-auto w-full lg:w-1/2"
        />

        <h2
          id="members-heading"
          data-members-head
          className="u-serif mt-[8vh] max-w-[22ch] lg:ml-[16%]"
          style={{ fontSize: 'clamp(1.5rem, 3.2vw, 3.4rem)', lineHeight: 1.12 }}
        >
          {STATEMENT.map((line, i) => (
            <span
              key={line}
              className="block"
              style={{ paddingLeft: i === 1 ? 'clamp(1rem, 5vw, 5.5rem)' : 0 }}
            >
              {line}
            </span>
          ))}
        </h2>
      </div>

      {/* The list runs edge to edge — the rows are the section's structure, so
          they carry the frame's rule rather than sitting inside a column. */}
      <ol
        className="mt-[10vh]"
        style={{ borderBottom: '1px solid var(--rule)' }}
        onMouseLeave={() => setHovered(null)}
      >
        {MEMBERS.map((member, i) => (
          <MemberRow
            key={member.id}
            member={member}
            index={i}
            isActive={hovered?.id === member.id}
            onHover={setHovered}
            onSelect={setSelected}
          />
        ))}
      </ol>

      <p data-members-head className="u-mono u-dim mt-6 px-[calc(var(--frame)+28px)]">
        Select a name — full record, every era
      </p>

      <MemberHoverPhoto member={selected ? null : hovered} />
      <MemberDossier member={selected} onClose={() => setSelected(null)} />
    </section>
  )
}
