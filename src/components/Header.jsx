import { useState, useEffect } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { Menu, X, Phone, ChevronDown, User } from 'lucide-react'
import Logo from './Logo.jsx'
import { company } from '../data/site.js'

const nav = [
  { to: '/', label: 'Головна' },
  { to: '/rates', label: 'Тарифи' },
  { to: '/news', label: 'Новини' },
  { to: '/payment', label: 'Оплата' },
  { to: '/help', label: 'Допомога' },
  { to: '/contacts', label: 'Контакти' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const location = useLocation()

  useEffect(() => setOpen(false), [location])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const linkClass = ({ isActive }) =>
    `relative px-3 py-2 text-sm font-medium transition ${
      isActive ? 'text-white' : 'text-slate-300 hover:text-white'
    }`

  return (
    <header
      className={`sticky top-0 z-50 transition-all ${
        scrolled ? 'border-b border-white/10 bg-ink-950/80 backdrop-blur-xl' : 'border-b border-transparent'
      }`}
    >
      <div className="container-px flex h-16 items-center justify-between gap-4">
        <Logo />

        <nav className="hidden items-center gap-1 lg:flex">
          {nav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-brand-400 to-accent-400" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a href={company.phoneHref} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-200 hover:text-brand-300">
            <Phone className="h-4 w-4 text-brand-400" />
            {company.phone}
          </a>
          <Link to="/cabinet" className="btn-ghost px-4 py-2">
            <User className="h-4 w-4" />
            Кабінет
          </Link>
          <Link to="/connection" className="btn-primary px-4 py-2">
            Підключитися
          </Link>
        </div>

        <button
          onClick={() => setOpen((v) => !v)}
          className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-200 lg:hidden"
          aria-label="Меню"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={`overflow-hidden border-t border-white/10 bg-ink-950/95 backdrop-blur-xl transition-all lg:hidden ${
          open ? 'max-h-[32rem]' : 'max-h-0 border-transparent'
        }`}
      >
        <div className="container-px flex flex-col gap-1 py-4">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `rounded-xl px-4 py-3 text-base font-medium transition ${
                  isActive ? 'bg-white/10 text-white' : 'text-slate-300 hover:bg-white/5'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            <Link to="/cabinet" className="btn-ghost w-full">
              <User className="h-4 w-4" /> Особистий кабінет
            </Link>
            <Link to="/connection" className="btn-primary w-full">
              Залишити заявку
            </Link>
            <a href={company.phoneHref} className="mt-1 inline-flex items-center justify-center gap-2 py-2 text-sm font-semibold text-brand-300">
              <Phone className="h-4 w-4" /> {company.phone}
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
