import { Link } from 'react-router-dom'
import { Home, WifiOff } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container-px flex min-h-[60vh] flex-col items-center justify-center py-24 text-center">
      <span className="grid h-20 w-20 place-items-center rounded-3xl bg-brand-500/15 text-brand-300">
        <WifiOff className="h-10 w-10" />
      </span>
      <h1 className="mt-6 text-6xl font-black text-white">404</h1>
      <p className="mt-2 max-w-md text-slate-400">Схоже, цю сторінку не вдалося завантажити. Перевірте адресу або поверніться на головну.</p>
      <Link to="/" className="btn-primary mt-7"><Home className="h-4 w-4" /> На головну</Link>
    </div>
  )
}
