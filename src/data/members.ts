import type { Member } from '@/types'

/**
 * Haseul has no Hyper-Ego entry. She is not missing data — she sat out
 * promotions for that release and appears only on its opening track. The site
 * renders that as an authored state (see `absence`), never as a broken image.
 */
export const MEMBERS: Member[] = [
  {
    id: 'heejin',
    name: 'Heejin',
    hangul: '희진',
    fullName: 'Jeon Heejin',
    fullNameHangul: '전희진',
    born: '2000-10-19',
    animal: 'Rabbit',
    glyph: '𓃹',
    color: '#FF2E88',
    onColor: '#12000A',
    line: 'The first face. Still the sharpest edge in the frame.',
    photos: { dall: 'heejin-dall', icarus: 'heejin-icarus', ego: 'heejin-ego' },
  },
  {
    id: 'haseul',
    name: 'Haseul',
    hangul: '하슬',
    fullName: 'Jo Haseul',
    fullNameHangul: '조하슬',
    born: '1997-08-18',
    animal: 'White Bird',
    glyph: '𓅐',
    color: '#2FBF71',
    onColor: '#02140A',
    line: 'Leader. The steady green line under everything else.',
    photos: { dall: 'haseul-dall', icarus: 'haseul-icarus' },
    absence: {
      ego: 'Absent from Hyper-Ego promotions — present on “From Wings To Soul”.',
    },
  },
  {
    id: 'kimlip',
    name: 'Kim Lip',
    hangul: '김립',
    fullName: 'Kim Jungeun',
    fullNameHangul: '김정은',
    born: '1999-02-10',
    animal: 'Owl',
    glyph: '𓅓',
    color: '#E01B24',
    onColor: '#140100',
    line: 'Eyes adjusted to the dark long before the lights came up.',
    photos: { dall: 'kimlip-dall', icarus: 'kimlip-icarus', ego: 'kimlip-ego' },
  },
  {
    id: 'jinsoul',
    name: 'Jinsoul',
    hangul: '진솔',
    fullName: 'Jung Jinsoul',
    fullNameHangul: '정진솔',
    born: '1997-06-13',
    animal: 'Blue Betta',
    glyph: '𓆝',
    color: '#1B4FE0',
    onColor: '#F2F5FF',
    line: 'Deep water. Nothing about the calm is accidental.',
    photos: { dall: 'jinsoul-dall', icarus: 'jinsoul-icarus', ego: 'jinsoul-ego' },
  },
  {
    id: 'choerry',
    name: 'Choerry',
    hangul: '최리',
    fullName: 'Choi Yerim',
    fullNameHangul: '최예림',
    born: '2001-06-04',
    animal: 'Bat',
    glyph: '𓃵',
    color: '#8B2FE0',
    onColor: '#F7F0FF',
    line: 'Moves between the others like she was built to bridge them.',
    photos: { dall: 'choerry-dall', icarus: 'choerry-icarus', ego: 'choerry-ego' },
  },
]

export const MEMBER_BY_ID = Object.fromEntries(MEMBERS.map((m) => [m.id, m])) as Record<
  Member['id'],
  Member
>
