export type EraId = 'dall' | 'icarus' | 'ego'

/** Selects one of the drawn marks in components/AnimalMark.tsx. */
export type AnimalMarkId = 'rabbit' | 'bird' | 'owl' | 'betta' | 'bat'
export type MemberId = 'heejin' | 'haseul' | 'kimlip' | 'jinsoul' | 'choerry'

export interface Track {
  /** 1-indexed position on the physical release. */
  no: number
  title: string
  /** Korean title, where the track has one. */
  hangul?: string
  isTitleTrack?: boolean
  isPreRelease?: boolean
}

export interface Era {
  id: EraId
  /** Short form used in nav, tabs and metadata rows. */
  label: string
  /** Full release title as printed. */
  title: string
  subtitle?: string
  releaseType: string
  /** ISO date — formatted at render time, never hardcoded as a display string. */
  released: string
  titleTrack: string
  tracks: Track[]
  /** Slugs into the media manifest. */
  photos: string[]
  /**
   * Editorial framing, one array entry per rendered line.
   *
   * Lines are authored, not wrapped: each one is set at statement size and gets
   * its own indent, so where the break falls is a typographic decision rather
   * than whatever the box width happens to produce. Two or three lines works;
   * keep each under ~40 characters or it will wrap on its own and lose the
   * stagger.
   */
  statement: string[]
  /**
   * Which track the statement is quoted from, e.g. 'Virtual Angel'.
   *
   * Rendered as a small credit beneath the line. Quoted words set at statement
   * size and left unattributed read as the site's own writing, which is both a
   * missing credit and a slightly dishonest one — the whole footer is built
   * around naming whose work this is. Left undefined, no credit renders.
   */
  statementSource?: string
  palette: {
    bg: string
    ink: string
    inkDim: string
    accent: string
    accent2: string
  }
}

export interface Member {
  id: MemberId
  name: string
  hangul: string
  /** Legal name in hangul, shown in the dossier. */
  fullNameHangul: string
  fullName: string
  born: string
  animal: string
  /** Which drawn mark represents them. */
  mark: AnimalMarkId
  color: string
  /** Readable-on-color ink, precomputed rather than guessed at runtime. */
  onColor: string
  line: string
  /** Era participation, in release order. `null` = did not appear. */
  photos: Partial<Record<EraId, string>>
  /** Shown in place of a photo where a member is absent from an era. */
  absence?: Partial<Record<EraId, string>>
}

export interface MediaRecord {
  slug: string
  aspect: number
  width: number
  height: number
  widths: number[]
  lqip: string
}
