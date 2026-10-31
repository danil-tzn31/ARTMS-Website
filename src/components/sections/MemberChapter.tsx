import { useRef } from 'react'
import type { Member } from '@/types'
import { type Chapter, LINE_TIP, MEMBER_STORY } from '@/data/member-story'
import { ERAS } from '@/data/eras'
import { formatDotted, pad } from '@/lib/format'
import { gsap, ScrollTrigger, useGSAP } from '@/lib/gsap'
import { ChapterFigure } from './ChapterFigure'
import { Spark } from '@/components/Spark'

/**
 * Each beat's height, which is also how long each look holds while scrolling.
 * 70vh left a screen's worth of nothing between two short lines; this keeps
 * every look on screen for a deliberate beat without the column going empty.
 */
const BEAT_HEIGHT = '46vh'

/** Circle diameter. Capped by height too, so a short laptop screen still fits it. */
const CIRCLE = { desktop: 'min(34vw, 62vh)', mobile: 'min(72vw, 420px)' }

/** Where the figure parks while the beats scroll past it. */
const STICKY_TOP = '10vh'

/** The line on screen that decides which beat is current: a beat owns the
    figure while it is crossing 55% of the viewport. */
const BEAT_START = 'top 55%'
const BEAT_END = 'bottom 55%'

interface MemberChapterProps {
  chapter: Chapter
  member: Member
  index: number
  total: number
  onOpen: (member: Member, from: HTMLElement) => void
  onIntent: () => void
}

/**
 * One member, one circle on the map, three eras.
 *
 * Figure left, text right, every time. The chapters used to be meant to mirror,
 * but the alternation now comes from elsewhere — the palette darkens partway
 * down, and each figure breaks its circle differently — and a figure that
 * jumps sides every chapter fights the depth rail for the left edge.
 */
