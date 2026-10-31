import { forwardRef } from 'react'
import type { EraId, Member } from '@/types'
import { PRESENT_ON, type Chapter } from '@/data/member-story'
import { ERAS } from '@/data/eras'
import { getMedia } from '@/lib/media'
import { formatDotted } from '@/lib/format'
import { Picture } from '@/components/Picture'

/**
 * How each cut-out sits in its circle, in units of the circle's diameter.
 *
 *   h    — figure height. This is the number that evens the five out: Choerry,
 *          Jinsoul and Haseul are long shots with a small head in a tall frame,
 *          Heejin is a close-up that is nearly all head. Scaling every photo
 *          to the circle made the close-up's head twice the size of the
 *          others, so each one is sized by eye until the heads match.
 *   hx   — her head's centre, as a fraction of the figure's own width. The
 *          figure is placed so that point sits on the circle's vertical axis.
 *   top  — how far the crown rises above the top of the circle.
 *   col  — width of the column above the centre line that lets her head out.
 *
 * The column is much wider than it looks like it needs to be, and the reason is
 * where it actually does anything. Above the centre line the circle is wider
 * than the column almost all the way up; the column only takes over where it
 * crosses the arc, a quarter of the way down from the top. Everything above
 * that is hair and crown. At 45% it sliced straight down through the hair on
 * both sides, and cut the Dall glow off in a hard-edged box. At 85% the whole
 * head fits with room for the glow to fade, while the shoulders — which start
 * below the crossing — still stay inside the circle.
 *
 * Kim Lip's cheek touches the left edge of her photo for a short stretch, so
 * a few pixels of it are straight. It is left exactly as photographed: fading
 * that edge was tried, and it read as her face dissolving, which is worse than
 * a line most people will never see.
 *
 * Every photo has a flat bottom, so each `h` also has a floor: the figure has
 * to be tall enough for its bottom edge to land below the circle. Check all
 * five at 1440 and 390 after touching any of these.
 */
const FIGURE_FIT: Record<
  Member['id'],
  { h: number; hx: number; top: number; col: number }
> = {
  choerry: { h: 2.7, hx: 0.43, top: 0.08, col: 0.85 },
  kimlip: { h: 1.55, hx: 0.33, top: 0.08, col: 0.85 },
  heejin: { h: 1.34, hx: 0.46, top: 0.08, col: 0.85 },
  jinsoul: { h: 2.0, hx: 0.445, top: 0.08, col: 0.85 },
  haseul: { h: 2.7, hx: 0.41, top: 0.08, col: 0.85 },
}

/** The echoes behind Hyper-Ego's figure: offset as a fraction of her width. */
const ECHOES = [
  { x: -0.24, opacity: 0.35 },
  { x: 0.24, opacity: 0.35 },
  { x: -0.12, opacity: 0.6 },
  { x: 0.12, opacity: 0.6 },
]

interface ChapterFigureProps {
  member: Member
  chapter: Chapter
  /** Diameter as a CSS length. */
  size: string
}

/**
 * One member, one photograph, three ways of looking.
 *
 * The three looks are three stacked copies of the same cut-out, each with its
 * own treatment, and `data-active` on the root decides which one shows. The
 * attribute is written straight onto the element by the chapter's scroll
 * triggers — there is no React state anywhere in this component, so scrolling
 * through the beats never re-renders anything.
 *
 * The figure is clipped to the circle plus a column above its centre line, so
 * her head breaks out of the top while her shoulders stay inside. clipPath
 * children union by default, which is the whole trick: one circle, one
 * rectangle, no path maths.
 */
