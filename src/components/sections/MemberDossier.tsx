import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import type { Era, Member } from '@/types'
import { ERAS } from '@/data/eras'
import { Picture } from '@/components/Picture'
import { AnimalMark } from '@/components/AnimalMark'
import { formatDate, formatDotted } from '@/lib/format'
import { getLenis } from '@/lib/useLenis'
import { useFocusTrap } from '@/lib/useFocusTrap'

/**
 * The dossier's photo frame, fixed for every member and every era.
 *
 * The scans do not agree with each other: Dall shots are 0.70 portraits, Icarus
 * and Ego are ~1.26–1.43 landscapes. Sized from their own aspects, the frame
 * changed shape on every tab press — and a 0.70 portrait at 56vw came out
 * ~1150px tall, running off the bottom of a laptop screen.
 *
 * One frame, and the image fills it. Letterboxing was tried first and rejected:
 * a contained image leaves grey bars, and filling those bars with a blurred
 * copy of the photo still left a visible seam where sharp met soft. A frame
 * that is actually full is cleaner than any amount of work spent disguising a
 * frame that is not.
 *
 * The cost is a real crop, so the crop is aimed — see FOCUS below. The frame
 * never moves between eras, which is what makes flipping through them feel
 * like turning pages rather than reflowing a page.
 */
const PHOTO_FRAME = 4 / 3

/**
 * Where the crop is aimed, per photograph.
 *
 * The frame is 4:3 and the images fill it, so a 0.70 portrait loses a little
 * over half its height. A centred crop on one of those takes the chin and the
 * shoulders and leaves the eyes above the frame — which is why "just set
 * object-fit: cover" is only half an answer. Each value below was checked
 * against the actual crop rather than assumed.
 *
 * The number is a percentage down the SOURCE image that lands at the same
 * percentage down the frame, so smaller pulls the crop upward.
 */
const FOCUS: Record<string, string> = {
  // Dall — 0.70 portraits, the heaviest crop of the three eras.
  'heejin-dall': 'center 18%',
  // Tightly framed at source, like Choerry's — 20% took her chin off.
  'haseul-dall': 'center 32%',
  'kimlip-dall': 'center 18%',
  'jinsoul-dall': 'center 20%',
  // Framed tighter at source than the other four, so 18% took her chin off.
  'choerry-dall': 'center 30%',
  // Club Icarus — 1.26 landscapes, a light trim at the sides.
  'heejin-icarus': 'center 32%',
  'haseul-icarus': 'center 32%',
  'kimlip-icarus': 'center 32%',
  'jinsoul-icarus': 'center 30%',
  'choerry-icarus': 'center 32%',
  // Hyper-Ego — 1.42 landscapes, barely cropped at all.
  'heejin-ego': 'center 42%',
  'kimlip-ego': 'center 40%',
  'jinsoul-ego': 'center 40%',
  'choerry-ego': 'center 40%',
}

interface MemberDossierProps {
  member: Member | null
  onClose: () => void
}

/**
 * Full-screen record for one member.
 *
 * Framer Motion, not GSAP: this is presence, not scroll. The two libraries have
 * a hard boundary in this project and the overlay is the clearest case for the
 * Framer side of it — AnimatePresence is the only reason an exit animation can
 * run at all once React has decided to unmount.
 */
export function MemberDossier({ member, onClose }: MemberDossierProps) {
  return (
    <AnimatePresence>
      {member && <DossierPanel key={member.id} member={member} onClose={onClose} />}
    </AnimatePresence>
  )
}

