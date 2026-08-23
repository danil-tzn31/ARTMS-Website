import { useState } from 'react'
import { fallbackSrc, getMedia, srcSet } from '@/lib/media'

interface PictureProps {
  slug: string
  alt: string
  /** Passed straight through to `sizes` — always give this a real value. */
  sizes: string
  /**
   * Frame aspect ratio (width / height). Omit to use the source's own.
   *
   * Give this a value wherever several photographs sit together: the scans in
   * this archive run from 0.70 to 2.54, so letting each one set its own frame
   * makes a row of them look like a pile rather than a set.
   */
  ratio?: number
  /**
   * `cover` fills the frame and crops; `contain` fits the whole image inside
   * it and letterboxes. Use `contain` where the photograph is the subject and
   * cropping it would be vandalism — a member's portrait, for instance.
   */
  fit?: 'cover' | 'contain'
  /** object-position. Portraits usually want 'center 25%' so faces survive a crop. */
  focus?: string
  className?: string
  imgClassName?: string
  priority?: boolean
}

/**
 * AVIF → WebP → nothing, with the manifest's 20px LQIP painted underneath as a
 * blurred ground until the real file decodes. The placeholder is a data URI
 * baked at build time, so it costs no extra request and never flashes empty.
 */
export function Picture({
  slug,
  alt,
  sizes,
  ratio,
  fit = 'cover',
  focus = 'center',
  className,
  imgClassName,
  priority = false,
}: PictureProps) {
  const [loaded, setLoaded] = useState(false)
  const record = getMedia(slug)

  if (!record) {
    if (import.meta.env.DEV) {
      console.warn(`[media] no manifest entry for "${slug}" — run \`npm run media\``)
    }
    return null
  }

  // The LQIP is only a useful ground when the image will fill the frame. Under
  // `contain` it would bleed out around the letterbox as a blurred halo, which
  // reads as a rendering fault rather than as a placeholder.
  const showLqip = fit === 'cover'

  return (
    <div
      className={className}
      style={{
        aspectRatio: ratio ?? record.aspect,
        overflow: 'hidden',
        ...(showLqip
          ? {
              backgroundImage: `url(${record.lqip})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }
          : { background: 'color-mix(in srgb, var(--ink) 6%, transparent)' }),
      }}
    >
      <picture>
        <source type="image/avif" srcSet={srcSet(slug, 'avif')} sizes={sizes} />
        <source type="image/webp" srcSet={srcSet(slug, 'webp')} sizes={sizes} />
        <img
          src={fallbackSrc(slug)}
          alt={alt}
          width={record.width}
          height={record.height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setLoaded(true)}
          className={imgClassName}
          style={{
            width: '100%',
            height: '100%',
            objectFit: fit,
            objectPosition: focus,
            opacity: loaded ? 1 : 0,
            transition: 'opacity 520ms var(--ease-out-expo)',
          }}
        />
      </picture>
    </div>
  )
}
