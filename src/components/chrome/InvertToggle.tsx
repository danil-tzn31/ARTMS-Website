interface InvertToggleProps {
  inverted: boolean
  onToggle: () => void
}

export function InvertToggle({ inverted, onToggle }: InvertToggleProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={inverted}
      className="u-mono-sm pointer-events-auto group flex items-center gap-2 px-2.5 py-1.5 transition-colors"
      style={{
        border: '1px solid var(--accent)',
        color: 'var(--accent)',
      }}
    >
      <span
        className="inline-block size-1.5 transition-transform duration-300"
        style={{
          background: 'var(--accent)',
          transform: inverted ? 'rotate(45deg) scale(1.15)' : 'none',
        }}
      />
      <span>{inverted ? 'Revert' : 'Invert'} Site</span>
    </button>
  )
}
