import { gsap, ScrollTrigger, useGSAP } from './gsap'
import { ERA_BY_ID } from '@/data/eras'
import { CHAPTERS, FIRST_DARK } from '@/data/member-story'
import { MEMBER_BY_ID } from '@/data/members'

/** Where the eras leave the page: Hyper-Ego's off-white. */
const ego = ERA_BY_ID.ego.palette
const LIGHT = { '--bg': ego.bg, '--ink': ego.ink, '--ink-dim': ego.inkDim }

/**
 * The deep end. Near-black rather than black so the scanlines still have
 * something to sit on, and the ink a warm off-white so it reads as the light
 * set turned over rather than as a different site.
 */
export const DEPTH_DARK = {
  '--bg': '#0C0C0E',
  '--ink': '#ECEAE5',
  '--ink-dim': '#9A968F',
}

/**
 * useEraTheme's twin for the members section. As each chapter enters, the
 * accent becomes that member's colour; from the Shadow down the whole palette
 * turns dark, and the roll call brings it back to the light.
 *
 * --rule and --rule-strong are left alone on purpose. They are mixed from --ink
 * in tokens.css, so they follow the flip by themselves — writing them here
 * would pin them as inline values on the root and break that for good.
 *
 * Nothing here is tweened — every change is a cut, on purpose. A tweened
 * root variable restyles and repaints the whole page on every frame of the
 * fade, and with the sticky figures and their filters on screen that was the
 * lag going from Heejin into Jinsoul. Measured crossing that boundary at 4×
 * CPU throttle (median of six runs): the fade cost 1.3s of dropped-frame time
 * with a 450ms worst frame. Cutting only the light/dark flip still left about
 * 1s, because the accent fade alone does the same damage. Cutting both brings
 * it to about 0.75s — the same as not changing the palette at all. Stepping
 * the fade down to four frames did not help either; it is the fade, not its
 * smoothness.
 *
 * The eras keep their fade: three of them, far apart, with nothing sticky on
 * screen while they change.
 */
export function useDepthTheme(scope: React.RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = document.documentElement

      const apply = (vars: Record<string, string>) => {
        // Compared against what is actually on the root, not a remembered copy
        // — the era fades write the same variables, so a cached value can be
        // stale. Crossing between two chapters that share a palette then
        // writes nothing and restyles nothing.
        const changed = Object.entries(vars).some(
          ([k, v]) =>
            root.style.getPropertyValue(k).trim().toLowerCase() !== v.toLowerCase(),
        )
        if (!changed) return
        // Kill any era fade still running on the same variables, or it would
        // keep writing over the cut for the rest of its duration.
        gsap.killTweensOf(root, Object.keys(vars).join(','))
        gsap.set(root, vars)
      }

      const triggers: ScrollTrigger[] = []
      const darkFrom = CHAPTERS.findIndex((c) => c.part === FIRST_DARK)

      CHAPTERS.forEach((chapter, i) => {
        const el = document.getElementById(`chapter-${chapter.member}`)
        if (!el) return
        const vars = {
          ...(i >= darkFrom ? DEPTH_DARK : LIGHT),
          '--accent': MEMBER_BY_ID[chapter.member].color,
        }
        triggers.push(
          ScrollTrigger.create({
            trigger: el,
            start: 'top center',
            end: 'bottom center',
            onEnter: () => apply(vars),
            onEnterBack: () => apply(vars),
          }),
        )
      })

      // Going back up past the first chapter returns the page to how the eras
      // left it, red accent included — the map belongs to Hyper-Ego's light.
      const first =
        CHAPTERS[0] && document.getElementById(`chapter-${CHAPTERS[0].member}`)
      if (first) {
        triggers.push(
          ScrollTrigger.create({
            trigger: first,
            start: 'top center',
            onLeaveBack: () => apply({ ...LIGHT, '--accent': ego.accent }),
          }),
        )
      }

      const roll = document.getElementById('roll-call')
      if (roll) {
        triggers.push(
          ScrollTrigger.create({
            trigger: roll,
            start: 'top center',
            onEnter: () => apply({ ...LIGHT, '--accent': ego.accent }),
          }),
        )
      }

      return () => triggers.forEach((t) => t.kill())
    },
    { scope },
  )
}
