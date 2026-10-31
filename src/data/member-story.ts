import type { EraId, MemberId } from '@/types'

/**
 * The members section follows xio_orbit's reading of the group, "ARTMS' Map of
 * the Soul": five members as five parts of one psyche, stacked from the face
 * shown to the world down to the part kept furthest from it.
 *
 * Everything written here is Dani's to write. Empty strings are deliberate and
 * every one of them has a fallback — an empty part line shows the part's name,
 * an empty story line shows the era's title track — so nothing placeholder-ish
 * ever reaches the page.
 */

export type Part = 'Persona' | 'Ego' | 'Self' | 'Shadow' | 'Anima'

export interface Chapter {
  member: MemberId
  part: Part
  /** Where in the descent she sits, in the chapter label: 'the surface'. */
  depth: string
  /** One plain line on what the part is. Empty falls back to the part name. */
  line: string
  /**
   * Which side of the circle her head breaks through. Every current photo has
   * the crown intact, so all five are 'top'; 'bottom' exists for a future photo
   * cropped at the forehead, where the honest move is to break out below.
   */
  breakout: 'top' | 'bottom'
}

/** Depth order, surface to deep. This is the chapter order, not MEMBERS'. */
export const CHAPTERS: Chapter[] = [
  {
    member: 'choerry',
    part: 'Persona',
    depth: 'the surface',
    line: '',
    breakout: 'top',
  },
  {
    member: 'kimlip',
    part: 'Ego',
    depth: 'under the surface',
    line: '',
    breakout: 'top',
  },
  { member: 'heejin', part: 'Self', depth: 'the centre', line: '', breakout: 'top' },
  { member: 'jinsoul', part: 'Shadow', depth: 'below', line: '', breakout: 'top' },
  { member: 'haseul', part: 'Anima', depth: 'the deepest', line: '', breakout: 'top' },
]

/**
 * Where the page turns dark. The descent is light down to the Self and dark
 * from the Shadow on — the map previews it and the chapters live it.
 */
export const FIRST_DARK: Part = 'Shadow'

/** One short line per member per era. Missing lines fall back to the title track. */
export const MEMBER_STORY: Record<MemberId, Partial<Record<EraId, string>>> = {
  heejin: {},
  haseul: {},
  kimlip: {},
  jinsoul: {},
  choerry: {},
}

/**
 * The track a member is on in an era she did not promote. Haseul sat out
 * Hyper-Ego but opens it — the circle she leaves empty names where she is.
 */
export const PRESENT_ON: Partial<Record<MemberId, string>> = {
  haseul: 'From Wings To Soul',
}

/**
 * The viewport line the drawn line's tip rides on, shared by the map and every
 * chapter. Both start drawing when their top crosses it and finish when their
 * bottom does, and the map ends exactly where the first chapter begins — so
 * with the same line, one finishes on the frame the next one starts and the
 * spark passes from the map's axis into the chapters without a seam.
 */
export const LINE_TIP = '60%'

/** An optional paragraph under the map's statement. Empty renders nothing. */
export const PROLOGUE = ''
