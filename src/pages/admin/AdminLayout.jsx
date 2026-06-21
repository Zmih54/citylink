import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate, Navigate } from 'react-router-dom'
import {
  LayoutDashboard, Gauge, Users, LogOut, Loader2, ExternalLink, ShieldCheck,
} from 'lucide-react'
import { hasSupabase } from '../../lib/supabase.js'
import { currentUserIsAdmin, adminSignOut } from '../../lib/api.js'

const nav = [
  { to: '/admin', end: true, icon: LayoutDashboard, label: 'Дашборд' },
  { to: '/admin/tariffs', icon: Gauge, label: 'Тарифи' },
  { to: '/admin/subscribers', icon: Users, label: 'Абоненти' },
]

export default function AdminLayout() {
  const navigate = useNavigate()
  const [state, setState] = useState('checking') // checking | ok | denied

  useEffect(() => {
    if (!hasSupabase) { setState('denied'); return }
    let alive = true
    currentUserIsAdmin()
      .then((ok) => alive && setState(ok ? 'ok' : 'denied'))
      .catch(() => alive && setState('denied'))
    return () => { alive = false }
  }, [])

  if (state === 'checking') {
    return (
      <div className="grid min-h-screen place-items-center text-slate-400">
        <Loader2 className="h-7 w-7 animate-spin text-brand-400" />
      </div>
    )
  }
  if (state === 'denied') return <Navigate to="/admin/login" replace />

  const logout = async () => {
    await adminSignOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-ink-900/60 p-5 md:flex">
        <div className="mb-8 flex items-center gap-2 px-1">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 text-white">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <div>
            <div className="text-sm font-bold text-white">CityLink</div>
            <div className="text-xs text-slate-500">Адмінпанель</div>
          </div>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive ? 'bg-brand-400/15 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'
                }`
              }
            >
              <n.icon className="h-4 w-4" /> {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 flex flex-col gap-1 border-t border-white/10 pt-4">
          <a href="#/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-400 hover:bg-white/5 hover:text-slate-100">
            <ExternalLink className="h-4 w-4" /> На сайт
          </a>
          <button onClick={logout} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-rose-300 hover:bg-rose-500/10">
            <LogOut className="h-4 w-4" /> Вийти
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between border-b border-white/10 bg-ink-900/60 px-5 py-3 md:hidden">
          <div className="flex items-center gap-2 text-sm font-bold text-white">
            <ShieldCheck className="h-5 w-5 text-brand-400" /> Адмінпанель
          </div>
          <button onClick={logout} className="text-sm text-rose-300">Вийти</button>
        </div>
        <div className="flex gap-1 overflow-x-auto border-b border-white/10 bg-ink-900/40 px-3 py-2 md:hidden">
          {nav.map((n) => (
            <NavLink key={n.to} to={n.to} end={n.end}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-1.5 text-sm ${isActive ? 'bg-brand-400/15 text-white' : 'text-slate-400'}`
              }
            >{n.label}</NavLink>
          ))}
        </div>

        <main className="flex-1 px-5 py-8 sm:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
