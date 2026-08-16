import { ERAS } from '@/data/eras'
import { EraPanel } from './EraPanel'

/**
 * Three stacked panels, one per release, each re-skinning the whole page as it
 * enters (see `useEraTheme` — it resolves `#era-<id>` by element, so the ids on
 * EraPanel are load-bearing, not decorative).
 *
 * Deliberately not pinned. Three pinned full-height panels in a row makes a
 * page feel like it has stopped responding to the wheel, and the palette
 * crossfade already gives each era its own beat.
 */
export function Eras() {
  return (
    <section id="eras" className="relative">
      {ERAS.map((era, i) => (
        <EraPanel key={era.id} era={era} index={i} />
      ))}
    </section>
  )
}
