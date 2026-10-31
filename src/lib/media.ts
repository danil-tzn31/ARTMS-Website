import manifest from '@/data/media-manifest.json'
import type { MediaRecord } from '@/types'

const RECORDS = manifest as Record<string, MediaRecord>

const BASE = `${import.meta.env.BASE_URL}media`

export function getMedia(slug: string): MediaRecord | undefined {
  return RECORDS[slug]
}

/**
 * Builds a srcset for one format. Widths come from the manifest rather than a
 * constant, because a source narrower than 1920 never had a 1920 derivative
 * written — advertising one would 404 for the visitors on the biggest screens.
 */
export function srcSet(slug: string, format: 'avif' | 'webp'): string | undefined {
  const record = RECORDS[slug]
  if (!record) return undefined
  return record.widths
    .map((w) => `${BASE}/${format}/${slug}-${w}.${format} ${w}w`)
    .join(', ')
}

export function fallbackSrc(slug: string): string | undefined {
  const record = RECORDS[slug]
  if (!record) return undefined
  const widest = record.widths.at(-1)
  return `${BASE}/webp/${slug}-${widest}.webp`
}

/**
 * The hero footage at two widths. The browser takes the first source whose
 * `media` matches, so the large one has to come first. See process-video.mjs
 * for why there are two.
 */
export const VIDEO = {
  sources: [
    { src: `${BASE}/video/hero-1280.mp4`, media: '(min-width: 1024px)' },
    { src: `${BASE}/video/hero-960.mp4` },
  ],
  poster: `${BASE}/video/hero.jpg`,
}
