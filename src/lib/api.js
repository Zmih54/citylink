// Thin API layer over Supabase: Edge Functions for subscribers, RLS-guarded
// tables + RPC for admins, anon SELECT for public tariffs.
import { supabase, hasSupabase, SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase.js'

const ERROR_UA = {
  invalid_credentials: 'Невірний логін або пароль.',
  missing_credentials: 'Введіть логін і пароль.',
  ip_not_recognized: 'Цю IP-адресу не закріплено за жодним активним абонентом. Увійдіть за логіном і паролем.',
  no_ip: 'Не вдалося визначити вашу IP-адресу.',
  invalid_session: 'Сесія недійсна. Увійдіть знову.',
  expired_session: 'Сесія завершилася. Увійдіть знову.',
  server_error: 'Помилка сервера. Спробуйте пізніше.',
}
export const errUA = (code) => ERROR_UA[code] || 'Сталася помилка. Спробуйте ще раз.'

// ---- Edge Functions (subscriber side) -----------------------------------

async function callFn(name, body) {
  if (!hasSupabase) throw new Error('backend_unavailable')
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body || {}),
  })
  const data = await res.json().catch(() => ({}))
  return { ok: res.ok, status: res.status, data }
}

export async function subscriberLogin(contract, password) {
  const { ok, data } = await callFn('subscriber-login', { contract, password })
  if (!ok || data.error) throw new Error(errUA(data.error))
  return data // { token, subscriber }
}

export async function subscriberIpLogin() {
  const { ok, data } = await callFn('subscriber-ip-login', {})
  if (!ok || data.error) {
    const e = new Error(errUA(data.error))
    e.code = data.error
    throw e
  }
  return data // { token, subscriber, ip }
}

export async function subscriberMe(token) {
  const { ok, data } = await callFn('subscriber-me', { token })
  if (!ok || data.error) {
    const e = new Error(errUA(data.error))
    e.code = data.error
    throw e
  }
  return data.subscriber
}

// ---- Public tariffs ------------------------------------------------------

export async function fetchTariffs() {
  if (!hasSupabase) return null
  const { data, error } = await supabase
    .from('tariffs')
    .select('id, name, tagline, speed, price, popular, features')
    .eq('active', true)
    .order('sort_order', { ascending: true })
  if (error) throw error
  // Normalise `features` (jsonb) to a plain array.
  return data.map((t) => ({ ...t, features: Array.isArray(t.features) ? t.features : [] }))
}

// ---- Admin: auth ---------------------------------------------------------

export async function adminSignIn(email, password) {
  if (!hasSupabase) throw new Error('Бекенд ще не підключено.')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error('Невірний email або пароль адміністратора.')
  const isAdmin = await currentUserIsAdmin()
  if (!isAdmin) {
    await supabase.auth.signOut()
    throw new Error('Цей акаунт не має прав адміністратора.')
  }
  return data.user
}

export async function adminSignOut() {
  await supabase.auth.signOut()
}

export async function currentUserIsAdmin() {
  if (!hasSupabase) return false
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data } = await supabase
    .from('admins')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()
  return Boolean(data)
}

// ---- Admin: tariffs ------------------------------------------------------

export async function adminListTariffs() {
  const { data, error } = await supabase
    .from('tariffs')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) throw error
  return data
}

export async function adminUpsertTariff(t) {
  const row = {
    id: t.id,
    name: t.name,
    tagline: t.tagline || '',
    speed: Number(t.speed) || 0,
    price: Number(t.price) || 0,
    popular: Boolean(t.popular),
    features: Array.isArray(t.features) ? t.features : [],
    sort_order: Number(t.sort_order) || 0,
    active: t.active !== false,
  }
  const { error } = await supabase.from('tariffs').upsert(row)
  if (error) throw error
}

export async function adminDeleteTariff(id) {
  const { error } = await supabase.from('tariffs').delete().eq('id', id)
  if (error) throw error
}

// ---- Admin: subscribers --------------------------------------------------

export async function adminListSubscribers() {
  const { data, error } = await supabase
    .from('subscribers')
    .select('id, contract, full_name, address, phone, tariff_id, balance, status, ip_address, next_charge, created_at')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function adminUpsertSubscriber(s) {
  const { data, error } = await supabase.rpc('admin_upsert_subscriber', {
    p_id: s.id || null,
    p_contract: s.contract,
    p_full_name: s.full_name,
    p_address: s.address || '',
    p_phone: s.phone || '',
    p_tariff_id: s.tariff_id || null,
    p_status: s.status || 'active',
    p_ip: s.ip_address || '',
    p_next_charge: s.next_charge || null,
    p_password: s.password || '',
  })
  if (error) throw error
  return data
}

export async function adminAdjustBalance(subscriberId, amount, note, method) {
  const { error } = await supabase.rpc('admin_adjust_balance', {
    p_subscriber_id: subscriberId,
    p_amount: amount,
    p_note: note || '',
    p_method: method || 'Адмін',
  })
  if (error) throw error
}

export async function adminDeleteSubscriber(id) {
  const { error } = await supabase.rpc('admin_delete_subscriber', { p_id: id })
  if (error) throw error
}

export async function adminListTransactions(subscriberId) {
  const { data, error } = await supabase
    .from('transactions')
    .select('amount, method, type, created_at')
    .eq('subscriber_id', subscriberId)
    .order('created_at', { ascending: false })
    .limit(100)
  if (error) throw error
  return data
}
