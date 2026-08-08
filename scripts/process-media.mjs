#!/usr/bin/env node
/**
 * Turns the raw scans into responsive AVIF/WebP sets plus a base64 LQIP.
 *
 * Resumable by design: anything whose derivatives already exist is skipped, so
 * the script can be interrupted and re-run without redoing work. Pass --force
 * to regenerate everything.
 *
 *   npm run media
 *   MEDIA_SRC="/path/to/scans" npm run media -- --force
 */
import sharp from 'sharp'
import { mkdir, writeFile, access, stat } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ALL_IMAGES, WIDTHS, FORMATS, QUALITY, LQIP_WIDTH } from './media.config.mjs'

// Large scans (some are 38 MB / 100 MP) will exhaust memory if libvips is left
// to its defaults. One thread, no tile cache — slower, but it finishes.
sharp.cache(false)
sharp.concurrency(1)

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = resolve(process.env.MEDIA_SRC ?? join(ROOT, '..', 'artms media resources'))
const OUT = join(ROOT, 'public', 'media')
const MANIFEST = join(ROOT, 'src', 'data', 'media-manifest.json')
const FORCE = process.argv.includes('--force')
const LIMIT = Number(process.env.MEDIA_LIMIT ?? Infinity)

const exists = (p) => access(p).then(() => true, () => false)
const bytes = (n) => `${(n / 1024).toFixed(0)} kB`

async function derive(srcPath, slug) {
  const image = sharp(srcPath, { limitInputPixels: false })
  const meta = await image.metadata()
  const aspect = +(meta.width / meta.height).toFixed(4)

  const widths = WIDTHS.filter((w) => w <= meta.width)
  if (widths.length === 0) widths.push(meta.width)

  let written = 0
  for (const format of FORMATS) {
    for (const w of widths) {
      const out = join(OUT, format, `${slug}-${w}.${format}`)
      if (!FORCE && (await exists(out))) continue
      await mkdir(dirname(out), { recursive: true })
      await sharp(srcPath, { limitInputPixels: false })
        .resize({ width: w, withoutEnlargement: true })
        .toFormat(format, { quality: QUALITY[format], effort: format === 'avif' ? 4 : 4 })
        .toFile(out)
      written += (await stat(out)).size
    }
  }

  const lqipBuffer = await sharp(srcPath, { limitInputPixels: false })
    .resize({ width: LQIP_WIDTH })
    .webp({ quality: 30 })
    .toBuffer()

  return {
    slug,
    aspect,
    width: meta.width,
    height: meta.height,
    widths,
    lqip: `data:image/webp;base64,${lqipBuffer.toString('base64')}`,
    _written: written,
  }
}

async function main() {
  if (!(await exists(SRC))) {
    console.error(`\n  ✗ Media source not found: ${SRC}`)
    console.error(`    Set MEDIA_SRC to the folder holding the original scans.\n`)
    process.exit(1)
  }

  let manifest = {}
  if (!FORCE && (await exists(MANIFEST))) {
    manifest = JSON.parse(await import('node:fs').then((fs) => fs.readFileSync(MANIFEST, 'utf8')))
  }

  const entries = Object.entries(ALL_IMAGES)
  let processed = 0
  let skipped = 0

  for (const [rel, slug] of entries) {
    if (processed >= LIMIT) break

    const srcPath = join(SRC, rel)
    if (!(await exists(srcPath))) {
      console.warn(`  ! missing source, skipping: ${rel}`)
      continue
    }

    const lastFile = join(OUT, FORMATS.at(-1), `${slug}-${WIDTHS[0]}.${FORMATS.at(-1)}`)
    if (!FORCE && manifest[slug] && (await exists(lastFile))) {
      skipped++
      continue
    }

    const t0 = Date.now()
    const record = await derive(srcPath, slug)
    const size = record._written
    delete record._written
    manifest[slug] = record
    processed++
    console.log(
      `  ✓ ${slug.padEnd(18)} ${String(record.width).padStart(5)}px  →  ${bytes(size).padStart(8)}  ${Date.now() - t0}ms`,
    )
  }

  await mkdir(dirname(MANIFEST), { recursive: true })
  await writeFile(MANIFEST, `${JSON.stringify(manifest, null, 2)}\n`)

  const remaining = entries.length - Object.keys(manifest).length
  console.log(
    `\n  ${processed} processed · ${skipped} up to date · ${remaining} remaining · manifest: ${Object.keys(manifest).length} entries\n`,
  )
  if (remaining > 0 && LIMIT !== Infinity) process.exitCode = 0
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
