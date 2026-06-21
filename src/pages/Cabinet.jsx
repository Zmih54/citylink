import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  User, Lock, LogIn, LogOut, Wallet, Gauge, Calendar, MapPin,
  Loader2, Info, CreditCard, Wifi, ShieldAlert,
} from 'lucide-react'
import { PageHero, Reveal } from '../components/ui.jsx'
import { hasSupabase } from '../lib/supabase.js'
import { subscriberLogin, subscriberIpLogin, subscriberMe } from '../lib/api.js'

const TOKEN_KEY = 'citylink-subscriber-token'

export default function Cabinet() {
  const [account, setAccount] = useState(null)
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [booting, setBooting] = useState(true)     // restoring session / trying IP login
  const [ipTrying, setIpTrying] = useState(false)

  // On open: restore a saved session, otherwise silently try IP-based login.
  useEffect(() => {
    let alive = true
    ;(async () => {
      if (!hasSupabase) { setBooting(false); return }
      const token = localStorage.getItem(TOKEN_KEY)
      if (token) {
        try {
          const sub = await subscriberMe(token)
          if (alive) setAccount(sub)
        } catch {
          localStorage.removeItem(TOKEN_KEY)
        }
      } else {
        // Auto-login if this connection's IP belongs to an active subscriber.
        try {
          const { token: t, subscriber } = await subscriberIpLogin()
          localStorage.setItem(TOKEN_KEY, t)
          if (alive) setAccount(subscriber)
        } catch {
          /* IP not recognised — show the login form */
        }
      }
      if (alive) setBooting(false)
    })()
    return () => { alive = false }
  }, [])

  const doLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { token, subscriber } = await subscriberLogin(login.trim(), password)
      localStorage.setItem(TOKEN_KEY, token)
      setAccount(subscriber)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const doIpLogin = async () => {
    setError('')
    setIpTrying(true)
    try {
      const { token, subscriber } = await subscriberIpLogin()
      localStorage.setItem(TOKEN_KEY, token)
      setAccount(subscriber)
    } catch (err) {
      setError(err.message)
    } finally {
      setIpTrying(false)
    }
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setAccount(null)
    setLogin('')
    setPassword('')
  }

  if (booting) {
    return (
      <section className="container-px py-24">
        <div className="flex flex-col items-center gap-3 text-slate-400">
          <Loader2 className="h-7 w-7 animate-spin text-brand-400" />
          <p>Перевіряємо вашу IP-адресу…</p>
        </div>
      </section>
    )
  }

  // ---- Not logged in: login form -----------------------------------------
  if (!account) {
    return (
      <>
        <PageHero eyebrow="Особистий кабінет" title="Вхід до кабінету" subtitle="Керуйте рахунком, переглядайте баланс, історію платежів та поповнюйте рахунок онлайн." />
        <section className="container-px py-14">
          <Reveal className="mx-auto max-w-md">
            <form onSubmit={doLogin} className="card p-8">
              <div className="mb-6 text-center">
                <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow">
                  <User className="h-7 w-7" />
                </span>
              </div>

              {!hasSupabase && (
                <div className="mb-5 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>Бекенд ще не підключено. Кабінет запрацює після налаштування Supabase.</span>
                </div>
              )}

              <label className="label">Логін (номер договору)</label>
              <div className="relative mb-4">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input className="input pl-10" value={login} onChange={(e) => setLogin(e.target.value)} placeholder="1001" />
              </div>
              <label className="label">Пароль</label>
              <div className="relative mb-2">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                <input type="password" className="input pl-10" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••" />
              </div>
              {error && <p className="mb-2 text-sm text-rose-400">{error}</p>}
              <button type="submit" disabled={loading} className="btn-primary mt-4 w-full disabled:opacity-70">
                {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Вхід…</>) : (<><LogIn className="h-4 w-4" /> Увійти</>)}
              </button>

              <div className="my-5 flex items-center gap-3 text-xs uppercase tracking-wider text-slate-500">
                <span className="h-px flex-1 bg-white/10" /> або <span className="h-px flex-1 bg-white/10" />
              </div>

              <button type="button" onClick={doIpLogin} disabled={ipTrying} className="btn-ghost w-full disabled:opacity-70">
                {ipTrying ? (<><Loader2 className="h-4 w-4 animate-spin" /> Перевірка IP…</>) : (<><Wifi className="h-4 w-4" /> Увійти за IP-адресою</>)}
              </button>

              <div className="mt-5 rounded-xl border border-brand-400/20 bg-brand-400/5 p-4 text-sm text-slate-300">
                <div className="flex items-center gap-2 font-semibold text-brand-200"><Info className="h-4 w-4" /> Вхід за IP</div>
                <p className="mt-1">Якщо ви підключені через свою мережу CityLink зі статичною IP-адресою — вхід відбудеться автоматично, без пароля.</p>
              </div>
            </form>
          </Reveal>
        </section>
      </>
    )
  }

  // ---- Logged in: dashboard ----------------------------------------------
  const monthlyFee = account.tariff?.price || 0
  const speed = account.tariff?.speed || 0
  const tariffName = account.tariff?.name || '—'
  const monthsLeft = monthlyFee > 0 ? Math.floor(account.balance / monthlyFee) : 0

  return (
    <section className="container-px py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Вітаємо, {account.full_name.split(' ')[0]}!</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-400"><MapPin className="h-4 w-4" /> {account.address}</p>
        </div>
        <button onClick={logout} className="btn-ghost"><LogOut className="h-4 w-4" /> Вийти</button>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Balance */}
        <Reveal>
          <div className="card p-7">
            <div className="flex items-center gap-2 text-sm text-slate-400"><Wallet className="h-4 w-4 text-brand-400" /> Баланс</div>
            <div className="mt-2 text-4xl font-extrabold text-white">{Number(account.balance)} <span className="text-lg">грн</span></div>
            <p className="mt-2 text-sm text-slate-400">Вистачить приблизно на <b className="text-brand-200">{monthsLeft} міс</b> користування.</p>
            <span className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
              account.status === 'active' ? 'bg-emerald-500/15 text-emerald-300' : 'bg-rose-500/15 text-rose-300'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${account.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
              {account.status === 'active' ? 'Активний' : account.status === 'blocked' ? 'Заблокований' : 'Призупинений'}
            </span>
          </div>
        </Reveal>

        {/* Tariff */}
        <Reveal delay={80}>
          <div className="card p-7">
            <div className="flex items-center gap-2 text-sm text-slate-400"><Gauge className="h-4 w-4 text-brand-400" /> Тариф</div>
            <div className="mt-2 text-2xl font-extrabold text-white">{tariffName}</div>
            <p className="text-sm text-slate-400">до {speed} Мбіт/с · {monthlyFee} грн/міс</p>
            <Link to="/rates" className="btn-ghost mt-4 w-full">Змінити тариф</Link>
          </div>
        </Reveal>

        {/* Next charge */}
        <Reveal delay={160}>
          <div className="card p-7">
            <div className="flex items-center gap-2 text-sm text-slate-400"><Calendar className="h-4 w-4 text-brand-400" /> Наступне списання</div>
            <div className="mt-2 text-2xl font-extrabold text-white">
              {account.next_charge ? new Date(account.next_charge).toLocaleDateString('uk-UA') : '—'}
            </div>
            <p className="text-sm text-slate-400">Договір №{account.contract}</p>
          </div>
        </Reveal>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Top up → Privat24 */}
        <Reveal className="lg:col-span-1">
          <div className="card p-7">
            <div className="flex items-center gap-2 font-bold text-white"><CreditCard className="h-5 w-5 text-brand-400" /> Поповнити рахунок</div>
            <p className="mt-1 text-sm text-slate-400">Оплата через ПриватБанк за номером договору <b className="text-white">{account.contract}</b>.</p>
            <Link to="/payment" className="btn-primary mt-4 w-full">Перейти до оплати</Link>
            <p className="mt-3 text-xs text-slate-500">Після оплати кошти зараховуються оператором — баланс оновиться протягом кількох хвилин.</p>
          </div>
        </Reveal>

        {/* History */}
        <Reveal delay={80} className="lg:col-span-2">
          <div className="card p-7">
            <div className="font-bold text-white">Історія операцій</div>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-400">
                    <th className="pb-3 pr-4 font-semibold">Дата</th>
                    <th className="pb-3 pr-4 font-semibold">Операція</th>
                    <th className="pb-3 pr-4 font-semibold">Спосіб</th>
                    <th className="pb-3 text-right font-semibold">Сума</th>
                  </tr>
                </thead>
                <tbody>
                  {account.transactions.length === 0 && (
                    <tr><td colSpan={4} className="py-6 text-center text-slate-500">Операцій ще немає</td></tr>
                  )}
                  {account.transactions.map((p, i) => {
                    const income = String(p.type).startsWith('Поповнення')
                    return (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-3 pr-4 text-slate-400">{new Date(p.created_at).toLocaleDateString('uk-UA')}</td>
                        <td className="py-3 pr-4 text-slate-200">{p.type}</td>
                        <td className="py-3 pr-4 text-slate-400">{p.method}</td>
                        <td className={`py-3 text-right font-semibold ${income ? 'text-emerald-300' : 'text-slate-300'}`}>
                          {income ? '+' : '−'}{Number(p.amount)} грн
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
