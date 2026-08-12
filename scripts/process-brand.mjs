#!/usr/bin/env node
/**
 * Extracts the two brand assets that are not photographs.
 *
 * 1. The wordmark. `artms logo.png` is a 4321×4320 sheet holding two copies of
 *    the mark — black on top, white below — with everything else transparent.
 *    We take the white band, trim it to its own bounding box, and write it as a
 *    white-on-transparent PNG.
 *
 *    The site then paints it with `mask-image` rather than `<img>`, so the mark
 *    takes `background: var(--ink)` and re-colours itself with every era. A
 *    baked-in white PNG would go invisible the moment the page flips to
 *    Hyper-Ego's off-white.
 *
 * 2. The preloader loop. The source is a 1.4 MB 90-frame GIF of a rotating
 *    silver cross with transparency. Animated WebP holds the alpha, plays
 *    everywhere this site runs, and is a fraction of the size.
 *
 *   npm run brand
 */
import sharp from 'sharp'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdir, stat, access } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const run = promisify(execFile)
sharp.cache(false)

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = resolve(process.env.MEDIA_SRC ?? join(ROOT, '..', 'artms media resources'))
const OUT = join(ROOT, 'public', 'brand')

/** Row range of the white copy on the source sheet, found by alpha profile. */
const WHITE_BAND = { top: 2586, height: 535 }

const exists = (p) => access(p).then(() => true, () => false)
const kb = (n) => `${(n / 1024).toFixed(1)} kB`

async function wordmark() {
  const src = join(SRC, 'artms logo.png')
  if (!(await exists(src))) throw new Error(`missing ${src}`)

  const sheet = await sharp(src).metadata()

  // Two passes on purpose. sharp fixes its operation order internally, so an
  // extract and a trim chained together do not run in the order they are
  // written — the band has to be materialised before it can be trimmed.
  const band = await sharp(src)
    .extract({
      left: 0,
      top: WHITE_BAND.top,
      width: sheet.width,
      height: WHITE_BAND.height,
    })
    .toBuffer()

  // Trim to the glyphs' own bounding box so the mark can be positioned by its
  // edges rather than by guessing at transparent padding.
  const trimmed = await sharp(band).trim({ threshold: 8 }).toBuffer()
  const meta = await sharp(trimmed).metadata()

  const out = join(OUT, 'artms-wordmark.png')
  await sharp(trimmed)
    .resize({ width: 1200, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toFile(out)

  const { size } = await stat(out)
  console.log(
    `  ✓ artms-wordmark.png   ${meta.width}×${meta.height} → 1200w   ${kb(size)}`,
  )
  return { aspect: +(meta.width / meta.height).toFixed(4) }
}

async function preloader() {
  const src = join(SRC, 'output-onlinegiftools.gif')
  if (!(await exists(src))) throw new Error(`missing ${src}`)

  const out = join(OUT, 'sigil.webp')
  await run('ffmpeg', [
    '-v', 'error', '-i', src,
    '-vcodec', 'libwebp_anim',
    '-lossless', '0', '-q:v', '46', '-compression_level', '6',
    '-loop', '0', '-preset', 'picture',
    // yuva420p, not yuv420p. libwebp_anim silently drops the alpha channel
    // otherwise, and the sigil arrives as a black square.
    '-pix_fmt', 'yuva420p',
    // 320 px at 20 fps. The sigil is rendered at ~180 px on screen, spins
    // slowly, and is on screen for three seconds — 90 frames at 420 px was
    // 648 kB of blocking payload for detail nobody can resolve.
    '-vf', 'scale=320:-1:flags=lanczos,fps=20',
    '-y', out,
  ])

  // A still frame for reduced-motion, and as the poster while the loop decodes.
  const still = join(OUT, 'sigil-still.webp')
  await run('ffmpeg', [
    '-v', 'error', '-i', src, '-frames:v', '1',
    '-vf', 'scale=320:-1:flags=lanczos', '-pix_fmt', 'yuva420p', '-y', still,
  ])

  const [a, b] = await Promise.all([stat(out), stat(still)])
  const orig = await stat(src)
  console.log(
    `  ✓ sigil.webp           60f @20fps, 3.0s   ${kb(orig.size)} → ${kb(a.size)}`,
  )
  console.log(`  ✓ sigil-still.webp     ${kb(b.size)}`)
}

await mkdir(OUT, { recursive: true })
const { aspect } = await wordmark()
await preloader()
console.log(`\n  wordmark aspect ratio: ${aspect}\n`)
