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
  className?: string
  title?: string
}

export function Wordmark({ height = 22, className = '', title }: WordmarkProps) {
  return (
    <span
      role="img"
      aria-label={title ?? 'ARTMS'}
      className={className}
      style={{
        display: 'block',
        height,
        width: height * ASPECT,
        background: 'currentColor',
        maskImage: `url(${import.meta.env.BASE_URL}brand/artms-wordmark.png)`,
        maskSize: 'contain',
        maskRepeat: 'no-repeat',
        maskPosition: 'center',
      }}
    />
  )
}
