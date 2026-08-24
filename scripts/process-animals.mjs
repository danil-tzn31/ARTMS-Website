#!/usr/bin/env node
/**
 * Turns the animal silhouettes into alpha masks.
 *
 * The sources are black-on-white (or black-on-checkerboard, where a PNG's
 * transparency was flattened by a JPEG save). None of them carry usable alpha,
 * and a black raster would be invisible against Hyper-Ego's off-white and
 * wrong under the invert toggle.
 *
 * So the ink becomes alpha and the pixels become white. The app then paints
 * each mark with `mask-image` and `background: currentColor`, exactly like the
 * wordmark — one asset that is correct in every era palette and in both
 * polarities, instead of five assets per theme.
 *
 *   npm run animals
 */
import sharp from 'sharp'
import { mkdir, writeFile, access, stat } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

sharp.cache(false)

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = resolve(process.env.MEDIA_SRC ?? join(ROOT, '..', 'artms media resources'), 'animals')
const OUT = join(ROOT, 'public', 'brand', 'animals')
const MANIFEST = join(ROOT, 'src', 'data', 'animal-marks.json')

/** Source filename → the mark id the app asks for. */
const SOURCES = {
  'rabbit.jpg': 'rabbit',
  'dove.png.jpeg': 'bird',
  'owl.jpg': 'owl',
  'bat.jpg': 'bat',
  'betta.jpg': 'betta',
}

/** Longest edge of the emitted mask. They render at 22–30px. */
const SIZE = 240

const exists = (p) => access(p).then(() => true, () => false)

/**
 * Ink → alpha.
 *
 * The steepening pass is what makes the flattened checkerboard behind the dove
 * disappear: its greys sit around 80% luminance, which lands near zero alpha
 * once the ramp is applied, while the silhouette itself is near-black and
 * clamps to fully opaque. A plain `negate` would have kept the checkerboard as
 * a faint tiled haze around the bird.
 */
async function toMask(srcPath) {
  const grey = sharp(srcPath)
    .flatten({ background: '#ffffff' })
    .greyscale()
    .negate()
    .linear(2.6, -0.42 * 255 * 2.6)

  const { data, info } = await grey.raw().toBuffer({ resolveWithObject: true })

  return sharp({
    create: {
      width: info.width,
      height: info.height,
      channels: 3,
      background: '#ffffff',
    },
  })
    .joinChannel(data, { raw: { width: info.width, height: info.height, channels: 1 } })
    .png()
    .toBuffer()
}

async function main() {
  if (!(await exists(SRC))) {
    console.error(`\n  ✗ Animal sources not found: ${SRC}\n`)
    process.exit(1)
  }
  await mkdir(OUT, { recursive: true })

  /** @type {Record<string, number>} */
  const manifest = {}

  for (const [file, id] of Object.entries(SOURCES)) {
    const srcPath = join(SRC, file)
    if (!(await exists(srcPath))) {
      console.warn(`  ! missing source, skipping: ${file}`)
      continue
    }

    const masked = await toMask(srcPath)

    // Trim to the ink's own bounding box so every mark can be positioned by its
    // edges. Without it, each silhouette carries whatever padding its source
    // happened to have and the row of them looks randomly spaced.
    const trimmed = await sharp(masked).trim({ threshold: 6 }).toBuffer()
    const meta = await sharp(trimmed).metadata()

    const out = join(OUT, `${id}.png`)
    await sharp(trimmed)
      .resize({ width: SIZE, height: SIZE, fit: 'inside', withoutEnlargement: true })
      .png({ compressionLevel: 9, palette: true })
      .toFile(out)

    const written = await sharp(out).metadata()
    manifest[id] = +(written.width / written.height).toFixed(4)

    const { size } = await stat(out)
    console.log(
      `  ✓ ${id.padEnd(8)} ${String(meta.width).padStart(5)}×${String(meta.height).padEnd(5)} → ` +
        `${written.width}×${written.height}  ratio ${manifest[id]}  ${(size / 1024).toFixed(1)} kB`,
    )
  }

  await mkdir(dirname(MANIFEST), { recursive: true })
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`)
  console.log(`\n  ${Object.keys(manifest).length} marks → ${MANIFEST}\n`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
