/**
 * A four-point star that rides the tip of a line as it draws.
 *
 * Painted in currentColor, glow included, so whoever places it only has to set
 * `color` to recolour all of it. The twinkle is transform-only, so it runs on
 * the compositor and never asks for a repaint of the glow.
 */
export function Spark({
  className = '',
  ...rest
}: React.ComponentPropsWithoutRef<'span'>) {
  return (
    <span aria-hidden="true" className={`spark ${className}`} {...rest}>
      <svg viewBox="0 0 20 20" width="100%" height="100%">
        <path
          d="M10 0 C10.9 6.2 13.8 9.1 20 10 C13.8 10.9 10.9 13.8 10 20 C9.1 13.8 6.2 10.9 0 10 C6.2 9.1 9.1 6.2 10 0 Z"
          fill="currentColor"
        />
      </svg>
    </span>
  )
}
