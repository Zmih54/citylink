import { Link } from 'react-router-dom'
import { Phone, Send, MapPin, Clock } from 'lucide-react'
import Logo from './Logo.jsx'
import { company, news } from '../data/site.js'

export default function Footer() {
  const latest = news.slice(0, 3)
  return (
    <footer className="mt-24 border-t border-white/10 bg-ink-950/60">
      <div className="container-px grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-slate-400">
            Домашній та бізнес-інтернет у місті {company.city}. Стабільне оптичне з'єднання,
            чесні тарифи та підтримка, що завжди на зв'язку.
          </p>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300">Навігація</h4>
          <ul className="space-y-2 text-sm">
            <li><Link className="link-muted" to="/">Головна</Link></li>
            <li><Link className="link-muted" to="/rates">Тарифи</Link></li>
            <li><Link className="link-muted" to="/news">Новини</Link></li>
            <li><Link className="link-muted" to="/connection">Заявка на підключення</Link></li>
            <li><Link className="link-muted" to="/contacts">Контакти</Link></li>
            <li><Link className="link-muted" to="/help">Допомога користувачам</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300">Останні новини</h4>
          <ul className="space-y-3 text-sm">
            {latest.map((n) => (
              <li key={n.id}>
                <Link className="link-muted line-clamp-2" to={`/news/${n.id}`}>{n.title}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-300">Контакти</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-brand-400" />
              <a className="link-muted" href={company.phoneHref}>{company.phone}</a>
            </li>
            <li className="flex items-center gap-2">
              <Send className="h-4 w-4 text-brand-400" />
              <a className="link-muted" href={company.telegram} target="_blank" rel="noreferrer">Telegram</a>
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-brand-400" />
              {company.country}, {company.city}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-brand-400" />
              {company.workHours}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-px flex flex-col items-center justify-between gap-2 py-5 text-xs text-slate-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {company.name}. Усі права захищені.</p>
          <p>Зроблено з турботою про якість зв'язку.</p>
        </div>
      </div>
    </footer>
  )
}
