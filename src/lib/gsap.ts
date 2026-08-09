import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, useGSAP)

// limitCallbacks trims a meaningful amount of work on a page this
// ScrollTrigger-heavy; ignoreMobileResize stops iOS URL-bar show/hide from
// firing a full refresh mid-scroll (which is what makes pinned sections jump).
ScrollTrigger.config({ limitCallbacks: true, ignoreMobileResize: true })

export { gsap, ScrollTrigger, useGSAP }
