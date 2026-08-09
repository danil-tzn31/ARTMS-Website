import { useCallback, useEffect, useState } from 'react'

const KEY = 'artms:invert'

/**
 * Invert is a per-visitor preference, so it lives in localStorage — wrapped,
 * because private windows and locked-down browsers throw on access rather than
 * returning null.
 */
function read(): boolean {
  try {
    return localStorage.getItem(KEY) === '1'
  } catch {
    return false
  }
}

export function useInvert() {
  const [inverted, setInverted] = useState(read)

  useEffect(() => {
    document.documentElement.dataset.invert = String(inverted)
    try {
      localStorage.setItem(KEY, inverted ? '1' : '0')
    } catch {
      /* preference simply will not persist — not worth surfacing */
    }
  }, [inverted])

  const toggle = useCallback(() => setInverted((v) => !v), [])

  return { inverted, toggle }
}
