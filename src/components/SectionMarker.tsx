interface SectionMarkerProps {
  /** Zero-padded section number, e.g. '002'. */
  n: string
  label: string
  /** Which frame edge the marker is pinned to. Sections alternate. */
  side?: 'left' | 'right'
  /** Optional qualifier, e.g. '.1 / Dall'. */
  sub?: string
  className?: string
}

/**
 * `N°002 / ERAS ─────────` — a mono marker with a hairline running out to the
 * frame edge.
 *
 * Borrowed from pxpush, and it does real work: it tells you where you are in a
 * page that has no conventional headers, and the rule ties the content back to
 * the edge frame so the two read as one system rather than as a page inside a
 * border.
 */
export function SectionMarker({
  n,
  label,
  side = 'left',
  sub,
  className = '',
}: SectionMarkerProps) {
  const rule = (
    <span
      aria-hidden="true"
      className="block h-px flex-1"
      style={{ background: 'var(--rule-strong)' }}
    />
  )

  return (
    <div
      className={`flex items-center gap-3 ${side === 'right' ? 'flex-row-reverse' : ''} ${className}`}
    >
      <span className="u-mono-sm whitespace-nowrap">
        <span style={{ color: 'var(--accent)' }}>N°{n}</span>
        <span className="u-dim"> / </span>
        <span>{label}</span>
        {sub && <span className="u-dim">{sub}</span>}
      </span>
      {rule}
    </div>
  )
}
