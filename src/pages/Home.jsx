import { Link } from 'react-router-dom'
import {
  Zap, Wifi, ShieldCheck, Headphones, Gauge, Router, Cable, MapPin,
  ArrowRight, Check, Star, Tv, Gamepad2, Building2,
} from 'lucide-react'
import { Reveal, SectionHeader } from '../components/ui.jsx'
import { rates, news, company } from '../data/site.js'

const features = [
  { icon: Gauge, title: 'Оптика до квартири', text: 'Технологія FTTB/GPON: стабільна симетрична швидкість без просідань увечері.' },
  { icon: ShieldCheck, title: 'Без прихованих платежів', text: 'Чесна абонплата за календарний місяць. Підключення та модем — безкоштовно.' },
  { icon: Headphones, title: 'Підтримка поруч', text: 'Місцева техпідтримка, яка реально допомагає. Виїзд майстра за потреби.' },
  { icon: Wifi, title: 'Wi-Fi «під ключ»', text: 'Налаштуємо роутер і покриття у вашому домі так, щоб ловило в кожній кімнаті.' },
]

const steps = [
  { icon: MapPin, title: 'Залиште заявку', text: 'Вкажіть адресу та зручний час — або просто телефон.' },
  { icon: Headphones, title: 'Підтвердження', text: 'Менеджер передзвонить і узгодить деталі підключення.' },
  { icon: Cable, title: 'Монтаж', text: 'Бригада прокладе кабель і заведе оптику у ваш дім.' },
  { icon: Wifi, title: 'Користуйтесь', text: 'Налаштуємо Wi-Fi — і ви онлайн на повній швидкості.' },
]

const useCases = [
  { icon: Tv, label: '4K-стрімінг' },
  { icon: Gamepad2, label: 'Онлайн-ігри' },
  { icon: Building2, label: 'Робота з дому' },
  { icon: Wifi, label: 'Розумний дім' },
]

