import type { AnimalMarkId } from '@/types'

/**
 * The members' representative animals, drawn as inline SVG.
 *
 * These were Egyptian hieroglyphs (𓃹 𓅐 𓅓 𓆝 𓃵) — the right idea and completely
 * unusable: no font on any mainstream system carries that block, so every one
 * of them rendered as a tofu box. Shipping a glyph that depends on a font the
 * visitor probably does not have is shipping a missing character.
 *
 * Drawn rather than photographed, in the same hairline weight as the cursor
 * crosshair and the frame rules, so the marks read as part of the interface
 * rather than as clip art. They inherit `currentColor`, which is what lets them
 * survive both the era palettes and the invert toggle.
 */
const PATHS: Record<AnimalMarkId, React.ReactNode> = {
  rabbit: (
    <>
      <path d="M9.2 3.4c-1.5 3-1.5 6.3 0 8.8" />
      <path d="M14.2 4c1.5 2.9 1.5 5.9 0 8.4" />
      <circle cx="11.6" cy="16.2" r="4.3" />
      <path d="M10.2 16.4h2.8" />
    </>
  ),
  bird: (
    <>
      <path d="M2.5 14.2c4.6-1 7.4-3.7 9.8-8.2 1 3.1 2.6 5.1 5.6 6.1-2.6 2.7-6.7 4.2-10.8 3.6" />
      <path d="M11.4 15.6 20.4 20" />
      <circle cx="13.4" cy="8.6" r=".7" fill="currentColor" stroke="none" />
    </>
  ),
  owl: (
    <>
      <circle cx="8.6" cy="10.8" r="3.1" />
      <circle cx="15.4" cy="10.8" r="3.1" />
      <path d="M12 13.6 10.4 16.3h3.2z" />
      <path d="M4.6 7.4 8.2 4.9" />
      <path d="M19.4 7.4 15.8 4.9" />
    </>
  ),
  betta: (
    <>
      <path d="M3.4 12.2c3-4.1 7.1-5.7 10.1-5.1 0 2.6.5 4.6 2 6.1-2 2.6-5.1 3.6-8.1 3-2.1-.5-3.3-2-4-4z" />
      <path d="M15.5 9.4c2-1.6 4-1.6 5.6 0-1 1.6-1 3.6 0 5.2-2 1-4.1.5-5.6-1.6" />
      <circle cx="7" cy="11" r=".9" fill="currentColor" stroke="none" />
    </>
  ),
  bat: (
    <>
      <path d="M12 8.6c-1.2 0-2.1.8-2.1 1.9 0 1.4 1 2.5 2.1 3.3 1.1-.8 2.1-1.9 2.1-3.3 0-1.1-.9-1.9-2.1-1.9z" />
      <path d="M9.9 10.1C8.3 8.2 6.7 7.4 5.1 7.6c.4 1 .3 2-.3 2.7 1.7.2 2.9 1.2 3.8 3" />
      <path d="M14.1 10.1c1.6-1.9 3.2-2.7 4.8-2.5-.4 1-.3 2 .3 2.7-1.7.2-2.9 1.2-3.8 3" />
      <path d="m10.8 6.3 1.2 1.6 1.2-1.6" />
    </>
  ),
}

interface AnimalMarkProps {
  animal: AnimalMarkId
  /** Rendered box, in px. */
  size?: number
  className?: string
}

export function AnimalMark({ animal, size = 26, className }: AnimalMarkProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {PATHS[animal]}
    </svg>
  )
}
