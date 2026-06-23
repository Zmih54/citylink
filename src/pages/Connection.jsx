import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Loader2, ShieldCheck, Clock, Cable, Phone, Send } from 'lucide-react'
import { PageHero, Reveal } from '../components/ui.jsx'
import { company } from '../data/site.js'
import { useTariffs } from '../hooks/useTariffs.js'

const empty = {
  name: '',
  phone: '',
  address: '',
  tariff: '',
  contactMethod: 'phone',
  comment: '',
  consent: false,
}

function validate(v) {
  const e = {}
  if (!v.name.trim() || v.name.trim().length < 2) e.name = 'Вкажіть ім\'я (мінімум 2 символи)'
  const digits = v.phone.replace(/\D/g, '')
  if (digits.length < 10) e.phone = 'Вкажіть коректний номер телефону'
  if (!v.address.trim() || v.address.trim().length < 5) e.address = 'Вкажіть адресу підключення'
  if (!v.consent) e.consent = 'Потрібна згода на обробку даних'
  return e
}

export default function Connection() {
  const { tariffs: rates, loading: tariffsLoading } = useTariffs()
  const [form, setForm] = useState(empty)
  const [attempted, setAttempted] = useState(false)
  const [touched, setTouched] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | done
  const [ticket, setTicket] = useState('')

  // Preselect a default tariff once they load (popular, else the first).
  useEffect(() => {
    if (!rates.length) return
    setForm((f) => {
      if (f.tariff && rates.some((r) => r.id === f.tariff)) return f
      return { ...f, tariff: rates.find((r) => r.popular)?.id || rates[0].id }
    })
  }, [rates])

  const errors = useMemo(() => validate(form), [form])
  const set = (k, val) => setForm((f) => ({ ...f, [k]: val }))
  const blur = (k) => setTouched((t) => ({ ...t, [k]: true }))

  const showErr = (k) => (touched[k] || attempted) && errors[k]

  const onSubmit = (e) => {
    e.preventDefault()
    setTouched({ name: true, phone: true, address: true, consent: true })
    if (Object.keys(errors).length) {
      setAttempted(true)
      return
    }
    setStatus('sending')
    // Simulated submission. In production this would POST to a backend
    // or send a message to the company Telegram bot.
    setTimeout(() => {
      const num = 'CL-' + Math.floor(100000 + Math.random() * 900000)
      setTicket(num)
      try {
        const prev = JSON.parse(localStorage.getItem('cl_requests') || '[]')
        prev.push({ ...form, ticket: num, createdAt: new Date().toISOString() })
        localStorage.setItem('cl_requests', JSON.stringify(prev))
      } catch (_) {}
      setStatus('done')
    }, 1100)
  }

  if (status === 'done') {
    return (
      <div className="container-px py-24">
        <Reveal className="mx-auto max-w-lg">
          <div className="card p-10 text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-500/15 text-brand-300">
              <CheckCircle2 className="h-9 w-9" />
            </span>
            <h1 className="mt-6 text-2xl font-extrabold text-white">Заявку прийнято!</h1>
            <p className="mt-3 text-slate-400">
              Дякуємо, {form.name.split(' ')[0]}! Ваш номер заявки <span className="font-bold text-brand-300">{ticket}</span>.
              Менеджер зв'яжеться з вами найближчим часом для підтвердження підключення.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link to="/" className="btn-ghost">На головну</Link>
              <a href={company.phoneHref} className="btn-primary">{company.phone}</a>
            </div>
          </div>
        </Reveal>
      </div>
    )
  }

  return (
    <>
      <PageHero
        eyebrow="Підключення"
        title="Заявка на підключення"
        subtitle="Заповніть форму — і ми безкоштовно перевіримо можливість підключення за вашою адресою. Зазвичай зв'язуємось протягом кількох годин."
      />

      <section className="container-px py-14">
        <div className="grid gap-8 lg:grid-cols-5">
          <Reveal className="lg:col-span-3">
            <form onSubmit={onSubmit} noValidate className="card p-7 sm:p-9">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Ваше ім'я *" error={showErr('name')}>
                  <input
                    className="input" placeholder="Напр. Олександр"
                    value={form.name}
                    onChange={(e) => set('name', e.target.value)}
                    onBlur={() => blur('name')}
                  />
                </Field>
                <Field label="Телефон *" error={showErr('phone')}>
                  <input
                    className="input" placeholder="+38 (0__) ___-__-__" inputMode="tel"
                    value={form.phone}
                    onChange={(e) => set('phone', e.target.value)}
                    onBlur={() => blur('phone')}
                  />
                </Field>
              </div>

              <div className="mt-5">
                <Field label="Адреса підключення *" error={showErr('address')}>
                  <input
                    className="input" placeholder="Вулиця, будинок, квартира"
                    value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                    onBlur={() => blur('address')}
                  />
                </Field>
              </div>

              <div className="mt-5">
                <span className="label">Бажаний тариф</span>
                {tariffsLoading ? (
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" /> Завантажуємо тарифи…
                  </div>
                ) : rates.length === 0 ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-400">
                    Тарифи тимчасово недоступні. Залиште заявку — менеджер підбере план під ваші потреби.
                  </div>
                ) : (
                <div className="grid gap-3 sm:grid-cols-3">
                  {rates.map((r) => (
                    <button
                      type="button" key={r.id}
                      onClick={() => set('tariff', r.id)}
                      className={`rounded-xl border p-3 text-left transition ${
                        form.tariff === r.id ? 'border-brand-400/60 bg-brand-400/10' : 'border-white/10 bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="font-bold text-white">{r.name}</div>
                      <div className="text-xs text-slate-400">{r.speed} Мбіт · {r.price} грн</div>
                    </button>
                  ))}
                </div>
                )}
              </div>

              <div className="mt-5">
                <span className="label">Як з вами зв'язатися?</span>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'phone', label: 'Дзвінок', icon: Phone },
                    { id: 'telegram', label: 'Telegram', icon: Send },
                  ].map((m) => (
                    <button
                      type="button" key={m.id}
                      onClick={() => set('contactMethod', m.id)}
                      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                        form.contactMethod === m.id ? 'border-brand-400/60 bg-brand-400/10 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                      }`}
                    >
                      <m.icon className="h-4 w-4" /> {m.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <Field label="Коментар (необов'язково)">
                  <textarea
                    className="input min-h-[96px] resize-y" placeholder="Зручний час дзвінка, тип будинку, додаткові побажання…"
                    value={form.comment}
                    onChange={(e) => set('comment', e.target.value)}
                  />
                </Field>
              </div>

              <label className="mt-5 flex items-start gap-3 text-sm text-slate-400">
                <input
                  type="checkbox" className="mt-0.5 h-5 w-5 rounded border-white/20 bg-ink-900 accent-brand-500"
                  checked={form.consent}
                  onChange={(e) => set('consent', e.target.checked)}
                  onBlur={() => blur('consent')}
                />
                <span>
                  Я погоджуюсь на обробку персональних даних для опрацювання заявки.
                  {showErr('consent') && <span className="mt-1 block text-rose-400">{errors.consent}</span>}
                </span>
              </label>

              <button type="submit" disabled={status === 'sending'} className="btn-primary mt-7 w-full disabled:opacity-70">
                {status === 'sending' ? (<><Loader2 className="h-4 w-4 animate-spin" /> Надсилаємо…</>) : 'Надіслати заявку'}
              </button>
              <p className="mt-3 text-center text-xs text-slate-500">Натискаючи кнопку, ви погоджуєтесь, що з вами зв'яжеться менеджер CityLink.</p>
            </form>
          </Reveal>

          <Reveal delay={120} className="lg:col-span-2">
            <div className="card p-7">
              <h3 className="text-lg font-bold text-white">Що далі?</h3>
              <ul className="mt-5 space-y-5">
                {[
                  { icon: ShieldCheck, t: 'Перевірка покриття', d: 'Безкоштовно переконаємось, що технічно можемо вас підключити.' },
                  { icon: Clock, t: 'Швидкий зв\'язок', d: 'Передзвонимо протягом кількох годин у робочий час.' },
                  { icon: Cable, t: 'Монтаж 1–3 дні', d: 'Узгодимо час і заведемо оптику без зайвого клопоту.' },
                ].map((s) => (
                  <li key={s.t} className="flex gap-3">
                    <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-brand-500/15 text-brand-300">
                      <s.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <div className="font-semibold text-white">{s.t}</div>
                      <div className="text-sm text-slate-400">{s.d}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-7 rounded-2xl bg-gradient-to-br from-brand-600/20 to-accent-600/20 p-5 text-center">
                <p className="text-sm text-slate-300">Бажаєте підключитись зараз?</p>
                <a href={company.phoneHref} className="mt-2 block text-xl font-extrabold text-white">{company.phone}</a>
                <p className="mt-1 text-xs text-slate-400">{company.workHours}</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
      {error && <span className="mt-1 block text-sm text-rose-400">{error}</span>}
    </label>
  )
}
