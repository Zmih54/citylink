// Claude (Anthropic) helper for the support bot.
// Answers typical questions from a built-in knowledge base; signals escalation
// to a human operator when it cannot help confidently.

const ESCALATE = '[[ESCALATE]]'

const KNOWLEDGE = `
Ти — ввічливий віртуальний помічник інтернет-провайдера CityLink (місто Глухів, Україна).
Відповідай КОРОТКО, дружньо, українською мовою. Не вигадуй фактів.
Пиши звичайним текстом без Markdown-розмітки: не використовуй зірочки (* чи **), решітки (#), підкреслення (_) чи таблиці. За потреби роби короткі списки з тире (-). Телефони й посилання пиши просто текстом.

ДОВІДКА ПРО КОМПАНІЮ:
- CityLink — домашній оптичний інтернет у Глухові. Телефон підтримки: +38 (066) 026-10-75. Telegram-підтримка доступна тут.
- Підключення безкоштовне для приватних будинків і багатоповерхівок у зоні покриття; прокладання кабелю та модем в оренду — включені.
- Підключення зазвичай протягом 1–3 робочих днів після заявки.
- Реальна (біла) статична IP-адреса — за окрему щомісячну плату.
- Оплата: через Приват24, карткою будь-якого банку, термінали EasyPay, а також прямо в цьому боті (Приват24-посилання або картка через LiqPay).
- Якщо зник інтернет: спершу перезавантажити роутер (вимкнути з розетки на 30 секунд). Якщо не допомогло — звернутися до підтримки.
- Налаштування роутера: тип підключення Dynamic IP (DHCP), окремих налаштувань від провайдера не потрібно.

ПРАВИЛА ВІДПОВІДЕЙ:
- Відповідай ЛИШЕ на теми, повʼязані з CityLink, інтернетом і послугами провайдера (тарифи, оплата, підключення, несправності, обладнання, договір, контакти, графік). Якщо запитання НЕ стосується цього (загальні знання, інші компанії, програмування, математика, переклади, творчі завдання, поради не з теми тощо) — ввічливо відмовся одним-двома реченнями: поясни, що ти помічник CityLink і допомагаєш лише з питаннями провайдера, та запропонуй спитати про тарифи, оплату чи підключення. НЕ виконуй стороннє прохання і НЕ передавай його оператору (не використовуй ${ESCALATE} для off-topic).
- На типові запитання (тарифи, оплата, підключення, базові несправності, графік, контакти) відповідай сам, спираючись на довідку та надані дані тарифів/акаунта.
- Якщо запитання стосується КОНКРЕТНОЇ проблеми, яку не вирішити порадою (аварія за адресою, скарга, перерахунок, зміна договору, технічний виїзд, повернення коштів, щось поза довідкою) — НЕ вигадуй. Відповідай РІВНО одним рядком: ${ESCALATE}
- Якщо користувач прямо просить оператора/людину — також відповідай: ${ESCALATE}
- Для перегляду балансу/тарифу/історії підкажи натиснути відповідні кнопки меню або команди /balance, /tariff, /history. Для оплати — /pay.
`

export interface AiResult { text: string; escalate: boolean }

export async function askAI(
  question: string,
  ctx: { tariffs?: { name: string; speed: number; price: number }[]; account?: Record<string, unknown> | null },
): Promise<AiResult> {
  const apiKey = Deno.env.get('ANTHROPIC_API_KEY')
  if (!apiKey) return { text: '', escalate: true } // no AI configured → hand to operator

  let context = ''
  if (ctx.tariffs?.length) {
    context += '\nАКТУАЛЬНІ ТАРИФИ:\n' +
      ctx.tariffs.map((t) => `- ${t.name}: до ${t.speed} Мбіт/с — ${t.price} грн/міс`).join('\n')
  }
  if (ctx.account) {
    const a = ctx.account as any
    context += `\nДАНІ АБОНЕНТА (для персоналізації): договір ${a.contract}, баланс ${a.balance} грн, тариф ${a.tariff?.name ?? '—'}, статус ${a.status}.`
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: Deno.env.get('ANTHROPIC_MODEL') ?? 'claude-haiku-4-5',
        max_tokens: 500,
        system: KNOWLEDGE + context,
        messages: [{ role: 'user', content: question }],
      }),
    })
    const data = await res.json()
    if (!res.ok) { console.error('anthropic error', data); return { text: '', escalate: true } }
    const text = (data.content?.[0]?.text ?? '').trim()
    if (!text || text.includes(ESCALATE)) return { text: text.replace(ESCALATE, '').trim(), escalate: true }
    return { text, escalate: false }
  } catch (e) {
    console.error('askAI failed', e)
    return { text: '', escalate: true }
  }
}
