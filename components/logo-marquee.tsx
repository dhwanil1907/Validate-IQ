"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

const logos = [
  "Y Combinator",
  "Product Hunt",
  "MLH",
  "Replit",
  "Buildspace",
  "AngelList",
]

export function LogoMarquee() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="overflow-hidden bg-[#000000] py-16 [font-family:var(--font-inter),system-ui,sans-serif]">
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : {}}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        className="mx-auto max-w-5xl px-4 sm:px-6"
      >
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-12">
          {logos.map((name) => (
            <li key={name}>
              <span
                className="inline-block cursor-default text-center text-sm font-semibold tracking-tight text-white transition-[transform,filter] duration-200 ease-out [filter:brightness(0)_invert(0.4)] hover:scale-105 hover:filter-none sm:text-base"
                style={{ transformOrigin: "center" }}
              >
                {name}
              </span>
            </li>
          ))}
        </ul>
      </motion.div>
    </section>
  )
}