export function MemberChapter({
  chapter,
  member,
  index,
  total,
  onOpen,
  onIntent,
}: MemberChapterProps) {
  const root = useRef<HTMLElement>(null)
  const figure = useRef<HTMLElement>(null)
  const headingId = `chapter-${member.id}-name`

  useGSAP(
    () => {
      const article = root.current
      const fig = figure.current
      if (!article || !fig) return

      const mm = gsap.matchMedia()

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const head = article.querySelector<HTMLElement>('[data-chapter-name]')
        const meta = article.querySelectorAll<HTMLElement>('[data-chapter-meta]')
        if (!head) return

        // Name wipes up from its own baseline, the lines under it rise in.
        gsap
          .timeline({
            scrollTrigger: {
              trigger: head,
              start: 'top 80%',
              toggleActions: 'play none none reverse',
            },
          })
          .fromTo(
            head,
            { clipPath: 'inset(0 0 100% 0)' },
            { clipPath: 'inset(0 0 -10% 0)', duration: 0.9, ease: 'expo.out' },
          )
          .fromTo(
            meta,
            { y: 40, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.06, ease: 'expo.out' },
            0.12,
          )
      })

      // The beats, the thread and the looks only exist where the figure is
      // sticky. Below lg the figure scrolls away with its own text, so there
      // is nothing for a look change to be seen against.
      mm.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', () => {
        // The thread draws with the chapter and a spark rides its tip. Start
        // and end share one viewport line, so the tip holds still at reading
        // height while the text moves up past it.
        const thread = article.querySelector<HTMLElement>('[data-thread]')
        const spark = article.querySelector<HTMLElement>('[data-thread-spark]')
        if (thread && spark) {
          gsap
            .timeline({
              defaults: { ease: 'none' },
              scrollTrigger: {
                trigger: article,
                start: `top ${LINE_TIP}`,
                end: `bottom ${LINE_TIP}`,
                scrub: true,
              },
            })
            .fromTo(thread, { scaleY: 0 }, { scaleY: 1, duration: 1 }, 0)
            // Shown only while this chapter's thread is the one drawing. Left
            // visible either side of that, each finished thread kept a spark
            // parked at its foot and the next one waited at its head, so every
            // chapter boundary read as a joint in the line rather than one
            // line passing from member to member.
            .fromTo(spark, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.02 }, 0)
            .fromTo(spark, { top: '0%' }, { top: '100%', duration: 1 }, 0)
            .to(spark, { autoAlpha: 0, duration: 0.02 }, 0.98)
        }

        // One trigger per beat, writing the attribute directly. onToggle fires
        // on the way in from either direction, so scrolling back up restores
        // the previous look with no extra bookkeeping.
        const beats = gsap.utils.toArray<HTMLElement>('[data-beat]', article)
        const triggers = beats.map((beat) =>
          ScrollTrigger.create({
            trigger: beat,
            start: BEAT_START,
            end: BEAT_END,
            onToggle: (self) => {
              const era = beat.dataset.beat
              if (!self.isActive || !era) return
              fig.dataset.active = era
            },
          }),
        )

        return () => {
          triggers.forEach((t) => t.kill())
          fig.dataset.active = 'dall'
        }
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  const story = MEMBER_STORY[member.id]

  return (
    <article
      ref={root}
      id={`chapter-${member.id}`}
      aria-labelledby={headingId}
      className="cf-chapter relative px-[calc(var(--frame)+28px)] py-[12vh] lg:grid lg:grid-cols-12 lg:gap-x-6 lg:py-0"
      style={
        {
          '--circle-sm': CIRCLE.mobile,
          '--circle-lg': CIRCLE.desktop,
          '--beat-lg': BEAT_HEIGHT,
          '--member': member.color,
        } as React.CSSProperties
      }
    >
      {/* Figure column. Sticky on desktop; below lg it is just the first thing
          in the chapter. */}
      <div className="relative lg:col-span-6">
        <div
          className="relative flex flex-col items-center justify-center lg:sticky lg:h-[80vh]"
          style={{ top: STICKY_TOP }}
        >
          {/* Her name, outlined, behind the circle and off the left edge. It is
              a texture, not the heading — the h3 in the text column is. */}
          <span
            aria-hidden="true"
            className="u-display pointer-events-none absolute top-1/2 left-0 hidden -translate-y-1/2 whitespace-nowrap select-none lg:block"
            style={{
              fontSize: 'clamp(8rem, 21vw, 24rem)',
              marginLeft: 'calc(-1 * (var(--frame) + 28px) - 6vw)',
              color: 'transparent',
              WebkitTextStroke: '1.5px var(--rule-strong)',
            }}
          >
            {member.name}
          </span>

          {/* Bottom margin below lg makes room for the caption, which hangs
              under the circle absolutely and would otherwise sit on the name. */}
          <div className="relative mt-[10vh] mb-20 lg:my-0">
            <ChapterFigure
              ref={figure}
              member={member}
              chapter={chapter}
              size="var(--chapter-circle)"
            />
          </div>
        </div>
      </div>

      {/* Text column. The thread runs down its inner edge. */}
      {/* Starts at the 7th column so its left edge sits on the page's centre
          line, give or take the grid gap — which the thread steps back over,
          so it runs straight on from the map's axis above. */}
      <div className="relative mt-[8vh] lg:col-span-6 lg:col-start-7 lg:mt-0 lg:pl-12">
        <span
          data-thread
          aria-hidden="true"
          className="absolute top-0 bottom-0 left-[-13px] hidden w-[2px] origin-top lg:block"
          style={{ background: member.color }}
        />
        <Spark
          data-thread-spark
          className="thread-spark absolute left-[-12px] hidden lg:block"
        />

        <header className="lg:pt-[24vh]">
          <p className="u-mono-sm u-dim" data-chapter-meta>
            Ch. {pad(index + 1, 2)} / {pad(total, 2)} · {chapter.depth}
          </p>
          <h3
            id={headingId}
            data-chapter-name
            className="u-display mt-4"
            style={{ fontSize: 'clamp(4rem, 9vw, 9rem)' }}
          >
            {member.name}
          </h3>
          <p
            className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-1"
            data-chapter-meta
          >
            <span className="u-kr" style={{ fontSize: 'clamp(1.3rem, 2vw, 2rem)' }}>
              {member.hangul}
            </span>
            <span className="u-mono u-dim">{member.animal}</span>
            <span className="u-mono u-dim inline-flex items-center gap-2">
              <span
                aria-hidden="true"
                className="inline-block size-2.5"
                style={{ background: member.color }}
              />
              {member.color}
            </span>
          </p>
          <p
            className="u-serif mt-6"
            style={{ fontSize: 'clamp(1.5rem, 2.6vw, 2.6rem)', lineHeight: 1.15 }}
            data-chapter-meta
          >
            {chapter.line || chapter.part}
          </p>
        </header>

        <ol className="mt-[6vh] lg:mt-0">
          {ERAS.map((era, i) => {
            const absence = !member.photos[era.id]
              ? member.absence?.[era.id]
              : undefined
            const text = story[era.id] || absence || `Title track — ${era.titleTrack}`
            return (
              <li
                key={era.id}
                data-beat={era.id}
                data-absent={absence ? '' : undefined}
                className="cf-beat relative flex flex-col justify-center py-6 lg:py-0"
              >
                {/* The era's name set large, so each beat has a shape of its own
                    rather than being two small lines floating in a tall box. */}
                <p className="u-mono-sm" style={{ color: 'var(--ink-dim)' }}>
                  Era {pad(i + 1, 2)} · {formatDotted(era.released)}
                </p>
                <p
                  className="u-serif mt-2"
                  style={{ fontSize: 'clamp(1.8rem, 3.2vw, 3.2rem)', lineHeight: 1.05 }}
                >
                  {era.title}
                </p>
                <p className="u-body mt-3 max-w-[38ch]">{text}</p>
              </li>
            )
          })}
        </ol>

        <div className="pt-4 pb-[14vh] lg:pb-[6vh]">
          <button
            type="button"
            data-cursor="Open"
            className="u-mono group inline-flex items-center gap-3 border px-4 py-3 transition-colors duration-300"
            style={{ borderColor: 'var(--rule-strong)' }}
            onPointerEnter={onIntent}
            onFocus={onIntent}
            onClick={(e) => onOpen(member, e.currentTarget)}
          >
            Open the full file
            <span aria-hidden="true" style={{ color: member.color }}>
              →
            </span>
          </button>
        </div>
      </div>
    </article>
  )
}
