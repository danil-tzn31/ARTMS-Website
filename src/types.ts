export type EraId = 'dall' | 'icarus' | 'ego'
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
  /** One line of editorial framing. Shown at large size, so it earns its length. */
  statement: string
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
  /** Single glyph used as the member's mark. */
  glyph: string
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
