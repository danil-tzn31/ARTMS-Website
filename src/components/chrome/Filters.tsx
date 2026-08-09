/**
 * The SVG filter definitions the whole page draws on. Rendered once, hidden,
 * and referenced by `filter: url(#id)`.
 *
 * `inkbleed` is the aggressive one for hero-scale type: turbulence displaces
 * the outline, a hair of blur softens it, then a component transfer crushes the
 * alpha ramp back to a hard edge — which is what reads as ink soaking into
 * paper rather than as a blur. `inkbleed-soft` is the same chain at a third of
 * the strength for mid-size headings.
 *
 * Two details that are easy to get wrong and expensive to debug:
 *
 * 1. `color-interpolation-filters="sRGB"`. The SVG default is linearRGB, which
 *    silently shifts every colour that passes through the chain — light text
 *    comes out muddy and dark text comes out washed.
 * 2. The alpha crush uses feComponentTransfer, not feColorMatrix. A colour
 *    matrix that boosts only the alpha row leaves the premultiplied RGB
 *    untouched, so the browser divides by the new, larger alpha on the way out
 *    and the glyphs render near-black. feFuncA sidesteps that entirely.
 *
 * The `baseFrequency` animation is deliberately slow and prime-ish (8.3s) so it
 * never visibly syncs with the scanline drift.
 */
export function Filters() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
    >
      <defs>
        <filter
          id="inkbleed"
          x="-6%"
          y="-14%"
          width="112%"
          height="128%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.013 0.052"
            numOctaves="3"
            seed="7"
            result="noise"
          >
            <animate
              attributeName="baseFrequency"
              dur="8.3s"
              values="0.013 0.052; 0.017 0.061; 0.013 0.052"
              repeatCount="indefinite"
            />
          </feTurbulence>
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="2.6"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="0.45" result="soft" />
          <feComponentTransfer in="soft">
            <feFuncA type="linear" slope="2.6" intercept="-0.42" />
          </feComponentTransfer>
        </filter>

        <filter
          id="inkbleed-soft"
          x="-4%"
          y="-10%"
          width="108%"
          height="120%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.02 0.07"
            numOctaves="2"
            seed="3"
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale="0.9"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displaced"
          />
          <feGaussianBlur in="displaced" stdDeviation="0.25" result="soft" />
          <feComponentTransfer in="soft">
            <feFuncA type="linear" slope="2.2" intercept="-0.32" />
          </feComponentTransfer>
        </filter>
      </defs>
    </svg>
  )
}

/** Full-viewport film grain. Separate from the type filters — different job. */
export function GrainLayer() {
  return (
    <div className="fx-layer fx-grain" aria-hidden="true">
      <svg xmlns="http://www.w3.org/2000/svg">
        <filter id="grain">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.86"
            numOctaves="4"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#grain)" />
      </svg>
    </div>
  )
}
