import { gsap, ScrollTrigger, useGSAP } from './gsap'
import { ERAS } from '@/data/eras'

const HERO_PALETTE = {
  '--bg': '#08060C',
  '--ink': '#E8E6F0',
  '--ink-dim': '#6F6B85',
  '--accent': '#C9A7F0',
  '--accent-2': '#FFC2DE',
}

const DURATION = 0.55

/**
 * Re-skins the whole page as each era scrolls into view by tweening the root
 * custom properties. Every surface on the site reads from these, so one tween
 * repaints the navbar, rules, accents and type together.
 *
 * A crossfade on enter beats scrubbing the colour across the boundary: scrubbed
 * palettes spend most of their travel in a muddy intermediate that belongs to
 * neither era, and it costs a style recalculation on every scroll frame.
 */
export function useEraTheme(scope: React.RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = document.documentElement

      const apply = (vars: Record<string, string>) =>
        gsap.to(root, { ...vars, duration: DURATION, ease: 'power2.out', overwrite: 'auto' })

      const triggers: ScrollTrigger[] = []

      // ScrollTrigger falls back to the document when handed a selector that
      // matches nothing, which means a missing section would silently claim the
      // whole page and repaint the site in its palette on load. Every trigger
      // here is resolved to a real element first.
      const el = (id: string) => document.getElementById(id)

      const hero = el('hero')
      if (hero) {
        triggers.push(
          ScrollTrigger.create({
            trigger: hero,
            start: 'top top',
            end: 'bottom center',
            onEnterBack: () => apply(HERO_PALETTE),
          }),
        )
      }

      for (const era of ERAS) {
        const section = el(`era-${era.id}`)
        if (!section) continue

        const vars = {
          '--bg': era.palette.bg,
          '--ink': era.palette.ink,
          '--ink-dim': era.palette.inkDim,
          '--accent': era.palette.accent,
          '--accent-2': era.palette.accent2,
        }

        triggers.push(
          ScrollTrigger.create({
            trigger: section,
            start: 'top center',
            end: 'bottom center',
            onEnter: () => apply(vars),
            onEnterBack: () => apply(vars),
          }),
        )
      }

      // The members and credits sections inherit whatever the last era left —
      // by then the page has already inverted to Hyper-Ego's off-white, which
      // is the intended resting state for the back half of the site.

      return () => triggers.forEach((t) => t.kill())
    },
    { scope },
  )
}
