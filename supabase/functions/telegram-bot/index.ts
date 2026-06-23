// CityLink — Telegram support bot (Supabase Edge Function, webhook).
// Features: built-in commands, account linking to the billing DB, balance/
// tariff/history, AI answers (Claude Haiku) with operator escalation,
// payments via Privat24 link and LiqPay card checkout.
import { adminClient, loadSubscriber } from '../_shared/utils.ts'
import { tg, btn, urlBtn, keyboard, mainMenu, esc, mdToHtml } from '../_shared/telegram.ts'
import { askAI } from '../_shared/ai.ts'
import { liqpayCheckoutUrl } from '../_shared/liqpay.ts'

const PRIVAT24_URL = 'https://next.privat24.ua/'
const PRESETS = [100, 170, 240, 280, 500]

const db = adminClient()
const ADMIN_CHAT = Deno.env.get('ADMIN_CHAT_ID') ?? ''
const WEBHOOK_SECRET = Deno.env.get('TELEGRAM_WEBHOOK_SECRET') ?? ''
// Rendered prefix of operator-reply messages shown to the user. Must match the
// text sent below — used to detect when the user replies to an operator.
const OPERATOR_LABEL = '🧑‍💼 Оператор:'

// ---- DB helpers ---------------------------------------------------------
async function getLinkedSubscriber(tgId: number) {
  const { data: link } = await db.from('telegram_links').select('subscriber_id').eq('telegram_id', tgId).maybeSingle()
  if (!link) return null
  try { return await loadSubscriber(db, link.subscriber_id) } catch { return null }
}
async function setState(tgId: number, mode: string, scratch: Record<string, unknown> = {}) {
  await db.from('telegram_state').upsert({ telegram_id: tgId, mode, scratch, updated_at: new Date().toISOString() })
}
async function getState(tgId: number) {
  const { data } = await db.from('telegram_state').select('mode, scratch').eq('telegram_id', tgId).maybeSingle()
  return data ?? { mode: '', scratch: {} }
}
async function clearState(tgId: number) { await setState(tgId, '', {}) }

async function listTariffs() {
  const { data } = await db.from('tariffs').select('name, speed, price, active, sort_order').eq('active', true).order('sort_order')
  return data ?? []
}

// ---- Views --------------------------------------------------------------
function fmtDate(s: string) { try { return new Date(s).toLocaleDateString('uk-UA') } catch { return s } }

function balanceView(sub: any) {
  const fee = sub.tariff?.price ?? 0
  const months = fee > 0 ? Math.floor(Number(sub.balance) / fee) : null
  return `💰 <b>Баланс:</b> ${Number(sub.balance)} грн` +
    (months !== null ? `\nВистачить приблизно на <b>${months} міс</b>.` : '') +
    `\nСтатус: ${sub.status === 'active' ? '🟢 активний' : '🔴 ' + esc(sub.status)}`
}
function tariffView(sub: any) {
  if (!sub.tariff) return '📶 Тариф не призначено. Зверніться до підтримки.'
  return `📶 <b>Тариф ${esc(sub.tariff.name)}</b>\nШвидкість: до ${sub.tariff.speed} Мбіт/с\nАбонплата: ${sub.tariff.price} грн/міс`
}
function historyView(sub: any) {
  const tx = sub.transactions ?? []
  if (!tx.length) return '🧾 Операцій поки немає.'
  const rows = tx.slice(0, 10).map((t: any) => {
    const sign = (t.type || '').startsWith('Поповнення') ? '➕' : '➖'
    return `${sign} ${fmtDate(t.created_at)} — ${Number(t.amount)} грн <i>(${esc(t.method || '—')})</i>`
  })
  return '🧾 <b>Останні операції:</b>\n' + rows.join('\n')
}

async function payOptions(chatId: number, sub: any, amount: number) {
  const rows: unknown[][] = [[urlBtn(`💳 Приват24 (${amount} грн)`, PRIVAT24_URL)]]
  const pub = Deno.env.get('LIQPAY_PUBLIC_KEY'), prv = Deno.env.get('LIQPAY_PRIVATE_KEY')
  if (pub && prv) {
    const url = await liqpayCheckoutUrl({
      publicKey: pub, privateKey: prv, amount,
      orderId: `cl-${sub.contract}-${Date.now()}`,
      description: `Поповнення рахунку CityLink, договір ${sub.contract}`,
      serverUrl: Deno.env.get('LIQPAY_CALLBACK_URL') || undefined,
    })
    rows.push([urlBtn(`💳 Карткою онлайн (LiqPay, ${amount} грн)`, url)])
  }
  await tg.send(chatId,
    `Оплата на суму <b>${amount} грн</b>, договір <code>${esc(sub.contract)}</code>.\n` +
    `• Приват24: знайдіть отримувача <b>CityLink</b> у розділі «Інтернет», введіть договір і суму.\n` +
    (pub && prv ? '• LiqPay: оплата карткою з миттєвим зарахуванням на баланс.' : ''),
    keyboard(rows))
}

