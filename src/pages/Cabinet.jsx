import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  User, Lock, LogIn, LogOut, Wallet, Gauge, Calendar, MapPin,
  CheckCircle2, Plus, Loader2, Info, CreditCard,
} from 'lucide-react'
import { PageHero, Reveal } from '../components/ui.jsx'
import { demoAccount } from '../data/site.js'

export default function Cabinet() {
  const [auth, setAuth] = useState(false)
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // local mutable copy so top-up updates the balance/history live
  const [account, setAccount] = useState(demoAccount)
  const [topup, setTopup] = useState('')
  const [toast, setToast] = useState('')

  const doLogin = (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      if (login.trim() === demoAccount.login && password === demoAccount.password) {
        setAuth(true)
      } else {
        setError('Невірний логін або пароль. Скористайтесь демо-доступом нижче.')
      }
    }, 700)
  }

  const fillDemo = () => {
    setLogin(demoAccount.login)
    setPassword(demoAccount.password)
  }

  const addFunds = (e) => {
    e.preventDefault()
    const amount = parseInt(topup, 10)
    if (!amount || amount <= 0) return
    setAccount((a) => ({
      ...a,
      balance: a.balance + amount,
      payments: [
        { date: new Date().toISOString().slice(0, 10), amount, method: 'Картка Visa', type: 'Поповнення' },
        ...a.payments,
      ],
    }))
    setTopup('')
    setToast(`Рахунок поповнено на ${amount} грн`)
    setTimeout(() => setToast(''), 3000)
  }

  const monthsLeft = account.monthlyFee > 0 ? Math.floor(account.balance / account.monthlyFee) : 0

  if (!auth) {
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

              <div className="mt-5 rounded-xl border border-brand-400/20 bg-brand-400/5 p-4 text-sm text-slate-300">
                <div className="flex items-center gap-2 font-semibold text-brand-200"><Info className="h-4 w-4" /> Демо-доступ</div>
                <p className="mt-1">Логін <b className="text-white">1001</b>, пароль <b className="text-white">demo</b>.</p>
                <button type="button" onClick={fillDemo} className="mt-2 text-sm font-semibold text-brand-300 hover:text-brand-200">Заповнити автоматично →</button>
              </div>
            </form>
          </Reveal>
        </section>
      </>
    )
  }

  return (
    <section className="container-px py-12">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">Вітаємо, {account.name.split(' ')[0]}!</h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-slate-400"><MapPin className="h-4 w-4" /> {account.address}</p>
        </div>
        <button onClick={() => setAuth(false)} className="btn-ghost"><LogOut className="h-4 w-4" /> Вийти</button>
      </div>

      {toast && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-brand-400/30 bg-brand-400/10 p-4 text-sm text-brand-100">
          <CheckCircle2 className="h-4 w-4" /> {toast}
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        {/* Balance */}
        <Reveal>
          <div className="card p-7">
            <div className="flex items-center gap-2 text-sm text-slate-400"><Wallet className="h-4 w-4 text-brand-400" /> Баланс</div>
            <div className="mt-2 text-4xl font-extrabold text-white">{account.balance} <span className="text-lg">грн</span></div>
            <p className="mt-2 text-sm text-slate-400">Вистачить приблизно на <b className="text-brand-200">{monthsLeft} міс</b> користування.</p>
            <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> Активний
            </span>
          </div>
        </Reveal>

        {/* Tariff */}
        <Reveal delay={80}>
          <div className="card p-7">
            <div className="flex items-center gap-2 text-sm text-slate-400"><Gauge className="h-4 w-4 text-brand-400" /> Тариф</div>
            <div className="mt-2 text-2xl font-extrabold text-white">{account.tariff}</div>
            <p className="text-sm text-slate-400">до {account.speed} Мбіт/с · {account.monthlyFee} грн/міс</p>
            <Link to="/rates" className="btn-ghost mt-4 w-full">Змінити тариф</Link>
          </div>
        </Reveal>

        {/* Next charge */}
        <Reveal delay={160}>
          <div className="card p-7">
            <div className="flex items-center gap-2 text-sm text-slate-400"><Calendar className="h-4 w-4 text-brand-400" /> Наступне списання</div>
            <div className="mt-2 text-2xl font-extrabold text-white">{new Date(account.nextCharge).toLocaleDateString('uk-UA')}</div>
            <p className="text-sm text-slate-400">Договір №{account.contract}</p>
          </div>
        </Reveal>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Top up */}
        <Reveal className="lg:col-span-1">
          <form onSubmit={addFunds} className="card p-7">
            <div className="flex items-center gap-2 font-bold text-white"><CreditCard className="h-5 w-5 text-brand-400" /> Поповнити рахунок</div>
            <p className="mt-1 text-sm text-slate-400">Демонстрація онлайн-оплати карткою.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[100, 240, 500, 1000].map((a) => (
                <button type="button" key={a} onClick={() => setTopup(String(a))} className={`rounded-xl border px-3.5 py-2 text-sm font-semibold transition ${
                  topup === String(a) ? 'border-brand-400/60 bg-brand-400/10 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                }`}>{a} грн</button>
              ))}
            </div>
            <input className="input mt-3" inputMode="numeric" value={topup} onChange={(e) => setTopup(e.target.value.replace(/\D/g, ''))} placeholder="Інша сума, грн" />
            <button type="submit" className="btn-primary mt-4 w-full"><Plus className="h-4 w-4" /> Поповнити</button>
          </form>
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
                  {account.payments.map((p, i) => {
                    const income = p.type === 'Поповнення'
                    return (
                      <tr key={i} className="border-b border-white/5">
                        <td className="py-3 pr-4 text-slate-400">{new Date(p.date).toLocaleDateString('uk-UA')}</td>
                        <td className="py-3 pr-4 text-slate-200">{p.type}</td>
                        <td className="py-3 pr-4 text-slate-400">{p.method}</td>
                        <td className={`py-3 text-right font-semibold ${income ? 'text-emerald-300' : 'text-slate-300'}`}>
                          {income ? '+' : '−'}{p.amount} грн
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
