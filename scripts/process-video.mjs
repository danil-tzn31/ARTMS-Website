#!/usr/bin/env node
/**
 * Re-encodes the hero footage for the web.
 *
 * The source is a 60 s 1080p master (~21 MB). It sits behind a scanline +
 * grain stack at partial opacity, so 720p is visually indistinguishable and
 * roughly a quarter of the bytes. Audio is stripped — the video is decorative
 * and autoplays muted.
 *
 *   npm run video            # both codecs + poster
 *   npm run video -- --only mp4
 */
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { mkdir, stat, access } from 'node:fs/promises'
import { join, resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const run = promisify(execFile)
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = resolve(process.env.MEDIA_SRC ?? join(ROOT, '..', 'artms media resources'))
const IN = join(SRC, 'Hero Video', 'hero.mp4')
const OUT = join(ROOT, 'public', 'media', 'video')

const only = process.argv.includes('--only')
  ? process.argv[process.argv.indexOf('--only') + 1]
  : null

// VP9 is opt-in. Every browser that can run this site plays H.264, and a VP9
// pass over 60 s of denoised 960p costs minutes of CPU to save bytes nobody
// downloads twice. Run `npm run video -- --only webm` if you want it.
const DEFAULT_JOBS = ['mp4', 'poster']

// The master is heavily grained, and grain is the enemy of inter-frame
// compression — a straight 720p/CRF30 pass still came out at 17 MB. Denoising
// first costs nothing visually here (the site lays its own grain and scanlines
// over the top) and cuts the bitrate by ~5x.
const VF = 'scale=960:-2,hqdn3d=4:3:6:4.5,fps=24'
const exists = (p) => access(p).then(() => true, () => false)
const mb = (n) => `${(n / 1024 / 1024).toFixed(2)} MB`

/** @type {Record<string, string[]>} */
const JOBS = {
  mp4: [
    '-i', IN, '-an', '-vf', VF,
    '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow',
    '-crf', '36', '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart', '-y',
  ],
  webm: [
    '-i', IN, '-an', '-vf', VF,
    '-c:v', 'libvpx-vp9', '-crf', '42', '-b:v', '0',
    '-row-mt', '1', '-cpu-used', '8', '-deadline', 'good',
    '-pix_fmt', 'yuv420p', '-y',
  ],
  // Frame 1.5 s in — the very first frames of the master are a black fade.
  poster: [
    '-ss', '1.5', '-i', IN, '-frames:v', '1', '-vf', 'scale=1280:-2',
    '-q:v', '4', '-y',
  ],
}

async function main() {
  if (!(await exists(IN))) {
    console.error(`\n  ✗ Hero master not found: ${IN}\n`)
    process.exit(1)
  }
  await mkdir(OUT, { recursive: true })

  for (const [name, args] of Object.entries(JOBS)) {
    if (only ? only !== name : !DEFAULT_JOBS.includes(name)) continue
    const ext = name === 'poster' ? 'jpg' : name
    const out = join(OUT, `hero.${ext}`)
    const t0 = Date.now()
    process.stdout.write(`  … ${name}`)
    await run('ffmpeg', ['-v', 'error', ...args, out], { maxBuffer: 1 << 24 })
    const { size } = await stat(out)
    console.log(`\r  ✓ ${name.padEnd(7)} ${mb(size).padStart(9)}  ${((Date.now() - t0) / 1000).toFixed(1)}s`)
  }
  console.log()
}

main().catch((err) => {
  console.error(err.stderr ?? err)
  process.exit(1)
})
