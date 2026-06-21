import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Gauge, Star, Globe, Router, Calculator, ArrowRight } from 'lucide-react'
import { PageHero, SectionHeader, Reveal } from '../components/ui.jsx'
import { STATIC_IP_PRICE } from '../data/site.js'
import { useTariffs } from '../hooks/useTariffs.js'

export default function Rates() {
  const { tariffs: rates } = useTariffs()
  const [selected, setSelected] = useState(null)
  const [staticIp, setStaticIp] = useState(false)
  const [months, setMonths] = useState(1)

  const plan = useMemo(
    () => rates.find((r) => r.id === selected) || rates.find((r) => r.popular) || rates[0],
    [rates, selected],
  )
  if (!plan) return null
  const monthly = plan.price + (staticIp ? STATIC_IP_PRICE : 0)
  const total = monthly * months

  return (
    <>
      <PageHero
        eyebrow="Тарифні плани"
        title="Прозорі тарифи без зірочок"
        subtitle="Абонплата вказана за один календарний місяць. Підключення безкоштовне для приватних будинків та багатоповерхівок у зоні покриття."
      />

      {/* Cards */}
      <section className="container-px py-14">
        <div className="grid gap-6 lg:grid-cols-3">
          {rates.map((r, i) => (
            <Reveal key={r.id} delay={i * 80}>
              <div className={`card relative flex h-full flex-col p-7 ${r.popular ? 'border-brand-400/40 shadow-glow' : ''}`}>
                {r.popular && (
                  <span className="absolute -top-3 left-7 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-500 to-accent-500 px-3 py-1 text-xs font-bold text-white">
                    <Star className="h-3.5 w-3.5" /> Популярний
                  </span>
                )}
                <h3 className="text-xl font-extrabold text-white">{r.name}</h3>
                <p className="text-sm text-slate-400">{r.tagline}</p>
                <div className="my-5 flex items-end gap-1">
                  <span className="text-4xl font-extrabold text-white">{r.price}</span>
                  <span className="mb-1 text-slate-400">грн/міс</span>
                </div>
                <div className="mb-5 grid grid-cols-2 gap-2 text-sm">
                  <div className="rounded-xl bg-white/5 p-3 text-center">
                    <div className="text-xs text-slate-400">Завантаження</div>
                    <div className="font-bold text-brand-200">{r.speed} Мбіт</div>
                  </div>
                  <div className="rounded-xl bg-white/5 p-3 text-center">
                    <div className="text-xs text-slate-400">Вивантаження</div>
                    <div className="font-bold text-brand-200">{r.speed} Мбіт</div>
                  </div>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-300">
                  {r.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-none text-brand-400" /> {f}
                    </li>
                  ))}
                  <li className="flex items-start gap-2 text-slate-400">
                    <Globe className="mt-0.5 h-4 w-4 flex-none text-accent-400" /> Реальна IP-адреса: +{STATIC_IP_PRICE} грн
                  </li>
                </ul>
                <div className="mt-auto pt-7">
                  <Link to="/connection" className={`w-full ${r.popular ? 'btn-primary' : 'btn-ghost'}`}>
                    Підключити {r.name}
                  </Link>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Calculator */}
      <section className="container-px py-14">
        <SectionHeader eyebrow="Калькулятор" title="Порахуйте вартість" subtitle="Оберіть тариф, додаткові опції та період — побачите підсумок одразу." />
        <div className="grid gap-6 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <div className="card p-7">
              <label className="label flex items-center gap-2"><Gauge className="h-4 w-4 text-brand-400" /> Тарифний план</label>
              <div className="grid gap-3 sm:grid-cols-3">
                {rates.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelected(r.id)}
                    className={`rounded-xl border p-4 text-left transition ${
                      plan.id === r.id
                        ? 'border-brand-400/60 bg-brand-400/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="font-bold text-white">{r.name}</div>
                    <div className="text-xs text-slate-400">{r.speed} Мбіт/с</div>
                    <div className="mt-1 text-sm font-semibold text-brand-200">{r.price} грн</div>
                  </button>
                ))}
              </div>

              <label className="label mt-7 flex items-center gap-2"><Globe className="h-4 w-4 text-brand-400" /> Додаткові опції</label>
              <button
                onClick={() => setStaticIp((v) => !v)}
                className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                  staticIp ? 'border-brand-400/60 bg-brand-400/10' : 'border-white/10 bg-white/5 hover:border-white/20'
                }`}
              >
                <span>
                  <span className="block font-semibold text-white">Реальна (біла) IP-адреса</span>
                  <span className="text-xs text-slate-400">Потрібна для відеоспостереження, серверів, віддаленого доступу</span>
                </span>
                <span className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-brand-200">+{STATIC_IP_PRICE} грн</span>
                  <span className={`grid h-6 w-11 items-center rounded-full p-0.5 transition ${staticIp ? 'bg-brand-500' : 'bg-white/15'}`}>
                    <span className={`h-5 w-5 rounded-full bg-white transition ${staticIp ? 'translate-x-5' : ''}`} />
                  </span>
                </span>
              </button>

              <label className="label mt-7 flex items-center gap-2"><Router className="h-4 w-4 text-brand-400" /> Період оплати</label>
              <div className="flex flex-wrap gap-2">
                {[1, 3, 6, 12].map((m) => (
                  <button
                    key={m}
                    onClick={() => setMonths(m)}
                    className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                      months === m ? 'border-brand-400/60 bg-brand-400/10 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    {m} міс
                  </button>
                ))}
              </div>
            </div>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-2">
            <div className="card sticky top-24 p-7">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <Calculator className="h-5 w-5 text-brand-400" /> Підсумок
              </div>
              <div className="mt-5 space-y-3 text-sm">
                <Row label={`Тариф ${plan.name}`} value={`${plan.price} грн/міс`} />
                {staticIp && <Row label="Реальна IP" value={`+${STATIC_IP_PRICE} грн/міс`} />}
                <Row label="Період" value={`${months} міс`} />
                <div className="border-t border-white/10 pt-3">
                  <Row label="На місяць" value={`${monthly} грн`} bold />
                </div>
              </div>
              <div className="mt-5 rounded-2xl bg-gradient-to-br from-brand-600/30 to-accent-600/30 p-5 text-center">
                <div className="text-xs uppercase tracking-wider text-slate-300">Разом за {months} міс</div>
                <div className="mt-1 text-4xl font-extrabold text-white">{total} <span className="text-lg">грн</span></div>
              </div>
              <Link to="/connection" className="btn-primary mt-5 w-full">
                Підключити <ArrowRight className="h-4 w-4" />
              </Link>
              <p className="mt-3 text-center text-xs text-slate-500">Підключення та прокладання кабелю — безкоштовно</p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}

function Row({ label, value, bold }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-slate-400">{label}</span>
      <span className={bold ? 'text-lg font-extrabold text-white' : 'font-semibold text-slate-200'}>{value}</span>
    </div>
  )
}
