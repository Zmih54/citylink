// Return the current subscriber for a session token (fresh balance/tariff/history).
import { adminClient, corsHeaders, json, loadSubscriber } from '../_shared/utils.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  try {
    const { token } = await req.json()
    if (!token) return json({ error: 'missing_token' }, 400)

    const db = adminClient()
    const { data: session, error } = await db
      .from('subscriber_sessions')
      .select('subscriber_id, expires_at')
      .eq('token', token)
      .maybeSingle()
    if (error) throw error
    if (!session) return json({ error: 'invalid_session' }, 401)
    if (new Date(session.expires_at) < new Date()) {
      await db.from('subscriber_sessions').delete().eq('token', token)
      return json({ error: 'expired_session' }, 401)
    }

    const subscriber = await loadSubscriber(db, session.subscriber_id)
    return json({ subscriber })
  } catch (e) {
    return json({ error: 'server_error', detail: String(e) }, 500)
  }
})
