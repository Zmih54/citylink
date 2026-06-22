// LiqPay server callback → credits the subscriber's balance on successful payment.
// Set this function's URL as LIQPAY_CALLBACK_URL (server_url) for checkout.
import { adminClient } from '../_shared/utils.ts'
import { liqpaySign, decodeLiqpayData } from '../_shared/liqpay.ts'

const OK_STATUSES = new Set(['success', 'sandbox', 'wait_accept'])

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('method', { status: 405 })
  const priv = Deno.env.get('LIQPAY_PRIVATE_KEY') ?? ''
  try {
    const form = await req.formData()
    const data = String(form.get('data') ?? '')
    const signature = String(form.get('signature') ?? '')
    if (!data || !signature) return new Response('bad request', { status: 400 })

    // Verify signature to ensure the callback really came from LiqPay.
    const expected = await liqpaySign(data, priv)
    if (expected !== signature) return new Response('bad signature', { status: 403 })

    const payload = decodeLiqpayData(data) as any
    if (!OK_STATUSES.has(payload.status)) return new Response('ok') // ignore non-paid states

    // order_id = cl-<contract>-<timestamp>
    const m = String(payload.order_id || '').match(/^cl-(.+)-\d+$/)
    const contract = m?.[1]
    const amount = Number(payload.amount)
    if (!contract || !(amount > 0)) return new Response('ok')

    const db = adminClient()
    const { data: sub } = await db.from('subscribers').select('id').eq('contract', contract).maybeSingle()
    if (sub) {
      await db.rpc('bot_credit_subscriber', {
        p_subscriber_id: sub.id, p_amount: amount, p_method: 'LiqPay', p_note: `LiqPay ${payload.order_id}`,
      })
    }
    return new Response('ok')
  } catch (e) {
    console.error('liqpay-callback error', e)
    return new Response('ok')
  }
})
