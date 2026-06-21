import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Lock, Mail, LogIn, Loader2, ShieldAlert } from 'lucide-react'
import { hasSupabase } from '../../lib/supabase.js'
import { adminSignIn } from '../../lib/api.js'

export default function AdminLogin() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await adminSignIn(email.trim(), password)
      navigate('/admin', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center px-5">
      <form onSubmit={submit} className="card w-full max-w-md p-8">
        <div className="mb-6 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-500 text-white shadow-glow">
            <ShieldCheck className="h-7 w-7" />
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-white">Адмінпанель CityLink</h1>
          <p className="mt-1 text-sm text-slate-400">Вхід лише для адміністраторів</p>
        </div>

        {!hasSupabase && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-200">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <span>Бекенд ще не підключено. Адмінка запрацює після налаштування Supabase.</span>
          </div>
        )}

        <label className="label">Email</label>
        <div className="relative mb-4">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input type="email" className="input pl-10" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@cl.in.ua" />
        </div>
        <label className="label">Пароль</label>
        <div className="relative mb-2">
          <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input type="password" className="input pl-10" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
        </div>
        {error && <p className="mb-2 text-sm text-rose-400">{error}</p>}
        <button type="submit" disabled={loading} className="btn-primary mt-4 w-full disabled:opacity-70">
          {loading ? (<><Loader2 className="h-4 w-4 animate-spin" /> Вхід…</>) : (<><LogIn className="h-4 w-4" /> Увійти</>)}
        </button>

        <a href="#/" className="mt-5 block text-center text-sm link-muted">← На сайт</a>
      </form>
    </div>
  )
}
