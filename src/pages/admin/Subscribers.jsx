import { useEffect, useMemo, useState } from 'react'
import {
  Plus, Pencil, Trash2, Loader2, AlertCircle, Search, Wallet, Wifi, History,
} from 'lucide-react'
import Modal from '../../components/Modal.jsx'
import {
  adminListSubscribers, adminListTariffs, adminUpsertSubscriber,
  adminAdjustBalance, adminDeleteSubscriber, adminListTransactions,
} from '../../lib/api.js'

const EMPTY = {
  id: null, contract: '', full_name: '', address: '', phone: '',
  tariff_id: '', status: 'active', ip_address: '', next_charge: '', password: '',
}
const STATUS = { active: 'Активний', blocked: 'Заблокований', suspended: 'Призупинений' }

export default function Subscribers() {
  const [list, setList] = useState([])
  const [tariffs, setTariffs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [q, setQ] = useState('')

  const [edit, setEdit] = useState(null)        // subscriber form or null
  const [isNew, setIsNew] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')

  const [balanceFor, setBalanceFor] = useState(null)   // subscriber or null
  const [txFor, setTxFor] = useState(null)             // subscriber or null

  const reload = async () => {
    setLoading(true)
    try {
      const [s, t] = await Promise.all([adminListSubscribers(), adminListTariffs()])
      setList(s); setTariffs(t)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }
  useEffect(() => { reload() }, [])

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return list
    return list.filter((s) =>
      s.full_name.toLowerCase().includes(term) ||
      s.contract.toLowerCase().includes(term) ||
      (s.ip_address || '').toLowerCase().includes(term))
  }, [list, q])

  const openNew = () => { setEdit({ ...EMPTY }); setIsNew(true); setFormError('') }
  const openEdit = (s) => {
    setEdit({
      id: s.id, contract: s.contract, full_name: s.full_name, address: s.address || '',
      phone: s.phone || '', tariff_id: s.tariff_id || '', status: s.status || 'active',
      ip_address: s.ip_address || '', next_charge: s.next_charge || '', password: '',
    })
    setIsNew(false); setFormError('')
  }

  const save = async (e) => {
    e.preventDefault()
    setFormError('')
    if (!edit.contract || !edit.full_name) { setFormError('Вкажіть номер договору та ПІБ.'); return }
    if (isNew && !edit.password) { setFormError('Задайте пароль для нового абонента.'); return }
    setSaving(true)
    try {
      await adminUpsertSubscriber(edit)
      setEdit(null)
      await reload()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const remove = async (s) => {
    if (!confirm(`Видалити абонента «${s.full_name}» (№${s.contract})? Дію не можна скасувати.`)) return
    try { await adminDeleteSubscriber(s.id); await reload() }
    catch (e) { alert(e.message) }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Абоненти</h1>
          <p className="mt-1 text-sm text-slate-400">{list.length} записів</p>
        </div>
        <button onClick={openNew} className="btn-primary"><Plus className="h-4 w-4" /> Додати абонента</button>
      </div>

      <div className="relative mt-5 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
        <input className="input pl-10" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Пошук: імʼя, договір або IP" />
      </div>

      {error && <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-400/30 bg-rose-400/10 p-4 text-rose-200"><AlertCircle className="h-5 w-5" /> {error}</div>}

      {loading ? (
        <div className="grid place-items-center py-24 text-slate-400"><Loader2 className="h-7 w-7 animate-spin text-brand-400" /></div>
      ) : (
        <div className="mt-5 card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-400">
                <th className="p-4 font-semibold">Договір</th>
                <th className="p-4 font-semibold">Абонент</th>
                <th className="p-4 font-semibold">Тариф</th>
                <th className="p-4 font-semibold">IP</th>
                <th className="p-4 text-right font-semibold">Баланс</th>
                <th className="p-4 font-semibold">Статус</th>
                <th className="p-4 text-right font-semibold">Дії</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="p-4 font-mono text-slate-300">{s.contract}</td>
                  <td className="p-4">
                    <div className="text-slate-100">{s.full_name}</div>
                    <div className="text-xs text-slate-500">{s.address}</div>
                  </td>
                  <td className="p-4 text-slate-300">{tariffs.find((t) => t.id === s.tariff_id)?.name || '—'}</td>
                  <td className="p-4 font-mono text-xs text-slate-400">{s.ip_address || '—'}</td>
                  <td className={`p-4 text-right font-semibold ${Number(s.balance) < 0 ? 'text-rose-300' : 'text-slate-200'}`}>{Number(s.balance)} грн</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      s.status === 'active' ? 'bg-emerald-500/15 text-emerald-300'
                      : s.status === 'blocked' ? 'bg-rose-500/15 text-rose-300'
                      : 'bg-amber-500/15 text-amber-300'
                    }`}>{STATUS[s.status] || s.status}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-end gap-1">
                      <button title="Нарахування" onClick={() => setBalanceFor(s)} className="rounded-lg p-2 text-brand-300 hover:bg-white/5"><Wallet className="h-4 w-4" /></button>
                      <button title="Історія" onClick={() => setTxFor(s)} className="rounded-lg p-2 text-slate-300 hover:bg-white/5"><History className="h-4 w-4" /></button>
                      <button title="Редагувати" onClick={() => openEdit(s)} className="rounded-lg p-2 text-slate-300 hover:bg-white/5"><Pencil className="h-4 w-4" /></button>
                      <button title="Видалити" onClick={() => remove(s)} className="rounded-lg p-2 text-rose-300 hover:bg-rose-500/10"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-slate-500">Нічого не знайдено</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / edit subscriber */}
      <Modal open={!!edit} onClose={() => setEdit(null)} title={isNew ? 'Новий абонент' : 'Редагувати абонента'} maxWidth="max-w-xl">
        {edit && (
          <form onSubmit={save} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Номер договору</label>
                <input className="input" value={edit.contract} onChange={(e) => setEdit({ ...edit, contract: e.target.value })} placeholder="1042" />
              </div>
              <div>
                <label className="label">ПІБ</label>
                <input className="input" value={edit.full_name} onChange={(e) => setEdit({ ...edit, full_name: e.target.value })} placeholder="Іван Коваль" />
              </div>
            </div>
            <div>
              <label className="label">Адреса</label>
              <input className="input" value={edit.address} onChange={(e) => setEdit({ ...edit, address: e.target.value })} placeholder="м. Глухів, вул. ..." />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Телефон</label>
                <input className="input" value={edit.phone} onChange={(e) => setEdit({ ...edit, phone: e.target.value })} placeholder="+380..." />
              </div>
              <div>
                <label className="label">Тариф</label>
                <select className="input" value={edit.tariff_id} onChange={(e) => setEdit({ ...edit, tariff_id: e.target.value })}>
                  <option value="">— без тарифу —</option>
                  {tariffs.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.price} грн)</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label flex items-center gap-1.5"><Wifi className="h-3.5 w-3.5" /> IP-адреса (для входу за IP)</label>
                <input className="input font-mono" value={edit.ip_address} onChange={(e) => setEdit({ ...edit, ip_address: e.target.value })} placeholder="178.151.x.x" />
              </div>
              <div>
                <label className="label">Статус</label>
                <select className="input" value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>
                  {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Наступне списання</label>
                <input type="date" className="input" value={edit.next_charge || ''} onChange={(e) => setEdit({ ...edit, next_charge: e.target.value })} />
              </div>
              <div>
                <label className="label">{isNew ? 'Пароль' : 'Новий пароль (необовʼязково)'}</label>
                <input type="text" className="input" value={edit.password} onChange={(e) => setEdit({ ...edit, password: e.target.value })} placeholder={isNew ? 'пароль для входу' : 'лишіть порожнім'} />
              </div>
            </div>
            {formError && <p className="text-sm text-rose-400">{formError}</p>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={() => setEdit(null)} className="btn-ghost flex-1">Скасувати</button>
              <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-70">
                {saving ? (<><Loader2 className="h-4 w-4 animate-spin" /> Збереження…</>) : 'Зберегти'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Balance adjustment */}
      <BalanceModal subscriber={balanceFor} onClose={() => setBalanceFor(null)} onDone={reload} />

      {/* Transactions */}
      <TxModal subscriber={txFor} onClose={() => setTxFor(null)} />
    </div>
  )
}

function BalanceModal({ subscriber, onClose, onDone }) {
  const [amount, setAmount] = useState('')
  const [sign, setSign] = useState('+')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { setAmount(''); setSign('+'); setNote(''); setError('') }, [subscriber])

  const submit = async (e) => {
    e.preventDefault()
    const val = Number(amount)
    if (!val || val <= 0) { setError('Введіть суму більше 0.'); return }
    setSaving(true)
    try {
      await adminAdjustBalance(subscriber.id, sign === '+' ? val : -val, note, 'Адмін')
      onClose(); onDone()
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  return (
    <Modal open={!!subscriber} onClose={onClose} title="Нарахування коштів">
      {subscriber && (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-slate-400">
            Абонент <b className="text-white">{subscriber.full_name}</b> (№{subscriber.contract}). Поточний баланс:{' '}
            <b className={Number(subscriber.balance) < 0 ? 'text-rose-300' : 'text-white'}>{Number(subscriber.balance)} грн</b>.
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={() => setSign('+')} className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold ${sign === '+' ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-200' : 'border-white/10 text-slate-300'}`}>+ Нарахувати</button>
            <button type="button" onClick={() => setSign('-')} className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold ${sign === '-' ? 'border-rose-400/50 bg-rose-400/10 text-rose-200' : 'border-white/10 text-slate-300'}`}>− Списати</button>
          </div>
          <div>
            <label className="label">Сума, грн</label>
            <input className="input" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} placeholder="240" />
          </div>
          <div>
            <label className="label">Коментар (необовʼязково)</label>
            <input className="input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Поповнення через касу" />
          </div>
          {error && <p className="text-sm text-rose-400">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">Скасувати</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 disabled:opacity-70">
              {saving ? (<><Loader2 className="h-4 w-4 animate-spin" /> …</>) : 'Підтвердити'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}

function TxModal({ subscriber, onClose }) {
  const [tx, setTx] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!subscriber) return
    setLoading(true)
    adminListTransactions(subscriber.id)
      .then(setTx)
      .catch(() => setTx([]))
      .finally(() => setLoading(false))
  }, [subscriber])

  return (
    <Modal open={!!subscriber} onClose={onClose} title={`Історія — ${subscriber?.full_name || ''}`} maxWidth="max-w-xl">
      {loading ? (
        <div className="grid place-items-center py-12 text-slate-400"><Loader2 className="h-6 w-6 animate-spin text-brand-400" /></div>
      ) : tx.length === 0 ? (
        <p className="py-8 text-center text-slate-500">Операцій ще немає</p>
      ) : (
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
            {tx.map((p, i) => {
              const income = String(p.type).startsWith('Поповнення')
              return (
                <tr key={i} className="border-b border-white/5">
                  <td className="py-2.5 pr-4 text-slate-400">{new Date(p.created_at).toLocaleDateString('uk-UA')}</td>
                  <td className="py-2.5 pr-4 text-slate-200">{p.type}</td>
                  <td className="py-2.5 pr-4 text-slate-400">{p.method}</td>
                  <td className={`py-2.5 text-right font-semibold ${income ? 'text-emerald-300' : 'text-slate-300'}`}>{income ? '+' : '−'}{Number(p.amount)} грн</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </Modal>
  )
}