async function requireLink(chatId: number, tgId: number) {
  const sub = await getLinkedSubscriber(tgId)
  if (!sub) {
    await tg.send(chatId, '🔗 Спершу підключіть свій акаунт командою /link (знадобиться номер договору та пароль).', mainMenu())
    return null
  }
  return sub
}

// ---- Operator escalation ------------------------------------------------
async function escalate(chatId: number, tgId: number, fromName: string, username: string, question: string) {
  if (!ADMIN_CHAT) {
    await tg.send(chatId, '🧑‍💼 Передаю запит у підтримку. Якщо терміново — телефонуйте +38 (066) 026-10-75.')
    return
  }
  const sub = await getLinkedSubscriber(tgId)
  const head = `❓ <b>Питання від ${esc(fromName)}</b>` +
    (username ? ` (@${esc(username)})` : '') +
    (sub ? ` — договір <code>${esc(sub.contract)}</code>` : '') +
    `\n<i>відповідайте reply на це повідомлення</i>\n\n`
  const res = await tg.send(ADMIN_CHAT, head + esc(question))
  const msgId = res?.result?.message_id
  if (msgId) await db.from('telegram_relays').insert({ admin_msg_id: msgId, user_telegram_id: tgId })
  await tg.send(chatId, '🧑‍💼 Ваше запитання передано оператору. Ми відповімо тут, щойно зможемо. Дякуємо за терпіння!')
}

// User replied (in the bot) to an operator's message → relay it back to the
// support chat and keep the thread open (operator can reply again).
async function relayUserToOperator(chatId: number, tgId: number, user: any, text: string) {
  if (!ADMIN_CHAT) {
    await tg.send(chatId, '🧑‍💼 Підтримка зараз недоступна. Якщо терміново — телефонуйте +38 (066) 026-10-75.')
    return
  }
  const sub = await getLinkedSubscriber(tgId)
  const name = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Абонент'
  const head = `💬 <b>Відповідь від ${esc(name)}</b>` +
    (user?.username ? ` (@${esc(user.username)})` : '') +
    (sub ? ` — договір <code>${esc(sub.contract)}</code>` : '') +
    `\n<i>відповідайте reply на це повідомлення</i>\n\n`
  const res = await tg.send(ADMIN_CHAT, head + esc(text))
  const msgId = res?.result?.message_id
  if (msgId) await db.from('telegram_relays').insert({ admin_msg_id: msgId, user_telegram_id: tgId })
  await tg.send(chatId, '✅ Відповідь надіслано оператору.')
}

