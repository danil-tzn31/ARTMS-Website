import { useState } from 'react'
import { fallbackSrc, getMedia, srcSet } from '@/lib/media'

interface PictureProps {
  slug: string
  alt: string
  /** Passed straight through to `sizes` — always give this a real value. */
  sizes: string
  className?: string
  imgClassName?: string
  priority?: boolean
}

/**
 * AVIF → WebP → nothing, with the manifest's 20px LQIP painted underneath as a
 * blurred background until the real file decodes. The placeholder is a data URI
 * baked at build time, so it costs no extra request and never flashes empty.
 */
export function Picture({
  slug,
  alt,
  sizes,
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

  return (
    <div
      className={className}
      style={{
        aspectRatio: record.aspect,
        backgroundImage: `url(${record.lqip})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
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
            objectFit: 'cover',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 520ms var(--ease-out-expo)',
          }}
        />
      </picture>
    </div>
  )
}
