import { useEffect, useRef, useState } from 'react'

export function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true)
          io.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-out ${
        shown ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  )
}

export function SectionHeader({ eyebrow, title, subtitle, center = true }) {
  return (
    <div className={`mb-10 ${center ? 'mx-auto max-w-2xl text-center' : ''}`}>
      {eyebrow && <span className="chip mb-3">{eyebrow}</span>}
      <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-slate-400">{subtitle}</p>}
    </div>
  )
}

export function PageHero({ eyebrow, title, subtitle, children }) {
  return (
    <section className="relative overflow-hidden border-b border-white/10">
      <div className="container-px py-16 sm:py-20">
        {eyebrow && <span className="chip mb-4">{eyebrow}</span>}
        <h1 className="max-w-3xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl">{title}</h1>
        {subtitle && <p className="mt-4 max-w-2xl text-lg text-slate-400">{subtitle}</p>}
        {children}
      </div>
    </section>
  )
}
