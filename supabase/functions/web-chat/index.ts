// Website support chat: stores messages, answers with AI, and hands off to the
// Telegram support chat for atypical questions / operator requests.
import { adminClient, corsHeaders, json } from '../_shared/utils.ts'
import { askAI } from '../_shared/ai.ts'
import { tg, esc } from '../_shared/telegram.ts'

const db = adminClient()
const ADMIN_CHAT = Deno.env.get('ADMIN_CHAT_ID') ?? ''

async function forwardToOperator(chatId: string, text: string) {
  if (!ADMIN_CHAT) return
  const short = String(chatId).slice(0, 8)
  const head = `🌐 <b>Звернення з сайту</b> <code>${esc(short)}</code>\n` +
    `<i>відповідайте reply на це повідомлення — відповідь зʼявиться на сайті</i>\n\n`
  const res = await tg.send(ADMIN_CHAT, head + esc(text))
  const msgId = res?.result?.message_id
  if (msgId) await db.from('web_relays').insert({ admin_msg_id: msgId, chat_id: chatId })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  try {
    const { chatId, message } = await req.json()
    if (!chatId || typeof message !== 'string') return json({ error: 'bad_request' }, 400)
    const text = message.trim().slice(0, 2000)
    if (!text) return json({ error: 'empty' }, 400)

    await db.from('web_chats').upsert(
      { id: chatId, updated_at: new Date().toISOString() },
      { onConflict: 'id' },
    )
    const { data: chat } = await db.from('web_chats').select('mode').eq('id', chatId).maybeSingle()
    const mode = chat?.mode ?? 'ai'

    await db.from('web_messages').insert({ chat_id: chatId, role: 'user', content: text })

    // Conversation already handed to a human → just forward, no AI.
    if (mode === 'operator') {
      await forwardToOperator(chatId, text)
      return json({ ok: true, escalated: true })
    }

    const { data: tariffs } = await db
      .from('tariffs').select('name, speed, price').eq('active', true).order('sort_order')
    const ai = await askAI(text, { tariffs: tariffs ?? [] })

    if (ai.operator || ai.escalate) {
      await db.from('web_chats').update({ mode: 'operator' }).eq('id', chatId)
      await forwardToOperator(chatId, text)
      const note = 'Передаю ваше звернення оператору — він відповість тут найближчим часом. Дякуємо за очікування!'
      await db.from('web_messages').insert({ chat_id: chatId, role: 'assistant', content: note })
      return json({ ok: true, escalated: true, reply: note })
    }

    await db.from('web_messages').insert({ chat_id: chatId, role: 'assistant', content: ai.text })
    return json({ ok: true, reply: ai.text })
  } catch (e) {
    return json({ error: 'server_error', detail: String(e) }, 500)
  }
})
