import { useEffect } from 'react'
import Lenis from 'lenis'
import { gsap, ScrollTrigger } from './gsap'

let instance: Lenis | null = null

/** Read-only handle for components that need to stop/start or scroll to. */
export function getLenis() {
  return instance
}

/**
 * Mounts Lenis once and hands scroll duty to the GSAP ticker.
 *
 * The single most common way to get this wrong is running Lenis's own
 * requestAnimationFrame loop *alongside* gsap.ticker — two loops, two frames of
 * lag, and ScrollTrigger reading a stale position. There is exactly one loop
 * here, and ScrollTrigger.update is driven from Lenis's scroll event.
 */
export function useLenis() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.6,
      // Smoothing touch scroll fights the platform on iOS; native is better.
      syncTouch: false,
    })
    instance = lenis

    const onScroll = () => ScrollTrigger.update()
    lenis.on('scroll', onScroll)

    const raf = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(raf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      lenis.off('scroll', onScroll)
      gsap.ticker.remove(raf)
      gsap.ticker.lagSmoothing(500, 33)
      lenis.destroy()
      instance = null
    }
  }, [])
}

/**
 * Publishes normalised scroll velocity (0 at rest, ~1 at speed) as `--velocity`
 * for the chromatic aberration on display type.
 *
 * The first version of this cost 34fps and I removed it. Two things were wrong
 * with it, and both are fixed here rather than softened:
 *
 * 1. It ran a requestAnimationFrame loop that never idled — it kept ticking at
 *    rest, forever. This one is woken by the scroll event and returns without
 *    rescheduling once the value has settled, so a still page runs no loop.
 * 2. It wrote to the root element. `--velocity` is inherited, so every write
 *    invalidated computed style for the entire document — around 205 elements
 *    per pass. This writes to the handful of elements that actually read it.
 *
 * It also sets `data-scrolling` on the root while the page is moving, which
 * effects.css uses to trade the ink-bleed filter for the chromatic split. That
 * is one attribute write per gesture rather than per frame.
 */
export function useScrollVelocity() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const root = document.documentElement
    let raf = 0
    let current = 0
    let moving = false
    let targets: HTMLElement[] = []

    const write = (value: string) => {
      for (const el of targets) el.style.setProperty('--velocity', value)
    }

    // One attribute write per gesture, not per frame — the cost of a root
    // mutation is in how often you do it, not in doing it at all.
    const setMoving = (next: boolean) => {
      if (next === moving) return
      moving = next
      root.toggleAttribute('data-scrolling', next)
    }

    const tick = () => {
      const goal = Math.min(Math.abs(instance?.velocity ?? 0) / 45, 1)
      current += (goal - current) * 0.14

      // Settled. Park at exactly zero and stop rescheduling — this return is
      // the difference between the old version and this one.
      if (current < 0.004 && goal < 0.004) {
        current = 0
        write('0')
        setMoving(false)
        raf = 0
        return
      }

      setMoving(true)
      write(current.toFixed(3))
      raf = requestAnimationFrame(tick)
    }

    const wake = () => {
      // Collected lazily: the era panels are not in the DOM when this effect
      // first runs on a cold load behind the preloader.
      if (!targets.length) {
        targets = Array.from(document.querySelectorAll<HTMLElement>('[data-chroma]'))
      }
      if (!raf) raf = requestAnimationFrame(tick)
    }

    window.addEventListener('scroll', wake, { passive: true })

    return () => {
      window.removeEventListener('scroll', wake)
      if (raf) cancelAnimationFrame(raf)
      root.removeAttribute('data-scrolling')
      for (const el of targets) el.style.removeProperty('--velocity')
    }
  }, [])
}
