import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// limitCallbacks trims a meaningful amount of work on a page this
// ScrollTrigger-heavy; ignoreMobileResize stops iOS URL-bar show/hide from
// firing a full refresh mid-scroll (which is what makes pinned sections jump).
ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true })

export { gsap, ScrollTrigger, useGSAP }

/**
 * Phones and tablets, where a few effects are traded for ones that are cheaper
 * to draw. Read once: nobody swaps a touch screen for a mouse mid-visit.
 */
export const TOUCH =
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches

/**
 * The from and to of a reveal that wipes type up out of its own baseline. On
 * touch screens it rises and fades in instead: a clip-path makes the browser
 * repaint the whole line of type on every frame, which at display sizes is
 * more than a phone can draw smoothly, while movement and opacity go to the
 * GPU and the text is drawn once.
 */
export function wipe(
  from: gsap.TweenVars,
  to: gsap.TweenVars,
): [gsap.TweenVars, gsap.TweenVars] {
  return TOUCH
    ? [
        { autoAlpha: 0, y: 28 },
        { autoAlpha: 1, y: 0 },
      ]
    : [from, to]
}

// Measure again once the web fonts are in. Every trigger position is taken
// from the layout, and on a slow phone connection the first measurement can
// happen with fallback fonts — different line breaks, different heights, and
// every reveal further down the page firing in the wrong place or not at all.
if (typeof document !== 'undefined') {
  void document.fonts?.ready.then(() => ScrollTrigger.refresh())
}
