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