function DossierPanel({ member, onClose }: { member: Member; onClose: () => void }) {
  const panel = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()

  // Open on the first era the member actually appears in, so nobody lands on
  // an absence placard before they have seen a photograph.
  const firstPresent = ERAS.find((e) => member.photos[e.id]) ?? ERAS[0]!
  const [eraId, setEraId] = useState<Era['id']>(firstPresent.id)

  const era = ERAS.find((e) => e.id === eraId) ?? firstPresent
  const eraCount = ERAS.filter((e) => member.photos[e.id]).length
  const slug = member.photos[era.id]
  const absence = member.absence?.[era.id]

  useFocusTrap(panel, true)

  useEffect(() => {
    // Lenis owns the scroll, so stopping the document alone would not hold it.
    // The overflow lock is the fallback for the reduced-motion path, where
    // Lenis is never started.
    getLenis()?.stop()
    const previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.documentElement.style.overflow = previousOverflow
      getLenis()?.start()
    }
  }, [onClose])

  /** Arrow keys move between era tabs, per the tablist pattern. */
  const onTabKeyDown = (e: React.KeyboardEvent) => {
    const i = ERAS.findIndex((x) => x.id === eraId)
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault()
      const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + ERAS.length) % ERAS.length
      const target = ERAS[next]
      if (target) setEraId(target.id)
    }
  }

  const transition = reduce
    ? { duration: 0.001 }
    : { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const }

  return (
    <motion.div
      ref={panel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dossier-name"
      className="fixed inset-0 z-[140] overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={transition}
      style={{
        background: 'color-mix(in srgb, var(--bg) 96%, transparent)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
      }}
    >
      {/* Backdrop click target. A sibling button rather than a handler on the
          dialog, so a click that lands on the content never closes it. */}
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />

      <motion.div
        className="relative grid min-h-[100svh] grid-cols-12 gap-x-4 px-[calc(var(--frame)+28px)] py-[12vh]"
        initial={reduce ? false : { y: 26 }}
        animate={{ y: 0 }}
        exit={reduce ? {} : { y: 18 }}
        transition={transition}
      >
        {/* Left rail — who they are. */}
        <div className="col-span-12 lg:col-span-4 lg:sticky lg:top-[12vh] lg:self-start">
          <p className="u-mono-sm" style={{ color: member.color }}>
            Member file — {eraCount} of {ERAS.length} eras
          </p>

          <h2
            id="dossier-name"
            className="u-display fx-inkbleed-soft mt-3"
            style={
              {
                '--wdth': 82,
                fontSize: 'clamp(3rem, 7vw, 8rem)',
                fontVariationSettings: '"wdth" var(--wdth), "wght" 800',
                fontStretch: 'normal',
              } as React.CSSProperties
            }
          >
            {member.name}
          </h2>

          <p
            className="u-kr mt-2"
            style={{ fontSize: 'clamp(1.4rem, 2.4vw, 2.4rem)', color: member.color }}
          >
            {member.hangul}
          </p>

          <p
            className="u-serif mt-6 max-w-[34ch]"
            style={{ fontSize: 'clamp(1.15rem, 1.9vw, 1.8rem)' }}
          >
            {member.line}
          </p>

          <dl className="u-mono mt-10 grid grid-cols-[9ch_1fr] gap-x-4 gap-y-3">
            <dt className="u-dim">Name</dt>
            <dd>
              {member.fullName}{' '}
              <span className="u-kr u-dim normal-case tracking-normal">
                {member.fullNameHangul}
              </span>
            </dd>

            <dt className="u-dim">Born</dt>
            <dd className="tabular-nums">{formatDate(member.born)}</dd>

            <dt className="u-dim">Animal</dt>
            <dd className="flex items-center gap-2">
              <AnimalMark animal={member.mark} size={22} />
              {member.animal}
            </dd>

            <dt className="u-dim">Colour</dt>
            <dd className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="block size-3"
                style={{ background: member.color }}
              />
              <span className="tabular-nums">{member.color}</span>
            </dd>

            <dt className="u-dim">Eras</dt>
            <dd>
              {ERAS.filter((e) => member.photos[e.id])
                .map((e) => e.label)
                .join(' · ')}
            </dd>
          </dl>

          <button
            type="button"
            onClick={onClose}
            data-cursor="Close"
            className="u-mono mt-12 inline-flex items-center gap-2 px-3 py-2"
            style={{ border: '1px solid var(--rule-strong)' }}
          >
            <span aria-hidden="true">✕</span> Close
            <span className="u-mono-sm u-dim ml-2">Esc</span>
          </button>
        </div>

        {/* Right column — what they looked like, era by era. */}
        <div className="col-span-12 mt-[8vh] lg:col-span-7 lg:col-start-6 lg:mt-0">
          <div
            role="tablist"
            aria-label="Era"
            onKeyDown={onTabKeyDown}
            className="flex flex-wrap items-center gap-x-6 gap-y-2"
            style={{ borderBottom: '1px solid var(--rule)', paddingBottom: '0.9rem' }}
          >
            {ERAS.map((e) => {
              const selected = e.id === eraId
              const present = Boolean(member.photos[e.id])
              return (
                <button
                  key={e.id}
                  role="tab"
                  type="button"
                  aria-selected={selected}
                  aria-controls={`dossier-panel-${e.id}`}
                  id={`dossier-tab-${e.id}`}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setEraId(e.id)}
                  className="u-mono py-1 transition-colors"
                  style={{
                    color: selected ? 'var(--accent)' : 'var(--ink-dim)',
                    borderBottom: selected
                      ? '2px solid var(--accent)'
                      : '2px solid transparent',
                    // A member who was not in an era still gets a tab. Hiding
                    // it would erase the fact rather than state it.
                    opacity: present ? 1 : 0.62,
                  }}
                >
                  {e.label}
                  {!present && <span className="u-mono-sm u-dim ml-2">—</span>}
                </button>
              )
            })}
          </div>

          <div
            role="tabpanel"
            id={`dossier-panel-${era.id}`}
            aria-labelledby={`dossier-tab-${era.id}`}
            className="mt-6"
          >
            {/* The frame is declared here, once, so the photo and the absence
                placard are the same box. Switching to an era a member was not
                in should change what is inside the frame, never the frame. */}
            <div
              style={{ aspectRatio: PHOTO_FRAME, maxHeight: '68vh' }}
              className="w-full"
            >
              {slug ? (
                <Picture
                  slug={slug}
                  alt={`${member.name} — ${era.title}`}
                  sizes="(max-width: 1024px) 92vw, 56vw"
                  ratio={PHOTO_FRAME}
                  focus={FOCUS[slug] ?? 'center 30%'}
                  className="h-full w-full"
                  priority
                />
              ) : (
                <AbsencePlacard member={member} era={era} absence={absence} />
              )}
            </div>

            <p className="u-mono mt-4 flex flex-wrap items-center gap-x-5 gap-y-1">
              <span>{era.title}</span>
              <span className="u-dim tabular-nums">{formatDotted(era.released)}</span>
              <span className="u-dim">{era.releaseType}</span>
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

/**
 * What renders where a photograph would be, for an era a member did not appear
 * in. Haseul sat out Hyper-Ego promotions and appears only on its opening
 * track, so there is no `HaseulEgo` scan and there never will be.
 *
 * This is the one state on the site that most obviously *could* have been a
 * hidden tab or a blank box. It is neither. The gap is the most affecting fact
 * in the archive and it gets set in type.
 */
function AbsencePlacard({
  member,
  era,
  absence,
}: {
  member: Member
  era: Era
  absence?: string
}) {
  return (
    <div
      className="flex h-full w-full flex-col justify-center px-[8%] py-[8%]"
      style={{
        // No outline. The placard sits in the same frame a photograph would,
        // and a boxed-in panel would announce itself as a fallback state. It
        // reads as the member's own colour filling the space instead.
        background: `linear-gradient(150deg,
          color-mix(in srgb, ${member.color} 20%, transparent) 0%,
          color-mix(in srgb, ${member.color} 6%, transparent) 55%,
          transparent 100%)`,
      }}
    >
      <p className="u-mono-sm" style={{ color: member.color }}>
        {era.title}
      </p>

      <p
        className="u-display fx-inkbleed-soft mt-4"
        style={
          {
            '--wdth': 82,
            fontSize: 'clamp(2rem, 4.5vw, 4.5rem)',
            fontVariationSettings: '"wdth" var(--wdth), "wght" 800',
            fontStretch: 'normal',
          } as React.CSSProperties
        }
      >
        {member.name}
      </p>

      <p className="mt-3 flex items-baseline gap-4">
        <span className="u-kr" style={{ fontSize: 'clamp(1.5rem, 3vw, 2.6rem)' }}>
          부재
        </span>
        <span className="u-mono u-dim">Absent</span>
      </p>

      {absence && <p className="u-body mt-6 max-w-[46ch]">{absence}</p>}
    </div>
  )
}
