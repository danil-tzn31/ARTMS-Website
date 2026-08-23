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
   * Give this a value wherever several photographs sit together. The scans in
   * this archive run from 0.70 to 2.54, so letting each one set its own frame
   * makes a set of them look like a pile of loose prints.
   */
  ratio?: number
  /**
   * object-position for the crop, e.g. 'center 20%'.
   *
   * The image always fills its frame, which means a frame that disagrees with
   * the source crops it — a 0.70 portrait in a 4:3 frame loses just over half
   * its height. Aim this wherever that matters. A centred crop on a portrait
   * takes the chin and leaves the eyes above the frame.
   */
  focus?: string
  className?: string
  imgClassName?: string
  priority?: boolean
}

/**
 * AVIF → WebP → nothing, with the manifest's 20px LQIP painted underneath as a
 * blurred ground until the real file decodes. The placeholder is a data URI
 * baked at build time, so it costs no extra request and never flashes empty.
 *
 * Images always cover their frame. `object-fit: contain` was tried and dropped:
 * it leaves the rest of the frame empty, an empty frame is a grey bar, and a
 * bar reads as a border nobody asked for. Filling those bars with a blurred
 * copy of the photo fixed the colour but left a visible seam where sharp met
 * soft. A frame that is genuinely full beats any amount of work spent
 * disguising one that is not — the cost is a real crop, so crops get aimed.
 */
export function Picture({
  slug,
  alt,
  sizes,
  ratio,
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

  return (
    <div
      className={className}
      style={{
        aspectRatio: ratio ?? record.aspect,
        overflow: 'hidden',
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
            objectPosition: focus,
            opacity: loaded ? 1 : 0,
            transition: 'opacity 520ms var(--ease-out-expo)',
          }}
        />
      </picture>
    </div>
  )
}
