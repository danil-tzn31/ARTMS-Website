import type { Era } from '@/types'

/**
 * ─────────────────────────────────────────────────────────────────────────────
 * EDITING THE COPY
 *
 * `statement` is the large italic line that sits under each era title. It is an
 * array — one entry per rendered line, each with its own indent. Rewrite them
 * freely; nothing else needs to change.
 *
 *   statement: ['Your first line.', 'Your second.'],
 *
 * Two or three lines works. Keep each under about 40 characters, or it will
 * wrap on its own and lose the staggered indent that makes the block read as
 * typeset rather than as a paragraph.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 * Three releases, three palettes. The palettes are not decoration — they drive
 * a luminance arc across the page: violet-black → toxic black → off-white.
 * By the third era the site has inverted itself, which is why the manual invert
 * control reads as a theme the site already believes in rather than a toy.
 */
export const ERAS: Era[] = [
  {
    id: 'dall',
    label: 'Dall',
    title: 'Dall',
    subtitle: 'Devine All Love & Live',
    releaseType: '1st Studio Album',
    released: '2024-05-31',
    titleTrack: 'Virtual Angel',
    statement: ['Five voices arrive as one.', 'Angel software, booting.'],
    tracks: [
      { no: 1, title: 'url' },
      { no: 2, title: 'Virtual Angel', isTitleTrack: true },
      { no: 3, title: 'Sparkle' },
      { no: 4, title: "The Hitchhiker's Guide to the Galaxy" },
      { no: 5, title: 'Flower Rhythm', isPreRelease: true },
      { no: 6, title: 'Candy Crush', isPreRelease: true },
      { no: 7, title: 'Air', isPreRelease: true },
      { no: 8, title: 'Unf/Air' },
      { no: 9, title: 'Distress', hangul: '조난' },
      { no: 10, title: 'Butterfly Effect' },
      { no: 11, title: 'Birth', isPreRelease: true },
    ],
    photos: ['group-dall-01', 'group-dall-02'],
    palette: {
      bg: '#0B0710',
      ink: '#EADCF2',
      inkDim: '#A796B6',
      accent: '#C9A7F0',
      accent2: '#FFC2DE',
    },
  },
  {
    id: 'icarus',
    label: 'Club Icarus',
    title: 'Club Icarus',
    releaseType: '1st Mini Album',
    released: '2025-06-13',
    titleTrack: 'Icarus',
    statement: ['Fly close enough and the wax gives.', 'Dance anyway.'],
    tracks: [
      { no: 1, title: 'Club for the Broken' },
      { no: 2, title: 'Icarus', isTitleTrack: true },
      { no: 3, title: 'Obsessed' },
      { no: 4, title: 'Goddess' },
      { no: 5, title: 'Verified Beauty' },
      { no: 6, title: 'BURN' },
    ],
    photos: [
      'group-icarus-01',
      'group-icarus-02',
      'group-icarus-03',
      'group-icarus-04',
    ],
    palette: {
      bg: '#050705',
      ink: '#D8FFD8',
      inkDim: '#7FBE8B',
      accent: '#00FF5A',
      accent2: '#0B3D1B',
    },
  },
  {
    id: 'ego',
    label: 'Hyper-Ego',
    title: 'Hyper-Ego',
    releaseType: '2nd Mini Album',
    released: '2026-08-07',
    titleTrack: 'Blue Blood',
    statement: ['The fall was the point.', 'What lands is louder.'],
    tracks: [
      { no: 1, title: 'From Wings To Soul' },
      { no: 2, title: 'BORN STUNNER', isPreRelease: true },
      { no: 3, title: 'Blue Blood', isTitleTrack: true },
      { no: 4, title: 'ICARUS GANG' },
      { no: 5, title: 'HYPER CRUSH' },
      { no: 6, title: 'Pixel Memory' },
    ],
    photos: ['group-ego-01', 'group-ego-02'],
    palette: {
      bg: '#EFEDE7',
      ink: '#121110',
      inkDim: '#5C5750',
      accent: '#E5241B',
      accent2: '#8A8580',
    },
  },
]

export const ERA_BY_ID = Object.fromEntries(ERAS.map((e) => [e.id, e])) as Record<
  Era['id'],
  Era
>
