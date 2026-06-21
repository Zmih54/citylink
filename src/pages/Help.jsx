import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Router, ChevronDown, Wifi, FileText, Headphones } from 'lucide-react'
import { PageHero, SectionHeader, Reveal } from '../components/ui.jsx'
import { routerGuides, faq, company } from '../data/site.js'

export default function Help() {
  const [openGuide, setOpenGuide] = useState(routerGuides[0].id)
  const [openFaq, setOpenFaq] = useState(0)

  return (
    <>
      <PageHero
        eyebrow="Допомога користувачам"
        title="Налаштування та підтримка"
        subtitle="Інструкції з налаштування роутерів та відповіді на часті запитання. Не знайшли рішення — ми на зв'язку."
      />

      {/* Router guides */}
      <section className="container-px py-14">
        <SectionHeader eyebrow="Роутери" title="Налаштування роутера" subtitle="Покрокові інструкції для популярних моделей." />
        <div className="space-y-4">
          {routerGuides.map((g) => {
            const open = openGuide === g.id
            return (
              <Reveal key={g.id}>
                <div className="card overflow-hidden">
                  <button
                    onClick={() => setOpenGuide(open ? '' : g.id)}
                    className="flex w-full items-center justify-between gap-4 p-6 text-left"
                  >
                    <span className="flex items-center gap-3">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
                        <Router className="h-6 w-6" />
                      </span>
                      <span>
                        <span className="block font-bold text-white">{g.name}</span>
                        <span className="text-sm text-slate-400">{g.summary}</span>
                      </span>
                    </span>
                    <ChevronDown className={`h-5 w-5 flex-none text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                      <ol className="space-y-3 border-t border-white/10 p-6">
                        {g.steps.map((s, i) => (
                          <li key={i} className="flex gap-3">
                            <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-white/5 text-sm font-bold text-brand-300">{i + 1}</span>
                            <p className="pt-0.5 text-slate-300">{s}</p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="container-px py-14">
        <SectionHeader eyebrow="FAQ" title="Часті запитання" />
        <div className="mx-auto max-w-3xl space-y-3">
          {faq.map((item, i) => {
            const open = openFaq === i
            return (
              <Reveal key={i}>
                <div className="card overflow-hidden">
                  <button onClick={() => setOpenFaq(open ? -1 : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left">
                    <span className="font-semibold text-white">{item.q}</span>
                    <ChevronDown className={`h-5 w-5 flex-none text-slate-400 transition ${open ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`grid transition-all duration-300 ${open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                    <div className="overflow-hidden">
                      <p className="border-t border-white/10 p-5 text-slate-400">{item.a}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            )
          })}
        </div>
      </section>

      {/* Quick links */}
      <section className="container-px py-14">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: Wifi, t: 'Зник інтернет?', d: 'Перезавантажте роутер на 30 секунд. Не допомогло — телефонуйте.', to: '/contacts', cta: 'Підтримка' },
            { icon: FileText, t: 'Документи', d: 'Протокол якості телекомунікаційної послуги та договори.', to: '/contacts', cta: 'Запитати' },
            { icon: Headphones, t: 'Технічна підтримка', d: company.workHours, to: '/contacts', cta: company.phone },
          ].map((c) => (
            <Reveal key={c.t}>
              <div className="card flex h-full flex-col p-6">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-500/15 text-accent-400">
                  <c.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 font-bold text-white">{c.t}</h3>
                <p className="mt-1 flex-1 text-sm text-slate-400">{c.d}</p>
                <Link to={c.to} className="btn-ghost mt-4">{c.cta}</Link>
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
