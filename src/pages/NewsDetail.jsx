import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, CalendarDays, User } from 'lucide-react'
import { Reveal } from '../components/ui.jsx'
import { news } from '../data/site.js'

export default function NewsDetail() {
  const { id } = useParams()
  const post = news.find((n) => String(n.id) === String(id))

  if (!post) {
    return (
      <div className="container-px py-24 text-center">
        <h1 className="text-2xl font-bold text-white">Новину не знайдено</h1>
        <Link to="/news" className="btn-ghost mt-6">До всіх новин</Link>
      </div>
    )
  }

  const others = news.filter((n) => n.id !== post.id).slice(0, 3)

  return (
    <article className="container-px py-14">
      <Link to="/news" className="link-muted inline-flex items-center gap-1 text-sm font-semibold">
        <ArrowLeft className="h-4 w-4" /> До всіх новин
      </Link>

      <Reveal>
        <div className="mx-auto mt-6 max-w-3xl">
          <span className="chip">{post.tag}</span>
          <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{post.title}</h1>
          <div className="mt-4 flex items-center gap-5 text-sm text-slate-400">
            <span className="inline-flex items-center gap-1.5"><CalendarDays className="h-4 w-4" /> {new Date(post.date).toLocaleDateString('uk-UA')}</span>
            <span className="inline-flex items-center gap-1.5"><User className="h-4 w-4" /> {post.author}</span>
          </div>
          <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-brand-600/15 to-accent-600/15 p-8">
            <p className="text-lg leading-relaxed text-slate-200">{post.body}</p>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/rates" className="btn-ghost">Переглянути тарифи</Link>
            <Link to="/connection" className="btn-primary">Залишити заявку</Link>
          </div>
        </div>
      </Reveal>

      {others.length > 0 && (
        <div className="mx-auto mt-16 max-w-5xl">
          <h2 className="mb-6 text-xl font-bold text-white">Інші новини</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {others.map((n) => (
              <Link key={n.id} to={`/news/${n.id}`} className="card group block h-full p-6 transition hover:-translate-y-1 hover:border-brand-400/30">
                <span className="chip">{n.tag}</span>
                <h3 className="mt-3 text-base font-bold text-white group-hover:text-brand-200">{n.title}</h3>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-300">
                  Читати <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