export const ChapterFigure = forwardRef<HTMLElement, ChapterFigureProps>(
  function ChapterFigure({ member, chapter, size }, ref) {
    const slug = `${member.id}-cut`
    const record = getMedia(slug)
    const fit = FIGURE_FIT[member.id]
    const clipId = `figure-clip-${member.id}`

    // A look exists where she has a photo for that era. Where she does not and
    // the data says why, the circle is left standing without her.
    const present = (era: EraId) => Boolean(member.photos[era])
    const absentFrom = ERAS.find((e) => !present(e.id) && member.absence?.[e.id])

    const width = record ? fit.h * record.aspect : 1
    const shot = {
      width: `${width * 100}%`,
      left: `${50 - fit.hx * width * 100}%`,
      top: chapter.breakout === 'top' ? `${-fit.top * 100}%` : undefined,
      bottom: chapter.breakout === 'bottom' ? `${-fit.top * 100}%` : undefined,
    }
    // Rough rendered width, so the browser picks a sensible file: the circle is
    // ~34vw on desktop and ~72vw below lg, and the figure is `width` times that.
    const sizes = `(max-width: 1023px) ${Math.round(width * 72)}vw, ${Math.round(width * 34)}vw`

    const image = (alt: string) => (
      <Picture slug={slug} alt={alt} sizes={sizes} lqip={false} focus="center top" />
    )

    return (
      <figure
        ref={ref}
        className="cf"
        data-active="dall"
        data-absent={absentFrom?.id}
        style={{ '--d': size, '--member': member.color } as React.CSSProperties}
      >
        <svg aria-hidden="true" focusable="false" className="absolute size-0">
          <clipPath id={clipId} clipPathUnits="objectBoundingBox">
            <circle cx="0.5" cy="0.5" r="0.5" />
            <rect
              x={0.5 - fit.col / 2}
              y={chapter.breakout === 'top' ? -1 : 0.5}
              width={fit.col}
              height="1.5"
            />
          </clipPath>
        </svg>

        <div className="cf-disc" aria-hidden="true" />

        {/* The echoes stay inside the circle. Let through the breakout column
            they read as a red box standing on top of it, not as her ego
            spilling over. Behind the main clip, so the figure stays in front. */}
        {present('ego') && (
          <div className="cf-clip cf-clip-circle" aria-hidden="true">
            <div className="cf-look" data-look="ego">
              {ECHOES.map((echo) => (
                <div
                  key={echo.x}
                  className="cf-shot cf-echo"
                  style={{
                    ...shot,
                    opacity: echo.opacity,
                    transform: `translateX(${echo.x * 100}%)`,
                  }}
                >
                  {image('')}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="cf-clip" style={{ clipPath: `url(#${clipId})` }}>
          {present('dall') && (
            <div className="cf-look" data-look="dall">
              <div className="cf-shot" style={shot}>
                {image(`${member.name}, ${chapter.part}`)}
              </div>
            </div>
          )}
          {present('icarus') && (
            <div className="cf-look" data-look="icarus" aria-hidden="true">
              <div className="cf-shot" style={shot}>
                {image('')}
              </div>
            </div>
          )}
          {present('ego') && (
            <div className="cf-look" data-look="ego" aria-hidden="true">
              <div className="cf-shot" style={shot}>
                {image('')}
              </div>
            </div>
          )}
        </div>

        {absentFrom && (
          <div className="cf-absence" aria-hidden="true">
            <span className="u-kr" style={{ fontSize: 'calc(var(--d) * 0.22)' }}>
              부재
            </span>
            <span className="u-mono">Absent</span>
            {PRESENT_ON[member.id] && (
              <span className="u-mono-sm u-dim mt-2 max-w-[70%] text-center">
                Present on — {PRESENT_ON[member.id]}
              </span>
            )}
          </div>
        )}

        {/* Hidden from assistive tech: the beat beside it names the era in
            words, and three captions of which two are invisible would be read
            out as one muddle. */}
        <figcaption className="cf-caption" aria-hidden="true">
          {ERAS.map((era) => (
            <span key={era.id} className="cf-caption-line u-mono-sm" data-for={era.id}>
              {era.title} · {formatDotted(era.released)}
            </span>
          ))}
          <span className="flex gap-1.5" aria-hidden="true">
            {ERAS.map((era) => (
              <span key={era.id} className="cf-bar" data-for={era.id} />
            ))}
          </span>
        </figcaption>
      </figure>
    )
  },
)