// ---- Command handlers ---------------------------------------------------
async function handleCommand(chatId: number, tgId: number, cmd: string, arg: string, user: any) {
  switch (cmd) {
    case '/start':
      await clearState(tgId)
      return tg.send(chatId,
        '👋 Вітаю! Я бот підтримки <b>CityLink</b>.\n\n' +
        'Я можу показати ваш баланс, тариф та історію, прийняти оплату й відповісти на запитання. ' +
        'Просто напишіть запитання звичайним текстом або скористайтесь меню 👇',
        mainMenu())
    case '/help':
      return tg.send(chatId,
        '<b>Команди:</b>\n' +
        '/balance — баланс рахунку\n/tariff — поточний тариф\n/history — останні операції\n' +
        '/pay [сума] — поповнити рахунок\n/link — підключити акаунт\n/logout — відключити акаунт\n' +
        '/operator — звернутися до оператора\n\n' +
        'Або просто напишіть запитання — я відповім, а складні передам оператору.', mainMenu())
    case '/link':
      await setState(tgId, 'awaiting_contract')
      return tg.send(chatId, '🔗 Введіть ваш <b>номер договору</b> (особовий рахунок):')
    case '/logout':
      await db.from('telegram_links').delete().eq('telegram_id', tgId)
      await clearState(tgId)
      return tg.send(chatId, '✅ Акаунт відключено. Дані більше не показуються в цьому чаті.')
    case '/balance': { const s = await requireLink(chatId, tgId); if (s) await tg.send(chatId, balanceView(s), mainMenu()); return }
    case '/tariff': { const s = await requireLink(chatId, tgId); if (s) await tg.send(chatId, tariffView(s), mainMenu()); return }
    case '/history': { const s = await requireLink(chatId, tgId); if (s) await tg.send(chatId, historyView(s), mainMenu()); return }
    case '/pay': {
      const s = await requireLink(chatId, tgId); if (!s) return
      const amt = parseInt(arg, 10)
      if (amt > 0) return payOptions(chatId, s, amt)
      await setState(tgId, 'awaiting_pay')
      return tg.send(chatId, '💳 На яку суму поповнити рахунок (грн)?',
        keyboard([PRESETS.map((a) => btn(`${a}`, `pay:set:${a}`))]))
    }
    case '/operator':
      await setState(tgId, 'operator')
      return tg.send(chatId, '🧑‍💼 Опишіть, будь ласка, ваше питання одним повідомленням — я передам його оператору.')
    case '/menu':
      return tg.send(chatId, 'Головне меню:', mainMenu())
    default:
      return tg.send(chatId, 'Невідома команда. Напишіть /help або просто поставте запитання.')
  }
}

// ---- Linking flow -------------------------------------------------------
async function handleState(chatId: number, tgId: number, state: any, text: string, user: any) {
  if (state.mode === 'awaiting_contract') {
    await setState(tgId, 'awaiting_password', { contract: text.trim() })
    return tg.send(chatId, '🔑 Тепер введіть <b>пароль</b> від особистого кабінету. (Повідомлення з паролем я одразу видалю.)')
  }
  if (state.mode === 'awaiting_password') {
    const contract = String(state.scratch?.contract ?? '').trim()
    const { data: id } = await db.rpc('subscriber_check_password', { p_contract: contract, p_password: text })
    await clearState(tgId)
    if (!id) return tg.send(chatId, '❌ Невірний номер договору або пароль. Спробуйте ще раз: /link')
    await db.from('telegram_links').upsert({ telegram_id: tgId, subscriber_id: id, username: user?.username ?? '' })
    const sub = await loadSubscriber(db, id as string)
    return tg.send(chatId, `✅ Акаунт підключено! Вітаю, ${esc((sub.full_name || '').split(' ')[0])}.\n\n` + balanceView(sub), mainMenu())
  }
  if (state.mode === 'awaiting_pay') {
    const amt = parseInt(text.replace(/\D/g, ''), 10)
    if (!amt) return tg.send(chatId, 'Вкажіть суму числом, напр. 240.')
    await clearState(tgId)
    const s = await getLinkedSubscriber(tgId); if (s) return payOptions(chatId, s, amt)
    return
  }
  if (state.mode === 'operator') {
    await clearState(tgId)
    return escalate(chatId, tgId, [user?.first_name, user?.last_name].filter(Boolean).join(' ') || 'Абонент', user?.username ?? '', text)
  }
  return null
}

