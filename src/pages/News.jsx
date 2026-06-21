import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ArrowRight, CalendarDays } from 'lucide-react'
import { PageHero, Reveal } from '../components/ui.jsx'
import { news } from '../data/site.js'

export default function News() {
  const [query, setQuery] = useState('')
  const [tag, setTag] = useState('Усі')

  const tags = useMemo(() => ['Усі', ...Array.from(new Set(news.map((n) => n.tag)))], [])

  const filtered = useMemo(() => {
    return news.filter((n) => {
      const matchTag = tag === 'Усі' || n.tag === tag
      const q = query.trim().toLowerCase()
      const matchQuery = !q || n.title.toLowerCase().includes(q) || n.excerpt.toLowerCase().includes(q)
      return matchTag && matchQuery
    })
  }, [query, tag])

  return (
    <>
      <PageHero eyebrow="Новини" title="Новини та оголошення" subtitle="Зміни в тарифах, нові способи оплати та розвиток мережі CityLink." />

      <section className="container-px py-14">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Пошук новин…"
              className="input pl-10"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <button
                key={t}
                onClick={() => setTag(t)}
                className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition ${
                  tag === t ? 'border-brand-400/60 bg-brand-400/10 text-white' : 'border-white/10 bg-white/5 text-slate-300 hover:border-white/20'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="card p-12 text-center text-slate-400">Нічого не знайдено за вашим запитом.</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((n, i) => (
              <Reveal key={n.id} delay={(i % 3) * 80}>
                <Link to={`/news/${n.id}`} className="card group flex h-full flex-col p-6 transition hover:-translate-y-1 hover:border-brand-400/30">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="chip">{n.tag}</span>
                    <span className="inline-flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" /> {new Date(n.date).toLocaleDateString('uk-UA')}
                    </span>
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white group-hover:text-brand-200">{n.title}</h3>
                  <p className="mt-2 line-clamp-3 flex-1 text-sm text-slate-400">{n.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand-300">
                    Читати далі <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
