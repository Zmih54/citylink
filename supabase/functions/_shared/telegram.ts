// Minimal Telegram Bot API wrapper for Edge Functions.
const API = (method: string) =>
  `https://api.telegram.org/bot${Deno.env.get('TELEGRAM_BOT_TOKEN')}/${method}`

async function call(method: string, payload: Record<string, unknown>) {
  const res = await fetch(API(method), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!data.ok) console.error(`tg ${method} failed`, data)
  return data
}

export const tg = {
  send(chatId: number | string, text: string, extra: Record<string, unknown> = {}) {
    return call('sendMessage', {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      ...extra,
    })
  },
  answerCallback(id: string, text = '') {
    return call('answerCallbackQuery', { callback_query_id: id, text })
  },
  deleteMessage(chatId: number | string, messageId: number) {
    return call('deleteMessage', { chat_id: chatId, message_id: messageId })
  },
}

// Inline keyboard helpers ------------------------------------------------
export const btn = (text: string, data: string) => ({ text, callback_data: data })
export const urlBtn = (text: string, url: string) => ({ text, url })
export const keyboard = (rows: unknown[][]) => ({ reply_markup: { inline_keyboard: rows } })

export const mainMenu = () =>
  keyboard([
    [btn('💰 Баланс', 'menu:balance'), btn('📶 Тариф', 'menu:tariff')],
    [btn('🧾 Історія', 'menu:history'), btn('💳 Оплатити', 'menu:pay')],
    [btn('🔗 Підключити акаунт', 'menu:link'), btn('🧑‍💼 Оператор', 'menu:operator')],
  ])

export function esc(s: string): string {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