export default function Home() {
  const topSpeed = Math.max(...rates.map((r) => r.speed))
  const minPrice = Math.min(...rates.map((r) => r.price))

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -top-32 right-0 h-96 w-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute top-40 -left-20 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="container-px grid items-center gap-12 py-16 sm:py-24 lg:grid-cols-2">
          <Reveal>
            <span className="chip mb-5">
              <Zap className="h-3.5 w-3.5" /> Оптичний інтернет у м. {company.city}
            </span>
            <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Швидкий інтернет,
              <br />
              <span className="gradient-text">який не підводить</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-slate-400">
              Домашній інтернет CityLink — до {topSpeed} Мбіт/с симетрично, безкоштовне підключення
              та підтримка, що завжди на зв'язку. Тарифи від {minPrice} грн/міс.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/connection" className="btn-primary">
                Підключитися <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/rates" className="btn-ghost">Переглянути тарифи</Link>
            </div>
            <div className="mt-10 grid max-w-md grid-cols-3 gap-4">
              {[
                { v: `${topSpeed}`, u: 'Мбіт/с', l: 'до швидкості' },
                { v: '99.9%', u: '', l: 'аптайм мережі' },
                { v: '24/7', u: '', l: 'моніторинг' },
              ].map((s) => (
                <div key={s.l} className="card p-4 text-center">
                  <div className="text-2xl font-extrabold text-white">
                    {s.v}<span className="text-sm font-semibold text-brand-300"> {s.u}</span>
                  </div>
                  <div className="mt-1 text-xs text-slate-400">{s.l}</div>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={150}>
            <div className="relative mx-auto w-full max-w-md">
              <div className="card animate-floaty p-8 shadow-glow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-300">
                    <Router className="h-5 w-5 text-brand-400" /> Тест швидкості
                  </div>
                  <span className="chip">Online</span>
                </div>
                <div className="mt-8 text-center">
                  <div className="text-6xl font-extrabold tabular-nums text-white">{topSpeed}</div>
                  <div className="text-sm uppercase tracking-widest text-brand-300">Мбіт/с</div>
                </div>
                <div className="mt-8 space-y-3">
                  {[
                    { l: 'Завантаження', w: '100%' },
                    { l: 'Вивантаження', w: '100%' },
                    { l: 'Пінг 4 ms', w: '12%' },
                  ].map((b) => (
                    <div key={b.l}>
                      <div className="mb-1 flex justify-between text-xs text-slate-400">
                        <span>{b.l}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-white/10">
                        <div className="h-full rounded-full bg-gradient-to-r from-brand-400 to-accent-400" style={{ width: b.w }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  {useCases.map((u) => (
                    <span key={u.label} className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-2.5 py-1.5 text-xs text-slate-300">
                      <u.icon className="h-3.5 w-3.5 text-brand-300" /> {u.label}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container-px py-16">
        <SectionHeader eyebrow="Чому CityLink" title="Інтернет без компромісів" subtitle="Усе, що потрібно для стабільного зв'язку — і нічого зайвого." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <Reveal key={f.title} delay={i * 80}>
              <div className="card h-full p-6 transition hover:-translate-y-1 hover:border-brand-400/30">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-500/15 text-brand-300">
                  <f.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-white">{f.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{f.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* TARIFFS PREVIEW */}
      <section className="container-px py-16">
        <SectionHeader eyebrow="Тарифи" title="Оберіть свою швидкість" subtitle="Абонплата вказана за один календарний місяць. Підключення безкоштовне." />
        <div className="grid gap-6 lg:grid-cols-3">
          {rates.map((r, i) => (
            <Reveal key={r.id} delay={i * 80}>
              <div className={`card relative h-full p-7 ${r.popular ? 'border-brand-400/40 shadow-glow' : ''}`}>
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
                <div className="mb-5 inline-flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm font-semibold text-brand-200">
                  <Gauge className="h-4 w-4" /> до {r.speed} Мбіт/с
                </div>
                <ul className="space-y-2.5 text-sm text-slate-300">
                  {r.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 flex-none text-brand-400" /> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/connection" className={`mt-7 w-full ${r.popular ? 'btn-primary' : 'btn-ghost'}`}>
                  Підключити {r.name}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/rates" className="link-muted inline-flex items-center gap-1 text-sm font-semibold">
            Усі деталі тарифів та калькулятор <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="container-px py-16">
        <SectionHeader eyebrow="Як підключитися" title="Чотири кроки до інтернету" subtitle="Від заявки до повної швидкості — зазвичай 1–3 дні." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <div className="card relative h-full p-6">
                <span className="absolute right-5 top-5 text-5xl font-black text-white/5">{i + 1}</span>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent-500/15 text-accent-400">
                  <s.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-400">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section className="container-px py-12">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-brand-600/20 via-ink-850 to-accent-600/20 p-10 text-center sm:p-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand-500/20 blur-3xl" />
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold text-white sm:text-4xl">
            Перевірте, чи є покриття за вашою адресою
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-300">
            Залиште заявку — ми безкоштовно перевіримо технічну можливість підключення саме у вас.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/connection" className="btn-primary">Залишити заявку</Link>
            <a href={company.phoneHref} className="btn-ghost">{company.phone}</a>
          </div>
        </div>
      </section>

      {/* NEWS PREVIEW */}
      <section className="container-px py-16">
        <SectionHeader eyebrow="Новини" title="Що нового в CityLink" center />
        <div className="grid gap-6 md:grid-cols-3">
          {news.slice(0, 3).map((n, i) => (
            <Reveal key={n.id} delay={i * 80}>
              <Link to={`/news/${n.id}`} className="card group block h-full overflow-hidden p-6 transition hover:-translate-y-1 hover:border-brand-400/30">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="chip">{n.tag}</span>
                  <span>{new Date(n.date).toLocaleDateString('uk-UA')}</span>
                </div>
                <h3 className="mt-4 text-lg font-bold text-white group-hover:text-brand-200">{n.title}</h3>
                <p className="mt-2 line-clamp-3 text-sm text-slate-400">{n.excerpt}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-300">
                  Читати далі <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  )
}
