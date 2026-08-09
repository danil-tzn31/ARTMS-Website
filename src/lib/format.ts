const LONG = new Intl.DateTimeFormat('en-GB', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
})

/** `2024-05-31` → `31 MAY 2024` */
export function formatDate(iso: string): string {
  return LONG.format(new Date(`${iso}T00:00:00Z`)).toUpperCase()
}

/** `2024-05-31` → `2024.05.31` — the form used on Korean release art. */
export function formatDotted(iso: string): string {
  return iso.replaceAll('-', '.')
}

export function pad(n: number, width = 2): string {
  return String(n).padStart(width, '0')
}
