import type { ReactNode } from 'react'

/**
 * Four hairlines inset from the viewport edge, drawn above everything.
 *
 * This is the site's chassis. The navbar is not positioned *near* the edge — it
 * is mounted *on* these rules, which is what stops the header reading as a
 * template component sitting on top of a page.
 */
export function EdgeFrame({ children }: { children?: ReactNode }) {
  return (
    <div
      className="pointer-events-none fixed z-[100]"
      style={{ inset: 'var(--frame)' }}
      aria-hidden={false}
    >
      <span className="u-rule absolute inset-x-0 top-0 border-t" />
      <span className="u-rule absolute inset-x-0 bottom-0 border-b" />
      <span className="u-rule absolute inset-y-0 left-0 border-l" />
      <span className="u-rule absolute inset-y-0 right-0 border-r" />

      {/* Corner ticks — 8px marks that make the frame read as a registration
          crop rather than a border. */}
      {(
        [
          ['top-0 left-0', 'border-t border-l'],
          ['top-0 right-0', 'border-t border-r'],
          ['bottom-0 left-0', 'border-b border-l'],
          ['bottom-0 right-0', 'border-b border-r'],
        ] as const
      ).map(([pos, edges]) => (
        <span
          key={pos}
          className={`u-rule absolute size-2 ${pos} ${edges}`}
          style={{ borderColor: 'var(--rule-strong)' }}
        />
      ))}

      {children}
    </div>
  )
}
