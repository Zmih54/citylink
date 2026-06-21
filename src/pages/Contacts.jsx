import { useMemo, useState } from 'react'
import { Phone, Send, MapPin, Clock, Mail, CheckCircle2, Loader2 } from 'lucide-react'
import { PageHero, Reveal } from '../components/ui.jsx'
import { company } from '../data/site.js'

export default function Contacts() {
  const [form, setForm] = useState({ name: '', contact: '', message: '' })
  const [touched, setTouched] = useState({})
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)

  const errors = useMemo(() => {
    const e = {}
    if (!form.name.trim()) e.name = 'Вкажіть ім\'я'
    if (!form.contact.trim()) e.contact = 'Вкажіть телефон або e-mail'
    if (form.message.trim().length < 5) e.message = 'Напишіть повідомлення'
    return e
  }, [form])

  const submit = (e) => {
    e.preventDefault()
    setTouched({ name: true, contact: true, message: true })
    if (Object.keys(errors).length) return
    setSending(true)
    setTimeout(() => { setSending(false); setSent(true) }, 900)
  }

  const cards = [
    { icon: Phone, t: 'Телефон', v: company.phone, href: company.phoneHref },
    { icon: Send, t: 'Telegram', v: '@citylink', href: company.telegram },
    { icon: Mail, t: 'E-mail', v: company.email, href: `mailto:${company.email}` },
    { icon: MapPin, t: 'Адреса', v: `${company.country}, м. ${company.city}` },
    { icon: Clock, t: 'Графік', v: company.workHours },
  ]

  return (
    <>
      <PageHero eyebrow="Контакти" title="Ми завжди на зв'язку" subtitle="Зателефонуйте, напишіть у Telegram або залиште повідомлення — відповімо якнайшвидше." />

      <section className="container-px py-14">
        <div className="grid gap-8 lg:grid-cols-2">
          <Reveal>
            <div className="grid gap-4 sm:grid-cols-2">
              {cards.map((c) => {
                const inner = (
                  <>
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
                      <c.icon className="h-6 w-6" />
                    </span>
                    <div className="mt-4 text-xs uppercase tracking-wider text-slate-400">{c.t}</div>
                    <div className="mt-1 font-bold text-white">{c.v}</div>
                  </>
                )
                return c.href ? (
                  <a key={c.t} href={c.href} target={c.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="card p-6 transition hover:-translate-y-1 hover:border-brand-400/30">
                    {inner}
                  </a>
                ) : (
                  <div key={c.t} className="card p-6">{inner}</div>
                )
              })}
            </div>
          </Reveal>

          <Reveal delay={120}>
            {sent ? (
              <div className="card flex h-full flex-col items-center justify-center p-10 text-center">
                <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-500/15 text-brand-300">
                  <CheckCircle2 className="h-9 w-9" />
                </span>
                <h3 className="mt-5 text-xl font-bold text-white">Повідомлення надіслано</h3>
                <p className="mt-2 text-slate-400">Дякуємо! Ми зв'яжемося з вами найближчим часом.</p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate className="card p-7">
                <h3 className="text-lg font-bold text-white">Напишіть нам</h3>
                <div className="mt-5 space-y-4">
                  <div>
                    <span className="label">Ім'я</span>
                    <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} onBlur={() => setTouched({ ...touched, name: true })} placeholder="Ваше ім'я" />
                    {touched.name && errors.name && <span className="mt-1 block text-sm text-rose-400">{errors.name}</span>}
                  </div>
                  <div>
                    <span className="label">Телефон або e-mail</span>
                    <input className="input" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} onBlur={() => setTouched({ ...touched, contact: true })} placeholder="Як з вами зв'язатися" />
                    {touched.contact && errors.contact && <span className="mt-1 block text-sm text-rose-400">{errors.contact}</span>}
                  </div>
                  <div>
                    <span className="label">Повідомлення</span>
                    <textarea className="input min-h-[120px] resize-y" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} onBlur={() => setTouched({ ...touched, message: true })} placeholder="Ваше запитання…" />
                    {touched.message && errors.message && <span className="mt-1 block text-sm text-rose-400">{errors.message}</span>}
                  </div>
                </div>
                <button type="submit" disabled={sending} className="btn-primary mt-6 w-full disabled:opacity-70">
                  {sending ? (<><Loader2 className="h-4 w-4 animate-spin" /> Надсилаємо…</>) : 'Надіслати'}
                </button>
              </form>
            )}
          </Reveal>
        </div>
      </section>
    </>
  )
}
