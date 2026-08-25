export interface Credit {
  /** What is being credited. */
  label: string
  /** Who it belongs to, as they should be named. */
  name: string
  url?: string
  note?: string
}

/**
 * Attribution, supplied by the site's owner.
 *
 * Nothing here is inferred or filled in. Every photograph on this site belongs
 * to someone, and a credits section that guesses is worse than one that is
 * short — a wrong attribution is not a smaller error than a missing one.
 */
export const CREDITS: Credit[] = [
  {
    label: 'Media',
    name: 'Modhaus',
    note: 'All photography, artwork and video',
  },
  {
    label: 'Scanned images',
    name: '@pika_chuuves',
    url: 'https://x.com/pika_chuuves',
    note: 'Album scans',
  },
]

/**
 * The colophon. Beside the credits because the typefaces are borrowed work too,
 * and a site this typographic should say whose.
 */
export const COLOPHON: Credit[] = [
  {
    label: 'Display',
    name: 'Archivo',
    url: 'https://fonts.google.com/specimen/Archivo',
  },
  {
    label: 'Mono',
    name: 'Space Mono',
    url: 'https://fonts.google.com/specimen/Space+Mono',
  },
  {
    label: 'Serif',
    name: 'Instrument Serif',
    url: 'https://fonts.google.com/specimen/Instrument+Serif',
  },
  {
    label: 'Hangul',
    name: 'Noto Sans KR',
    url: 'https://fonts.google.com/noto/specimen/Noto+Sans+KR',
  },
  { label: 'Built with', name: 'Vite · React · GSAP · Lenis' },
]
