import type { AnimalMarkId } from '@/types'
import MARKS from '@/data/animal-marks.json'

const RASTER = MARKS as Partial<Record<AnimalMarkId, number>>

interface AnimalMarkProps {
  animal: AnimalMarkId
  /** Side of the square the mark is fitted inside, in px. */
  size?: number
  className?: string
}

/**
 * The members' representative animals.
 *
 * Supplied as black silhouettes and converted by `npm run animals` into alpha
 * masks. The app paints them with `mask-image` over `currentColor` rather than
 * dropping in an `<img>` — the same trick the wordmark uses, and for the same
 * reason: a black raster is invisible against Hyper-Ego's off-white and wrong
 * under the invert toggle. As masks they inherit whatever ink the palette
 * currently holds, so one asset covers every era and both polarities.
 *
 * Each mark is fitted inside a square box rather than sized by height. The
 * silhouettes range from 0.46 (the owl, tall and narrow) to 1.86 (the bat,
 * wide and short); matching their heights would make the bat enormous beside
 * the owl. A common box keeps their visual weight comparable, which is what
 * the eye actually compares in a list.
 */
export function AnimalMark({ animal, size = 26, className }: AnimalMarkProps) {
  if (!RASTER[animal]) {
    // Renders nothing rather than a placeholder. The mark is decorative — the
    // animal's name sits beside it in every place this is used — so a gap is
    // better than a stand-in that looks like a different family of mark.
    if (import.meta.env.DEV) {
      console.warn(
        `[brand] no mask for "${animal}" — add its source to SOURCES in ` +
          `scripts/process-animals.mjs and run \`npm run animals\``,
      )
    }
    return null
  }

  return (
    <span
      role="img"
      aria-hidden="true"
      className={className}
      style={{
        display: 'block',
        width: size,
        height: size,
        flexShrink: 0,
        background: 'currentColor',
        maskImage: `url(${import.meta.env.BASE_URL}brand/animals/${animal}.png)`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
      }}
    />
  )
}
