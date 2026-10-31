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

/* The Dall photos are the *NonCut files: the plain Dall names now belong to
   the background-removed PNGs below, and the originals were renamed to make
   room. The casing is the folder's own (JinSoul, Kimlip) — keep it exact. */
export const MEMBER_SHOTS = {
  'Members/HeejinDallNonCut.jpg': 'heejin-dall',
  'Members/HeejinClub.jpg': 'heejin-icarus',
  'Members/HeejinEgo.jpeg': 'heejin-ego',
  'Members/HaseulDallNonCut.jpg': 'haseul-dall',
  'Members/HaseulClub.jpg': 'haseul-icarus',
  'Members/KimlipDallNonCut.jpg': 'kimlip-dall',
  'Members/KimLipClub.jpg': 'kimlip-icarus',
  'Members/KimLipEgo.jpeg': 'kimlip-ego',
  'Members/JinSoulDallNonCut.jpeg': 'jinsoul-dall',
  'Members/JinsoulClub.jpg': 'jinsoul-icarus',
  'Members/JinsoulEgo.jpeg': 'jinsoul-ego',
  'Members/ChoerryDallNonCut.jpeg': 'choerry-dall',
  'Members/ChoerryClub.jpg': 'choerry-icarus',
  'Members/ChoerryEgo.jpeg': 'choerry-ego',
}

/**
 * One background-removed figure per member, all cut from the Dall shoot, for
 * the members chapters. Same filenames as the Dall photos but .png — the
 * extension is the only thing telling the two apart, so it is spelled out
 * here rather than globbed.
 */
export const CUTOUTS = {
  'Members/HeejinDall.png': 'heejin-cut',
  'Members/HaseulDall.png': 'haseul-cut',
  'Members/KimLipDall.png': 'kimlip-cut',
  'Members/JinsoulDall.png': 'jinsoul-cut',
  'Members/ChoerryDall.png': 'choerry-cut',
}

/**
 * Brand assets (the wordmark sheet and the preloader GIF) are NOT handled here.
 * They are not photographs and do not want responsive srcsets — see
 * scripts/process-brand.mjs.
 */
export const ALL_IMAGES = { ...GROUP_SHOTS, ...MEMBER_SHOTS }
