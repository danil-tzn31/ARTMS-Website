import { useState } from 'react'

const KEY = 'artms-desktop-note'

/** Phones and portrait tablets. A tablet held sideways gets the full layout. */
const QUERY = '(pointer: coarse) and (max-width: 1023px)'

/** Whether it was closed on an earlier visit. Storage can throw in private
    browsing, which just means the note shows again. */
function closedBefore() {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

/**
 * A short note to phone visitors that the site is at its best on a computer.
 * The phone version is a lighter cut of the motion, and the full piece wants
 * a bigger screen and more power than a phone has to give it. Once closed it
 * stays closed.
 */
export function DesktopNote() {
  const [open, setOpen] = useState(
    () => window.matchMedia(QUERY).matches && !closedBefore(),
  )
  if (!open) return null

  const close = () => {
    setOpen(false)
    try {
      localStorage.setItem(KEY, '1')
    } catch {
      // Nowhere to remember it. It will show again next visit, which is fine.
    }
  }

  return (
    <div
      role="note"
      className="u-mono-sm fixed z-[110] flex items-center justify-between gap-4 px-3 py-2.5"
      style={{
        left: 'calc(var(--frame) + 12px)',
        right: 'calc(var(--frame) + 12px)',
        bottom: 'calc(var(--frame) + 18px)',
        background: 'var(--bg)',
        color: 'var(--ink)',
        border: '1px solid var(--rule-strong)',
      }}
    >
      <span>Best viewed on a computer</span>
      <button
        type="button"
        onClick={close}
        aria-label="Close this note"
        className="u-mono-sm px-1"
        style={{ color: 'var(--accent)' }}
      >
        Close
      </button>
    </div>
  )
}
