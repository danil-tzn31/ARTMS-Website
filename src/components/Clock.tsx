import { useClock } from '@/lib/useClock'

/**
 * The ticking KST time on its own. Read through the hook inside a section, the
 * once-a-second update re-rendered that whole section with it, and in App it
 * re-rendered the entire page every second. Now only this text changes.
 */
export function Clock() {
  return <>{useClock()}</>
}
