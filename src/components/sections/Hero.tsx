import { useRef } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { VIDEO } from '@/lib/media'
import { useClock } from '@/lib/useClock'

/**
 * Full-bleed video, one enormous wordmark clipped by the viewport on both
 * sides, and metadata pinned into the corners of the frame.
 *
 * The scroll behaviour is a single scrubbed timeline: the wordmark compresses
 * along Archivo's width axis while it travels up toward the top frame rule. It
 * is the same element the whole way — a fade-out followed by a different
 * element fading in reads as a swap, and the point is that it should read as
 * one continuous move.
 *
 * The width axis is driven through a `--wdth` custom property rather than the
 * `font-stretch` shorthand, because GSAP can interpolate a bare number but not
 * a font-variation-settings string.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null)
  const wordmark = useRef<HTMLHeadingElement>(null)
  const time = useClock()

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      gsap.set(wordmark.current, { '--wdth': 116 })
      gsap.set('[data-hero-fade]', { autoAlpha: 0, y: 14 })
      gsap
        .timeline({ delay: 0.15 })
        .to('[data-hero-fade]', {
          autoAlpha: 1,
          y: 0,
          duration: 1,
          stagger: 0.07,
          ease: 'power3.out',
        })
        .fromTo(
          wordmark.current,
          { '--wdth': 62, autoAlpha: 0 },
          { '--wdth': 116, autoAlpha: 1, duration: 1.4, ease: 'expo.out' },
          0,
        )

      if (reduce) return

      gsap
        .timeline({
          scrollTrigger: {
            trigger: root.current,
            start: 'top top',
            end: '+=90%',
            scrub: 0.6,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
          },
        })
        .to(wordmark.current, { '--wdth': 66, yPercent: -30, scale: 0.5, ease: 'none' }, 0)
        .to('[data-hero-video]', { scale: 1.14, ease: 'none' }, 0)
        .to('[data-hero-scrim]', { opacity: 1, ease: 'none' }, 0)
        .to('[data-hero-fade]', { autoAlpha: 0, ease: 'none' }, 0)
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      id="hero"
      className="relative flex h-[100svh] w-full items-center overflow-hidden"
      aria-label="Introduction"
    >
      <video
        data-hero-video
        className="absolute inset-0 size-full object-cover"
        style={{ filter: 'brightness(0.62) saturate(0.7) contrast(1.15)' }}
        src={VIDEO.mp4}
        poster={VIDEO.poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Two scrims. The static one buys legibility for the corner metadata
          regardless of what the footage is doing behind it; the scrubbed one
          takes the whole frame down as the hero hands off to the first era. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgb(4 3 8 / 0.72) 0%, rgb(4 3 8 / 0.18) 26%, rgb(4 3 8 / 0.22) 68%, rgb(4 3 8 / 0.82) 100%)',
        }}
      />
      <div
        data-hero-scrim
        aria-hidden="true"
        className="absolute inset-0 opacity-0"
        style={{ background: 'var(--bg)' }}
      />

      {/* Wordmark — deliberately wider than the viewport so the A and S are cut
          by the edges. The full name stays available to assistive tech. */}
      <h1
        ref={wordmark}
        className="u-display fx-inkbleed fx-chroma relative z-10 w-full text-center"
        style={
          {
            '--wdth': 116,
            fontSize: 'clamp(5rem, 25.5vw, 32rem)',
            fontVariationSettings: '"wdth" var(--wdth), "wght" 800',
            fontStretch: 'normal',
            willChange: 'transform, font-variation-settings',
          } as React.CSSProperties
        }
      >
        <span className="u-sr-only">ARTMS — Virtual Angel Archive</span>
        <span aria-hidden="true">ARTMS</span>
      </h1>

      {/* Corner metadata, inset to clear the frame rule. */}
      <div
        className="pointer-events-none absolute z-10"
        style={{ inset: 'calc(var(--frame) + 18px)' }}
      >
        <div data-hero-fade className="u-mono absolute left-0 top-0 max-w-[18ch]">
          <span className="u-dim">Est.</span> 2024
          <br />
          <span className="u-dim">Label</span> Modhaus
          <br />
          <span className="u-dim">Members</span> 05
        </div>

        <div data-hero-fade className="u-mono absolute right-0 top-0 text-right">
          <span className="u-dim">Seoul</span>
          <br />
          <span className="tabular-nums" style={{ color: 'var(--accent)' }}>
            {time}
          </span>{' '}
          KST
        </div>

        <div data-hero-fade className="absolute bottom-0 left-0 max-w-[34ch]">
          <p className="u-serif" style={{ fontSize: 'clamp(1.05rem, 1.8vw, 1.75rem)' }}>
            Angel software, booting.
          </p>
          <p className="u-mono u-dim mt-3">Three eras · Dall / Club Icarus / Hyper-Ego</p>
        </div>

        <div
          data-hero-fade
          className="u-mono-sm absolute bottom-0 right-0 flex items-center gap-2"
        >
          <span className="u-dim">Scroll</span>
          <span className="block h-px w-8" style={{ background: 'var(--accent)' }} />
        </div>
      </div>
    </section>
  )
}
