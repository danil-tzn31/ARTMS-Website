/**
 * The ARTMS wordmark, painted as a CSS mask rather than served as an `<img>`.
 *
 * The source sheet only carries a white copy and a black copy. Either one goes
 * invisible against half of this site — white disappears the moment the page
 * flips to Hyper-Ego's off-white, black disappears everywhere before that. As a
 * mask the mark takes `background: currentColor`, so it re-colours itself with
 * every era and inverts correctly with the invert toggle.
 */
const ASPECT = 6.5813

interface WordmarkProps {
  /** Rendered height in px. Width follows from the mark's own aspect ratio. */
  height?: number
  /**
   * Fill the container's width instead, deriving height from the aspect ratio.
   * Used for the closing mark, which runs the full width of the page.
   */
  fluid?: boolean
  className?: string
  title?: string
}

export function Wordmark({
  height = 22,
  fluid = false,
  className = '',
  title,
}: WordmarkProps) {
  return (
    <span
      role="img"
      aria-label={title ?? 'ARTMS'}
      className={className}
      style={{
        display: 'block',
        ...(fluid
          ? { width: '100%', aspectRatio: ASPECT }
          : { height, width: height * ASPECT }),
        background: 'currentColor',
        // See AnimalMark: unprefixed masks are Safari 15.4+, and the failure
        // mode is a solid bar rather than a missing wordmark.
        maskImage: `url(${import.meta.env.BASE_URL}brand/artms-wordmark.png)`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
        WebkitMaskImage: `url(${import.meta.env.BASE_URL}brand/artms-wordmark.png)`,
        WebkitMaskSize: 'contain',
        WebkitMaskRepeat: 'no-repeat',
        WebkitMaskPosition: 'center',
      }}
    />
  )
}
