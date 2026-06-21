import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, UserCheck, Wallet, Gauge, Loader2, AlertCircle } from 'lucide-react'
import { adminListSubscribers, adminListTariffs } from '../../lib/api.js'

function Stat({ icon: Icon, label, value, accent }) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Icon className={`h-4 w-4 ${accent || 'text-brand-400'}`} /> {label}
      </div>
      <div className="mt-2 text-3xl font-extrabold text-white">{value}</div>
    </div>
  )
}

export default function Dashboard() {
  const [subs, setSubs] = useState([])
  const [tariffs, setTariffs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const [s, t] = await Promise.all([adminListSubscribers(), adminListTariffs()])
        setSubs(s); setTariffs(t)
      } catch (e) {
        setError(e.message || 'Помилка завантаження')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading) {
    return <div className="grid place-items-center py-24 text-slate-400"><Loader2 className="h-7 w-7 animate-spin text-brand-400" /></div>
  }
  if (error) {
    return <div className="flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-rose-200"><AlertCircle className="h-5 w-5" /> {error}</div>
  }

  const active = subs.filter((s) => s.status === 'active').length
  const totalBalance = subs.reduce((a, s) => a + Number(s.balance || 0), 0)

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-white">Дашборд</h1>
      <p className="mt-1 text-sm text-slate-400">Загальний огляд провайдера</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat icon={Users} label="Абонентів" value={subs.length} />
        <Stat icon={UserCheck} label="Активних" value={active} accent="text-emerald-400" />
        <Stat icon={Wallet} label="Сумарний баланс" value={`${totalBalance.toLocaleString('uk-UA')} грн`} />
        <Stat icon={Gauge} label="Тарифів" value={tariffs.length} />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white">Останні абоненти</h2>
            <Link to="/admin/subscribers" className="text-sm link-muted">Усі →</Link>
          </div>
          <ul className="mt-4 divide-y divide-white/5">
            {subs.slice(0, 6).map((s) => (
              <li key={s.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-slate-200">{s.full_name} <span className="text-slate-500">№{s.contract}</span></span>
                <span className={Number(s.balance) < 0 ? 'text-rose-300' : 'text-slate-300'}>{Number(s.balance)} грн</span>
              </li>
            ))}
            {subs.length === 0 && <li className="py-4 text-sm text-slate-500">Абонентів ще немає</li>}
          </ul>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-white">Тарифи</h2>
            <Link to="/admin/tariffs" className="text-sm link-muted">Керувати →</Link>
          </div>
          <ul className="mt-4 divide-y divide-white/5">
            {tariffs.map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2.5 text-sm">
                <span className="text-slate-200">{t.name} <span className="text-slate-500">· {t.speed} Мбіт/с</span></span>
                <span className="font-semibold text-white">{t.price} грн/міс</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
