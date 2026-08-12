import { useEffect, useRef, useState } from 'react'
import { gsap, useGSAP } from '@/lib/gsap'
import { Wordmark } from './Wordmark'

const SIGIL = `${import.meta.env.BASE_URL}brand/sigil.webp`
const SIGIL_STILL = `${import.meta.env.BASE_URL}brand/sigil-still.webp`

/** One full rotation of the sigil. The loop itself is 3.0s. */
const HOLD_MS = 2500

const CHANNELS = ['Dall', 'Club Icarus', 'Hyper-Ego'] as const

interface PreloaderProps {
  onDone: () => void
}

/**
 * Two and a half seconds, then gone for the session.
 *
 * Held to one rotation of the sigil rather than to a real load event: a
 * progress bar tied to actual bytes finishes in 200 ms on a warm cache and
 * spends the rest of its life lying. The counter is presented as a boot
 * sequence, not as a percentage of anything.
 *
 * Skipped entirely under `prefers-reduced-motion` — a full-screen flashing
 * overlay is exactly what that setting exists to prevent. The flash itself is
 * three hard cuts inside 200 ms, which is well under the three-per-second
 * threshold that makes strobing a seizure risk.
 */
export function Preloader({ onDone }: PreloaderProps) {
  const root = useRef<HTMLDivElement>(null)
  const [count, setCount] = useState(0)
  const [channel, setChannel] = useState(0)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onDone()
      return
    }

    document.documentElement.style.overflow = 'hidden'

    const started = performance.now()
    let raf = 0
    const tick = () => {
      const t = Math.min((performance.now() - started) / HOLD_MS, 1)
      // Eased so the count decelerates into 100 rather than running out early
      // and then sitting there.
      setCount(Math.round((1 - (1 - t) ** 2.4) * 100))
      setChannel(Math.min(Math.floor(t * CHANNELS.length), CHANNELS.length - 1))
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      document.documentElement.style.overflow = ''
    }
  }, [onDone])

  useGSAP(
    () => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      const hold = HOLD_MS / 1000
      const tl = gsap.timeline()

      tl.from('[data-pre-sigil]', {
        scale: 0.55,
        autoAlpha: 0,
        duration: 1.1,
        ease: 'expo.out',
      })
        .from('[data-pre-mark]', { autoAlpha: 0, y: 22, duration: 0.7, ease: 'expo.out' }, 0.3)
        .from(
          '[data-pre-count]',
          { yPercent: 115, autoAlpha: 0, duration: 0.9, ease: 'expo.out' },
          0.15,
        )
        .from(
          '[data-pre-corner]',
          { autoAlpha: 0, duration: 0.5, stagger: 0.06 },
          0.5,
        )
        .to('[data-pre-bar]', { scaleX: 1, duration: hold - 0.25, ease: 'power1.inOut' }, 0.25)

      // The flash: three hard cuts, odd-spaced, over in under a fifth of a
      // second. Long enough to feel like a signal dropping, short enough that
      // it never reads as strobing.
      tl.to('[data-pre-flash]', { autoAlpha: 1, duration: 0.035 }, hold - 0.34)
        .to('[data-pre-flash]', { autoAlpha: 0, duration: 0.045 })
        .to('[data-pre-flash]', { autoAlpha: 1, duration: 0.03 }, '+=0.05')
        .to('[data-pre-flash]', { autoAlpha: 0, duration: 0.04 })
        .to('[data-pre-glitch]', { autoAlpha: 1, duration: 0.03 }, hold - 0.2)
        .to('[data-pre-glitch]', { autoAlpha: 0, duration: 0.12 })

      // Curtain up.
      tl.to(
        '[data-pre-inner]',
        { autoAlpha: 0, scale: 1.14, duration: 0.4, ease: 'power2.in' },
        hold,
      ).to(
        root.current,
        {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 0.8,
          ease: 'expo.inOut',
          onComplete: onDone,
        },
        '-=0.16',
      )
    },
    { scope: root, dependencies: [onDone] },
  )

  return (
    <div
      ref={root}
      className="fixed inset-0 z-[200] overflow-hidden"
      style={{ background: 'var(--bg)', clipPath: 'inset(0% 0% 0% 0%)' }}
      role="status"
      aria-live="polite"
      aria-label="Loading"
    >
      <div data-pre-inner className="absolute inset-0">
        {/* Sigil, centred and glowing in the era accent. */}
        <div className="absolute inset-0 flex items-center justify-center">
          <picture data-pre-sigil>
            <source srcSet={SIGIL} type="image/webp" />
            <img
              src={SIGIL_STILL}
              alt=""
              width={320}
              height={320}
              className="w-[clamp(230px,29vw,420px)]"
              style={{
                filter:
                  'drop-shadow(0 0 46px color-mix(in srgb, var(--accent) 70%, transparent)) drop-shadow(0 0 12px rgb(255 255 255 / 0.35))',
              }}
            />
          </picture>
        </div>

        {/* The count, set at statement scale and bleeding off the bottom-left —
            the same oversize-numeral language the era panels use. */}
        <div className="absolute bottom-[-1vh] left-[-0.8vw] overflow-hidden">
          <div
            data-pre-count
            className="u-display fx-inkbleed tabular-nums"
            style={{
              fontSize: 'clamp(6.5rem, 24vw, 28rem)',
              fontVariationSettings: '"wdth" 74, "wght" 800',
              fontStretch: 'normal',
              color: 'var(--ink)',
              lineHeight: 0.75,
            }}
          >
            {String(count).padStart(3, '0')}
          </div>
        </div>

        {/* Wordmark, upper right, opposite the numeral. */}
        <div
          data-pre-mark
          className="absolute right-[6vw] top-[16vh]"
          style={{ color: 'var(--ink)' }}
        >
          <Wordmark height={44} title="ARTMS" />
          <p className="u-mono mt-4 text-right" style={{ color: 'var(--accent)' }}>
            Virtual Angel Archive
          </p>
        </div>

        {/* Frame corners — the preloader belongs to the same object as the site
            it hands off to. */}
        <div className="pointer-events-none absolute" style={{ inset: 'var(--frame)' }}>
          <span data-pre-corner className="u-mono-sm u-dim absolute left-0 top-0">
            Modhaus / Est. 2024
          </span>
          <span
            data-pre-corner
            className="u-mono-sm absolute right-0 top-0"
            style={{ color: 'var(--accent)' }}
          >
            Loading {CHANNELS[channel]}
          </span>
          <span data-pre-corner className="u-mono-sm u-dim absolute bottom-0 right-0">
            Fan Archive
          </span>

          {/* Progress rule along the bottom frame. */}
          <span
            data-pre-bar
            className="absolute bottom-0 left-0 block h-px w-full origin-left"
            style={{ background: 'var(--accent)', transform: 'scaleX(0)' }}
          />
        </div>
      </div>

      {/* Flash and glitch plates, driven by the timeline. */}
      <div
        data-pre-flash
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{ background: 'var(--ink)', mixBlendMode: 'difference' }}
      />
      <div
        data-pre-glitch
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0"
        style={{
          background:
            'repeating-linear-gradient(to bottom, color-mix(in srgb, var(--accent) 85%, transparent) 0 2px, transparent 2px 9px)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Scanlines, so the preloader is already the same screen. */}
      <div
        aria-hidden="true"
        className="fx-scanlines pointer-events-none absolute inset-0"
        style={{ position: 'absolute' }}
      />
    </div>
  )
}
