import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Globe, Check, Copy, ExternalLink, ShieldCheck, Info } from 'lucide-react'
import { PageHero, SectionHeader, Reveal } from '../components/ui.jsx'

const PRIVAT24_URL = 'https://next.privat24.ua/'
const PRESET = [100, 170, 240, 280, 500, 1000]

export default function Payment() {
  const [contract, setContract] = useState('')
  const [amount, setAmount] = useState('')
  const [copied, setCopied] = useState('')

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(key)
      setTimeout(() => setCopied(''), 1800)
    } catch { /* clipboard unavailable */ }
  }

  const pay = () => {
    window.open(PRIVAT24_URL, '_blank', 'noopener')
  }

  return (
    <>
      <PageHero
        eyebrow="Оплата послуг"
        title="Оплата через ПриватБанк"
        subtitle="Вкажіть суму та номер договору — і перейдіть до оплати в захищеному сервісі Приват24."
      />

      <section className="container-px py-14">
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Form */}
          <Reveal className="lg:col-span-3">
            <div className="card p-7">
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
                  <Globe className="h-6 w-6" />
                </span>
                <div>
                  <h2 className="text-lg font-extrabold text-white">Реквізити платежу</h2>
                  <p className="text-sm text-slate-400">next.privat24.ua</p>
                </div>
              </div>

              <label className="label mt-7">Номер договору (особовий рахунок)</label>
              <div className="flex gap-2">
                <input className="input font-mono" inputMode="numeric" value={contract}
                  onChange={(e) => setContract(e.target.value.replace(/\D/g, ''))} placeholder="1001" />
                <button type="button" onClick={() => copy(contract, 'c')} disabled={!contract}
                  className="btn-ghost shrink-0 px-3 disabled:opacity-50" title="Копіювати">
                  {copied === 'c' ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              <label className="label mt-6">Сума, грн</label>
              <input className="input" inputMode="numeric" value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))} placeholder="240" />
              <div className="mt-3 flex flex-wrap gap-2">
                {PRESET.map((a) => (
                  <button key={a} type="button" onClick={() => setAmount(String(a))}
                    className={`rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${
                      amount === String(a) ? 'border-brand-400/60 bg-brand-400/10 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                    }`}>{a} грн</button>
                ))}
              </div>

              <button onClick={pay} className="btn-primary mt-7 w-full">
                Оплатити через Приват24 <ExternalLink className="h-4 w-4" />
              </button>

              <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-400/10 p-3 text-xs text-amber-100">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  Дані картки вводяться лише на захищеній сторінці ПриватБанку — ми їх не збираємо й не зберігаємо.
                  Скопіюйте номер договору, у Приват24 знайдіть отримувача <b>CityLink</b> у розділі «Інтернет» і вкажіть суму.
                </span>
              </div>
            </div>
          </Reveal>

          {/* Steps + summary */}
          <Reveal delay={120} className="lg:col-span-2">
            <div className="card sticky top-24 p-7">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                <ShieldCheck className="h-5 w-5 text-brand-400" /> Як оплатити
              </div>
              <ol className="mt-5 space-y-4 text-sm">
                {[
                  'Натисніть «Оплатити через Приват24» — відкриється next.privat24.ua.',
                  'Авторизуйтесь і оберіть «Усі послуги» → «Інтернет».',
                  'Знайдіть постачальника CityLink.',
                  'Введіть номер договору та суму, підтвердіть оплату карткою.',
                ].map((s, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-gradient-to-br from-brand-500 to-accent-500 text-xs font-bold text-white">{i + 1}</span>
                    <p className="pt-0.5 text-slate-300">{s}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-6 flex items-center gap-2 rounded-xl bg-brand-500/10 p-4 text-sm text-brand-100">
                <Check className="h-4 w-4 flex-none" /> Зарахування коштів — протягом кількох хвилин.
              </div>
            </div>
          </Reveal>
        </div>

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
