import type { Member } from '@/types'
import { ERAS } from '@/data/eras'
import { pad } from '@/lib/format'
import { AnimalMark } from '@/components/AnimalMark'

interface MemberRowProps {
  member: Member
  index: number
  isActive: boolean
  onHover: (member: Member | null) => void
  onSelect: (member: Member) => void
}

/**
 * One full-width row of the member index.
 *
 * Not a card. The section reads as an index — five oversized names stacked with
 * their metadata pushed to the right rail — because five cards in a row is the
 * single most template-shaped thing a group site can do, and it makes every
 * member look interchangeable.
 *
 * The whole row is the button. A small "view" affordance beside a large name
 * makes the name decoration; making the name itself the target says the person
 * is the thing you are clicking.
 */
export function MemberRow({
  member,
  index,
  isActive,
  onHover,
  onSelect,
}: MemberRowProps) {
  return (
    <li style={{ borderTop: '1px solid var(--rule)' }}>
      <button
        type="button"
        onClick={() => onSelect(member)}
        onMouseEnter={() => onHover(member)}
        onMouseLeave={() => onHover(null)}
        onFocus={() => onHover(member)}
        onBlur={() => onHover(null)}
        aria-label={`Open the ${member.name} dossier`}
        data-cursor="Open"
        data-member-row
        className="group relative block w-full overflow-hidden px-[calc(var(--frame)+18px)] text-left"
        style={{
          paddingBlock: isActive
            ? 'clamp(1.6rem, 3vw, 2.6rem)'
            : 'clamp(1rem, 2vw, 1.6rem)',
          transition: 'padding 520ms var(--ease-out-expo)',
        }}
      >
        {/* Colour wipe. A clip-path rather than a width or a transform so the
            fill has a hard vertical edge travelling across the row — a
            scaling block softens at speed and reads as a fade. */}
        <span
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background: member.color,
            clipPath: isActive ? 'inset(0 0 0 0)' : 'inset(0 100% 0 0)',
            transition: 'clip-path 560ms var(--ease-out-expo)',
          }}
        />

        <span
          className="relative flex items-baseline gap-[3vw]"
          style={{
            // Precomputed in members.ts. Deriving readable ink from a hex at
            // runtime is a coin flip on colours this saturated.
            color: isActive ? member.onColor : 'var(--ink)',
            transition: 'color 320ms var(--ease-out-expo)',
          }}
        >
          <span
            className="u-mono tabular-nums"
            style={{ opacity: isActive ? 0.7 : 0.45 }}
          >
            {pad(index + 1)}
          </span>

          <span
            className="u-display fx-inkbleed-soft flex-1 whitespace-nowrap"
            style={
              {
                '--wdth': 82,
                fontSize: 'clamp(2.6rem, 8.5vw, 11rem)',
                fontVariationSettings: '"wdth" var(--wdth), "wght" 800',
                fontStretch: 'normal',
              } as React.CSSProperties
            }
          >
            {member.name}
          </span>

          {/* Metadata rail. Hidden below md — at phone widths the name needs
              the whole row, and the same facts are one tap away. */}
          <span className="hidden shrink-0 items-center gap-[2vw] md:flex">
            <AnimalMark animal={member.mark} size={34} />
            <span className="u-mono w-[11ch]">{member.animal}</span>
            <span
              className="u-mono tabular-nums"
              style={{ opacity: isActive ? 0.8 : 0.55 }}
            >
              {member.color}
            </span>

            {/* Era ticks — filled where the member appears, hollow where they
                do not. This is where Haseul's absence from Hyper-Ego first
                shows up, before anyone opens a dossier. */}
            <span className="flex items-center gap-1.5" aria-hidden="true">
              {ERAS.map((era) => {
                const present = Boolean(member.photos[era.id])
                return (
                  <span
                    key={era.id}
                    className="block size-1.5"
                    style={
                      present
                        ? { background: 'currentColor' }
                        : { border: '1px solid currentColor', opacity: 0.45 }
                    }
                  />
                )
              })}
            </span>
            <span className="u-sr-only">
              Appears in{' '}
              {ERAS.filter((era) => member.photos[era.id])
                .map((era) => era.title)
                .join(', ')}
            </span>
          </span>
        </span>
      </button>
    </li>
  )
}
