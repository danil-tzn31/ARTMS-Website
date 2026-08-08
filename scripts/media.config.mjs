/**
 * Single source of truth for the media pipeline.
 *
 * Originals are NOT part of the repo — they are multi-megabyte scans that live
 * beside it. Point MEDIA_SRC at that folder (default assumes the sibling
 * `artms media resources` directory) and run `npm run media`.
 */
export const WIDTHS = [640, 1280, 1920]
export const FORMATS = /** @type {const} */ (['avif', 'webp'])

export const QUALITY = {
  avif: 52,
  webp: 74,
}

/** LQIP: a 20px-wide webp inlined as a data URI for the blur-up placeholder. */
export const LQIP_WIDTH = 20

/**
 * Maps a source filename (as it exists in the media folder) to the slug the app
 * refers to it by. Keeping this explicit means renaming a scan never silently
 * breaks a section — the pipeline fails loudly instead.
 */
export const GROUP_SHOTS = {
  'Group/GroupDall1.jpg': 'group-dall-01',
  'Group/GroupDall2.jpg': 'group-dall-02',
  'Group/GroupClub1.jpg': 'group-icarus-01',
  'Group/GroupClub2.jpg': 'group-icarus-02',
  'Group/GroupClub3.jpg': 'group-icarus-03',
  'Group/GroupClub4.jpg': 'group-icarus-04',
  'Group/GroupEgo1.jpeg': 'group-ego-01',
  'Group/GroupEgo2.jpeg': 'group-ego-02',
}

export const MEMBER_SHOTS = {
  'Members/HeejinDall.jpg': 'heejin-dall',
  'Members/HeejinClub.jpg': 'heejin-icarus',
  'Members/HeejinEgo.jpeg': 'heejin-ego',
  'Members/HaseulDall.jpg': 'haseul-dall',
  'Members/HaseulClub.jpg': 'haseul-icarus',
  'Members/KimLipDall.jpg': 'kimlip-dall',
  'Members/KimLipClub.jpg': 'kimlip-icarus',
  'Members/KimLipEgo.jpeg': 'kimlip-ego',
  'Members/JinsoulDall.jpg': 'jinsoul-dall',
  'Members/JinsoulClub.jpg': 'jinsoul-icarus',
  'Members/JinsoulEgo.jpeg': 'jinsoul-ego',
  'Members/ChoerryDall.jpg': 'choerry-dall',
  'Members/ChoerryClub.jpg': 'choerry-icarus',
  'Members/ChoerryEgo.jpeg': 'choerry-ego',
}

export const MISC = {
  'artms logo.png': 'artms-logo',
}

export const ALL_IMAGES = { ...GROUP_SHOTS, ...MEMBER_SHOTS, ...MISC }
