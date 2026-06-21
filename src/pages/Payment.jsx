import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Smartphone, Globe, CreditCard, Banknote, Check } from 'lucide-react'
import { PageHero, SectionHeader, Reveal } from '../components/ui.jsx'
import { payments } from '../data/site.js'

const icons = {
  'privat24-app': Smartphone,
  'privatbank-site': Globe,
  'any-card': CreditCard,
  easypay: Banknote,
}

export default function Payment() {
  const [active, setActive] = useState(payments[0].id)
  const current = payments.find((p) => p.id === active)
  const Icon = icons[current.id] || CreditCard

  return (
    <>
      <PageHero
        eyebrow="Оплата послуг"
        title="Зручні способи оплати"
        subtitle="Поповнюйте рахунок будь-яким зручним способом. Зарахування — від кількох хвилин."
      />

      <section className="container-px py-14">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {payments.map((p, i) => {
            const PIcon = icons[p.id] || CreditCard
            const isActive = active === p.id
            return (
              <Reveal key={p.id} delay={i * 70}>
                <button
                  onClick={() => setActive(p.id)}
                  className={`card h-full w-full p-6 text-left transition hover:-translate-y-1 ${
                    isActive ? 'border-brand-400/50 shadow-glow' : 'hover:border-brand-400/30'
                  }`}
                >
                  <span className={`grid h-11 w-11 place-items-center rounded-xl ${isActive ? 'bg-brand-500 text-white' : 'bg-brand-500/15 text-brand-300'}`}>
                    <PIcon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-4 font-bold text-white">{p.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{p.desc}</p>
                </button>
              </Reveal>
            )
          })}
        </div>

        <Reveal className="mt-10">
          <div className="card p-8">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
                <Icon className="h-6 w-6" />
              </span>
              <h2 className="text-xl font-extrabold text-white">{current.title}</h2>
            </div>
            <ol className="mt-6 space-y-4">
              {current.steps.map((s, idx) => (
                <li key={idx} className="flex gap-4">
                  <span className="grid h-8 w-8 flex-none place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-sm font-bold text-white">
                    {idx + 1}
                  </span>
                  <p className="pt-1 text-slate-300">{s}</p>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex items-center gap-2 rounded-xl bg-brand-500/10 p-4 text-sm text-brand-100">
              <Check className="h-4 w-4 flex-none" /> Для оплати завжди потрібен лише номер вашого договору (особового рахунку).
            </div>
          </div>
        </Reveal>

        <Reveal className="mt-10">
          <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-brand-600/20 to-accent-600/20 p-10 text-center">
            <SectionHeader center title="Не знаєте номер договору?" subtitle="Він вказаний у вашому особистому кабінеті та в договорі про надання послуг." />
            <div className="flex flex-wrap justify-center gap-3">
              <Link to="/cabinet" className="btn-primary">Особистий кабінет</Link>
              <Link to="/contacts" className="btn-ghost">Зв'язатися з нами</Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
