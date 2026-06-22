// LiqPay (PrivatBank) checkout link builder + callback verifier.
// Uses Web Crypto (SHA-1) — LiqPay signature = base64( sha1( private + data + private ) ).
import { encodeBase64 } from 'https://deno.land/std@0.224.0/encoding/base64.ts'

async function sha1Base64(input: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-1', input)
  return encodeBase64(new Uint8Array(digest))
}

export async function liqpaySign(dataB64: string, privateKey: string): Promise<string> {
  const bytes = new TextEncoder().encode(privateKey + dataB64 + privateKey)
  return await sha1Base64(bytes)
}

// Builds a ready-to-open LiqPay checkout URL for a top-up.
export async function liqpayCheckoutUrl(opts: {
  publicKey: string
  privateKey: string
  amount: number
  orderId: string
  description: string
  resultUrl?: string
  serverUrl?: string
}): Promise<string> {
  const payload: Record<string, unknown> = {
    public_key: opts.publicKey,
    version: 3,
    action: 'pay',
    amount: opts.amount,
    currency: 'UAH',
    description: opts.description,
    order_id: opts.orderId,
  }
  if (opts.resultUrl) payload.result_url = opts.resultUrl
  if (opts.serverUrl) payload.server_url = opts.serverUrl

  const dataB64 = encodeBase64(new TextEncoder().encode(JSON.stringify(payload)))
  const signature = await liqpaySign(dataB64, opts.privateKey)
  const qs = new URLSearchParams({ data: dataB64, signature })
  return `https://www.liqpay.ua/api/3/checkout?${qs.toString()}`
}

export function decodeLiqpayData(dataB64: string): Record<string, unknown> {
  return JSON.parse(new TextDecoder().decode(
    Uint8Array.from(atob(dataB64), (c) => c.charCodeAt(0)),
  ))
}