// ---- Main webhook -------------------------------------------------------
Deno.serve(async (req) => {
  if (WEBHOOK_SECRET && req.headers.get('x-telegram-bot-api-secret-token') !== WEBHOOK_SECRET) {
    return new Response('forbidden', { status: 403 })
  }
  let update: any
  try { update = await req.json() } catch { return new Response('ok') }

  try {
    // Callback buttons
    if (update.callback_query) {
      const cq = update.callback_query
      const chatId = cq.message.chat.id
      const tgId = cq.from.id
      const data: string = cq.data || ''
      await tg.answerCallback(cq.id)

      if (data.startsWith('menu:')) {
        const what = data.slice(5)
        if (what === 'link') return ok(await handleCommand(chatId, tgId, '/link', '', cq.from))
        if (what === 'operator') return ok(await handleCommand(chatId, tgId, '/operator', '', cq.from))
        if (what === 'pay') return ok(await handleCommand(chatId, tgId, '/pay', '', cq.from))
        const s = await requireLink(chatId, tgId)
        if (!s) return ok()
        if (what === 'balance') await tg.send(chatId, balanceView(s), mainMenu())
        if (what === 'tariff') await tg.send(chatId, tariffView(s), mainMenu())
        if (what === 'history') await tg.send(chatId, historyView(s), mainMenu())
        return ok()
      }
      if (data.startsWith('pay:set:')) {
        const amt = parseInt(data.slice(8), 10)
        const s = await requireLink(chatId, tgId)
        if (s && amt > 0) { await clearState(tgId); await payOptions(chatId, s, amt) }
        return ok()
      }
      return ok()
    }

    const msg = update.message
    if (!msg) return ok()
    const chatId = msg.chat.id
    const text: string = (msg.text || '').trim()

    // Operator replies inside the admin chat → relay back to the user (Telegram) or
    // to the website conversation the message came from.
    if (ADMIN_CHAT && String(chatId) === String(ADMIN_CHAT) && msg.reply_to_message) {
      const replyId = msg.reply_to_message.message_id
      const { data: rel } = await db.from('telegram_relays')
        .select('user_telegram_id').eq('admin_msg_id', replyId).maybeSingle()
      if (rel && text) {
        await tg.send(rel.user_telegram_id, '🧑‍💼 <b>Оператор:</b>\n' + esc(text))
      } else if (text) {
        const { data: wrel } = await db.from('web_relays')
          .select('chat_id').eq('admin_msg_id', replyId).maybeSingle()
        if (wrel) {
          // First token, без @імʼя_бота та аргументів: "/close@CityLinkBot" -> "/close".
          const cmd = text.trim().toLowerCase().split(/[\s@]/)[0]
          if (['/close', '/end', '/bot', '/done'].includes(cmd)) {
            // Operator ends the session → hand the web conversation back to the AI.
            await db.from('web_chats').update({ mode: 'ai' }).eq('id', wrel.chat_id)
            await db.from('web_messages').insert({
              chat_id: wrel.chat_id, role: 'assistant',
              content: 'Оператор завершив діалог. Якщо буде ще питання — я знову на звʼязку 🤖',
            })
            await tg.send(ADMIN_CHAT, '✅ Діалог із сайтом завершено — бот знову відповідає цьому відвідувачу.')
          } else {
            await db.from('web_messages').insert({ chat_id: wrel.chat_id, role: 'operator', content: text })
          }
        }
      }
      return ok()
    }

    if (!text) return ok()
    const tgId = msg.from.id

    // Commands
    if (text.startsWith('/')) {
      const [c, ...rest] = text.split(/\s+/)
      const cmd = c.split('@')[0].toLowerCase()
      return ok(await handleCommand(chatId, tgId, cmd, rest.join(' '), msg.from))
    }

    // User replying to an operator's message → relay it back to the support chat.
    const repliedTo = msg.reply_to_message
    if (repliedTo?.from?.is_bot && String(repliedTo.text || '').startsWith(OPERATOR_LABEL)) {
      await relayUserToOperator(chatId, tgId, msg.from, text)
      return ok()
    }

    // Stateful flows (linking, payment amount, operator)
    const state = await getState(tgId)
    if (state.mode) {
      // delete the password message for safety
      if (state.mode === 'awaiting_password') tg.deleteMessage(chatId, msg.message_id).catch(() => {})
      const handled = await handleState(chatId, tgId, state, text, msg.from)
      if (handled !== null) return ok()
    }

    // Free text → AI
    const sub = await getLinkedSubscriber(tgId)
    const tariffs = await listTariffs()
    const ai = await askAI(text, { tariffs, account: sub, channel: 'telegram' })
    // AI output is free text — normalise Markdown to safe HTML (also escapes < & >).
    if (ai.operator) {
      // User asked for an operator: don't forward the request phrase — collect
      // their actual question next and forward that.
      if (ai.text) await tg.send(chatId, mdToHtml(ai.text))
      await setState(tgId, 'operator')
      await tg.send(chatId, '🧑‍💼 Опишіть, будь ласка, ваше питання одним повідомленням — я передам його оператору.')
    } else if (ai.escalate) {
      if (ai.text) await tg.send(chatId, mdToHtml(ai.text))
      await escalate(chatId, tgId, [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(' ') || 'Абонент', msg.from?.username ?? '', text)
    } else {
      await tg.send(chatId, mdToHtml(ai.text), mainMenu())
    }
    return ok()
  } catch (e) {
    console.error('handler error', e)
    return ok()
  }
})

function ok(_?: unknown) { return new Response('ok') }
