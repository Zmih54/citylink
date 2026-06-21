// Passwordless subscriber login by source IP.
// Works when the visitor's public IP matches an active subscriber's assigned IP
// (i.e. they are connected through their CityLink line with a static/white IP).
import { adminClient, clientIp, corsHeaders, createSession, json, loadSubscriber } from '../_shared/utils.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  try {
    const ip = clientIp(req)
    if (!ip) return json({ error: 'no_ip' }, 400)

    const db = adminClient()
    const { data: sub, error } = await db
      .from('subscribers')
      .select('id')
      .eq('ip_address', ip)
      .eq('status', 'active')
      .maybeSingle()
    if (error) throw error
    if (!sub) return json({ error: 'ip_not_recognized', ip }, 404)

    const token = await createSession(db, sub.id)
    const subscriber = await loadSubscriber(db, sub.id)
    return json({ token, subscriber, ip })
  } catch (e) {
    return json({ error: 'server_error', detail: String(e) }, 500)
  }
})
