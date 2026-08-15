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
 * The width axis is held FIXED at 78. An earlier version animated it — the mark
 * rested wide and narrowed on scroll — and the resting state simply read as
 * stretched type. Letterforms are not a progress bar: a reader who arrives at a
 * distorted wordmark does not perceive "mid-animation", they perceive bad
 * typography. The mark now sits at its correct proportion from the first frame
 * and never changes width; scroll moves and scales it instead.
 *
 * 78 rather than Archivo's 100 default because the size the mark needs in order
 * to bleed past both edges would be absurd at normal width — the condensed cut
 * is what lets it run edge to edge and still leave the film visible above and
 * below it.
 *
 * The wordmark sits in `mix-blend-mode: difference`, so it inverts whatever
 * frame of the film is behind it rather than sitting on top of it. That is why
 * the video is graded brighter than a normal hero would be — difference against
 * a dark plate produces dark type, and the letterforms disappear.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null)
  const wordmark = useRef<HTMLHeadingElement>(null)
  const time = useClock()

  useGSAP(
    () => {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

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
        // Reveal only. No width, no scale — the mark is already correct.
        .fromTo(
          wordmark.current,
          { autoAlpha: 0, yPercent: 6 },
          { autoAlpha: 1, yPercent: 0, duration: 1.3, ease: 'expo.out' },
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
        .to(wordmark.current, { yPercent: -32, scale: 0.46, ease: 'none' }, 0)
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
      className="relative flex h-[100svh] w-full items-center justify-center overflow-hidden"
      aria-label="Introduction"
    >
      <video
        data-hero-video
        className="absolute inset-0 size-full object-cover"
        style={{ filter: 'brightness(0.92) saturate(0.82) contrast(1.06)' }}
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
            'linear-gradient(to bottom, rgb(4 3 8 / 0.62) 0%, rgb(4 3 8 / 0.04) 30%, rgb(4 3 8 / 0.08) 64%, rgb(4 3 8 / 0.74) 100%)',
        }}
      />
      <div
        data-hero-scrim
        aria-hidden="true"
        className="absolute inset-0 opacity-0"
        style={{ background: 'var(--bg)' }}
      />

      {/* Wordmark — deliberately wider than the viewport so the A and S are cut
          by the edges. The full name stays available to assistive tech.

          w-max inside a centring flex parent, not `w-full text-center`: a
          centred text line wider than its box overflows to the right only, so
          the mark ran off one edge and sat flush against the other. A flex item
          wider than its container overflows symmetrically. */}
      <h1
        ref={wordmark}
        className="u-display fx-inkbleed relative z-10 w-max shrink-0 whitespace-nowrap"
        style={
          {
            '--wdth': 78,
            fontSize: 'clamp(6.5rem, 39vw, 50rem)',
            fontVariationSettings: '"wdth" var(--wdth), "wght" 800',
            fontStretch: 'normal',
            color: '#fff',
            mixBlendMode: 'difference',
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
        <div data-hero-fade className="u-mono u-over-media absolute left-0 top-0 max-w-[18ch]">
          <span className="u-dim">Est.</span> 2024
          <br />
          <span className="u-dim">Label</span> Modhaus
          <br />
          <span className="u-dim">Members</span> 05
        </div>

        <div data-hero-fade className="u-mono u-over-media absolute right-0 top-0 text-right">
          <span className="u-dim">Seoul</span>
          <br />
          <span className="tabular-nums" style={{ color: 'var(--accent)' }}>
            {time}
          </span>{' '}
          KST
        </div>

        <div data-hero-fade className="u-over-media absolute bottom-0 left-0 max-w-[38ch]">
          <p className="u-serif" style={{ fontSize: 'clamp(1.5rem, 2.6vw, 2.6rem)' }}>
            Angel software, booting.
          </p>
          <p className="u-mono mt-3" style={{ color: 'var(--ink)' }}>
            Three eras · Dall / Club Icarus / Hyper-Ego
          </p>
        </div>

        <div
          data-hero-fade
          className="u-mono-sm u-over-media absolute bottom-0 right-0 flex items-center gap-2"
        >
          <span className="u-dim">Scroll</span>
          <span className="block h-px w-8" style={{ background: 'var(--accent)' }} />
        </div>
      </div>
    </section>
  )
}
