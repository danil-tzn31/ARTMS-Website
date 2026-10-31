import { Suspense, lazy, useCallback, useRef, useState } from 'react'
import type { Member } from '@/types'
import { CHAPTERS } from '@/data/member-story'
import { MEMBER_BY_ID } from '@/data/members'
import { getLenis } from '@/lib/useLenis'
import { useDepthTheme } from '@/lib/useDepthTheme'
import { SoulMap } from './SoulMap'
import { DepthRail } from './DepthRail'
import { MemberChapter } from './MemberChapter'
import { RollCall } from './RollCall'

/**
 * The dossier is the only thing on the site that imports Framer Motion, and it
 * is 43 kB gzipped that nobody needs until they open a file. Splitting it out
 * keeps the first load under budget; by the time anyone clicks, the chunk has
 * usually been fetched on hover or focus.
 */
const MemberDossier = lazy(() =>
  import('./MemberDossier').then((m) => ({ default: m.MemberDossier })),
)

let dossierPrefetched = false
function prefetchDossier() {
  if (dossierPrefetched) return
  dossierPrefetched = true
  void import('./MemberDossier')
}

/**
 * The members, told as a descent through one soul.
 *
 * The old section was an index — five names in a list, a photo following the
 * cursor — and it read as a directory. This follows xio_orbit's reading of the
 * group instead: five members as the five parts of one psyche, from the face
 * shown to the world down to the part kept deepest. A map opens it, a chapter
 * per member walks it, and the roll call closes it.
 */
export function Members() {
  const root = useRef<HTMLElement>(null)
  const [selected, setSelected] = useState<Member | null>(null)
  const [opener, setOpener] = useState<HTMLElement | null>(null)

  /**
   * Whether the dossier has ever been opened. React.lazy fetches on first
   * render, not on first interesting prop, so mounting it closed would pull
   * the chunk on page load. It never flips back: once opened the dossier stays
   * mounted so AnimatePresence has somewhere to run the exit.
   */
  const [hasOpened, setHasOpened] = useState(false)

  useDepthTheme(root)

  const open = useCallback((member: Member, from: HTMLElement) => {
    setOpener(from)
    setHasOpened(true)
    setSelected(member)
  }, [])
  const close = useCallback(() => setSelected(null), [])

  const jump = useCallback((member: Member) => {
    const el = document.getElementById(`chapter-${member.id}`)
    if (!el) return
    const lenis = getLenis()
    if (lenis) lenis.scrollTo(el, { duration: 1.6 })
    else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  return (
    <section
      ref={root}
      id="members"
      className="relative overflow-x-clip"
      aria-labelledby="members-heading"
    >
      <SoulMap onJump={jump} />

      <div className="relative">
        <DepthRail onJump={jump} />
        {CHAPTERS.map((chapter, i) => (
          <MemberChapter
            key={chapter.member}
            chapter={chapter}
            member={MEMBER_BY_ID[chapter.member]}
            index={i}
            total={CHAPTERS.length}
            onOpen={open}
            onIntent={prefetchDossier}
          />
        ))}
      </div>

      <RollCall />

      {hasOpened && (
        <Suspense fallback={null}>
          <MemberDossier member={selected} onClose={close} returnFocusTo={opener} />
        </Suspense>
      )}
    </section>
  )
}
