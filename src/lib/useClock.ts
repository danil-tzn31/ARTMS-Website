import { useEffect, useState } from 'react'

const FORMATTER = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Asia/Seoul',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

/**
 * KST wall clock. The group's releases are dated in Seoul time, so the site
 * keeps Seoul time — a small thing that makes the metadata feel authored.
 */
export function useClock() {
  const [time, setTime] = useState(() => FORMATTER.format(new Date()))

  useEffect(() => {
    const id = setInterval(() => setTime(FORMATTER.format(new Date())), 1000)
    return () => clearInterval(id)
  }, [])

  return time
}
