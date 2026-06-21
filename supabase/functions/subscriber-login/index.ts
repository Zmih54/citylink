// Subscriber login by contract number + password.
import { adminClient, corsHeaders, createSession, json, loadSubscriber } from '../_shared/utils.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  try {
    const { contract, password } = await req.json()
    if (!contract || !password) return json({ error: 'missing_credentials' }, 400)

    const db = adminClient()
    const { data: id, error } = await db.rpc('subscriber_check_password', {
      p_contract: String(contract).trim(),
      p_password: String(password),
    })
    if (error) throw error
    if (!id) return json({ error: 'invalid_credentials' }, 401)

    const token = await createSession(db, id as string)
    const subscriber = await loadSubscriber(db, id as string)
    return json({ token, subscriber })
  } catch (e) {
    return json({ error: 'server_error', detail: String(e) }, 500)
  }
})
