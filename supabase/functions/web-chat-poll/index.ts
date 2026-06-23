// Returns the full message list for a web conversation (the website widget polls this).
import { adminClient, corsHeaders, json } from '../_shared/utils.ts'

const db = adminClient()

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  try {
    const { chatId } = await req.json()
    if (!chatId) return json({ error: 'bad_request' }, 400)

    const { data, error } = await db
      .from('web_messages')
      .select('id, role, content, created_at')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .limit(200)
    if (error) throw error

    return json({ messages: data ?? [] })
  } catch (e) {
    return json({ error: 'server_error', detail: String(e) }, 500)
  }
})
