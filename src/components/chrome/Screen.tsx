import { GrainLayer } from './Filters'

/** The fixed overlay stack: scanlines, CRT sweep, grain, vignette. */
export function Screen() {
  return (
    <>
      <div className="fx-layer fx-scanlines" aria-hidden="true" />
      <div className="fx-layer fx-sweep" aria-hidden="true" />
      <GrainLayer />
      <div className="fx-layer fx-vignette" aria-hidden="true" />
    </>
  )
}
