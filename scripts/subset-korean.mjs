#!/usr/bin/env node
/**
 * Subsets Noto Sans KR down to the handful of hangul the site actually sets.
 *
 * The published Korean subset is a 539 kB woff2 — an absurd price for five
 * member names, five legal names and one track title. Harfbuzz gets that to
 * 2.5 kB. Re-run with `npm run fonts` if the copy ever changes; the output is
 * committed so a plain `npm ci && npm run build` needs nothing extra.
 */
import subsetFont from 'subset-font'
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(
  ROOT,
  'node_modules/@fontsource/noto-sans-kr/files/noto-sans-kr-korean-500-normal.woff2',
)
const OUT = join(ROOT, 'public/fonts/noto-sans-kr-subset.woff2')

/**
 * Every hangul string rendered anywhere on the site. Keep this list in sync
 * with src/data — the script prints the glyph count so a forgotten addition is
 * visible in the build log rather than as tofu in the browser.
 */
const STRINGS = [
  '희진', '하슬', '김립', '진솔', '최리',
  '전희진', '조하슬', '김정은', '정진솔', '최예림',
  '조난',
  '부재',
  '아르테미스',
]

const chars = [...new Set(STRINGS.join('').split(''))].sort().join('')

const original = await readFile(SRC)
const subset = await subsetFont(original, chars, { targetFormat: 'woff2' })

await mkdir(dirname(OUT), { recursive: true })
await writeFile(OUT, subset)

const pct = ((1 - subset.length / original.length) * 100).toFixed(1)
console.log(
  `\n  ✓ noto-sans-kr-subset.woff2  ${chars.length} glyphs  ` +
    `${(original.length / 1024).toFixed(0)} kB → ${(subset.length / 1024).toFixed(1)} kB  (−${pct}%)\n`,
)
