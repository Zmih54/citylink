import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Loader2, AlertCircle, Star } from 'lucide-react'
import Modal from '../../components/Modal.jsx'
import { adminListTariffs, adminUpsertTariff, adminDeleteTariff } from '../../lib/api.js'

const EMPTY = { id: '', name: '', tagline: '', speed: '', price: '', popular: false, sort_order: 0, active: true, features: '' }

export default function Tariffs() {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(null)   // form object or null
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const reload = async () => {
    setLoading(true)
    try { setList(await adminListTariffs()) }
    catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { reload() }, [])

  const openNew = () => { setEditing({ ...EMPTY }); setIsNew(true); setFormError('') }
  const openEdit = (t) => {
    setEditing({ ...t, features: (t.features || []).join('\n') })
    setIsNew(false); setFormError('')
  }

  const save = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!editing.id || !editing.name) { setFormError('Вкажіть ID та назву тарифу.'); return }
    setSaving(true)
    try {
      await adminUpsertTariff({
        ...editing,
        features: String(editing.features || '').split('\n').map((s) => s.trim()).filter(Boolean),
      })
      setEditing(null)
      await reload()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (t) => {
    if (!confirm(`Видалити тариф «${t.name}»? Абонентів на цьому тарифі буде відвʼязано.`)) return
    try { await adminDeleteTariff(t.id); await reload() }
    catch (e) { alert(e.message) }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Тарифи</h1>
          <p className="mt-1 text-sm text-slate-400">Зміни одразу відображаються на публічному сайті</p>
        </div>
        <button onClick={openNew} className="btn-primary"><Plus className="h-4 w-4" /> Додати</button>
      </div>

      {error && <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-rose-200"><AlertCircle className="h-5 w-5" /> {error}</div>}

      {loading ? (
        <div className="grid place-items-center py-24 text-slate-400"><Loader2 className="h-7 w-7 animate-spin text-brand-400" /></div>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <div key={t.id} className="card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">{t.name}</h3>
                    {t.popular && <span className="chip"><Star className="h-3 w-3" /> Популярний</span>}
                  </div>
                  <p className="text-sm text-slate-400">{t.tagline}</p>
                </div>
                {!t.active && <span className="rounded-full bg-slate-500/20 px-2 py-0.5 text-xs text-slate-400">прихований</span>}
              </div>
              <div className="mt-4 flex items-end gap-2">
                <span className="text-3xl font-extrabold text-white">{t.price}</span>
                <span className="mb-1 text-sm text-slate-400">грн/міс · {t.speed} Мбіт/с</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={() => openEdit(t)} className="btn-ghost flex-1 py-2"><Pencil className="h-4 w-4" /> Змінити</button>
                <button onClick={() => remove(t)} className="btn-ghost px-3 py-2 text-rose-300 hover:text-rose-200"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editing} onClose={() => setEditing(null)} title={isNew ? 'Новий тариф' : 'Редагувати тариф'}>
        {editing && (
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">ID (латиницею)</label>
                <input className="input" value={editing.id} disabled={!isNew}
                  onChange={(e) => setEditing({ ...editing, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  placeholder="turbo" />
              </div>
              <div>
                <label className="label">Назва</label>
                <input className="input" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="TURBO" />
              </div>
            </div>
            <div>
              <label className="label">Підзаголовок</label>
              <input className="input" value={editing.tagline} onChange={(e) => setEditing({ ...editing, tagline: e.target.value })} placeholder="Для геймінгу та 4K" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="label">Швидкість (Мбіт/с)</label>
                <input className="input" inputMode="numeric" value={editing.speed} onChange={(e) => setEditing({ ...editing, speed: e.target.value.replace(/\D/g, '') })} />
              </div>
              <div>
                <label className="label">Ціна (грн/міс)</label>
                <input className="input" inputMode="numeric" value={editing.price} onChange={(e) => setEditing({ ...editing, price: e.target.value.replace(/\D/g, '') })} />
              </div>
              <div>
                <label className="label">Порядок</label>
                <input className="input" inputMode="numeric" value={editing.sort_order} onChange={(e) => setEditing({ ...editing, sort_order: e.target.value.replace(/\D/g, '') })} />
              </div>
            </div>
            <div>
              <label className="label">Переваги (по одній на рядок)</label>
              <textarea className="input min-h-[90px]" value={editing.features} onChange={(e) => setEditing({ ...editing, features: e.target.value })} placeholder={'Симетрична швидкість\nМодем в оренду'} />
            </div>
            <div className="flex gap-5">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={editing.popular} onChange={(e) => setEditing({ ...editing, popular: e.target.checked })} /> Популярний
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input type="checkbox" checked={editing.active} onChange={(e) => setEditing({ ...editing, active: e.target.checked })} /> Показувати на сайті
              </label>
            </div>
            {formError && <p className="text-sm text-rose-400">{formError}</p>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEditing(null)} className="btn-ghost flex-1">Скасувати</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-70">
                {saving ? (<><Loader2 className="h-4 w-4 animate-spin" /> Збереження…</>) : 'Зберегти'}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
