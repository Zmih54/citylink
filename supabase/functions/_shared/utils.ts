// Shared helpers for CityLink Edge Functions.
import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2'

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Service-role client — bypasses RLS. Never expose this key to the frontend.
export function adminClient(): SupabaseClient {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    { auth: { persistSession: false } },
  )
}

// Best-effort extraction of the real client IP behind Supabase's proxy.
export function clientIp(req: Request): string | null {
  const xff = req.headers.get('x-forwarded-for')
  if (xff) return xff.split(',')[0].trim()
  return req.headers.get('x-real-ip')
}

const SESSION_DAYS = 7

export async function createSession(
  db: SupabaseClient,
  subscriberId: string,
): Promise<string> {
  const token = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '')
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000).toISOString()
  const { error } = await db
    .from('subscriber_sessions')
    .insert({ token, subscriber_id: subscriberId, expires_at: expires })
  if (error) throw error
  return token
}

// Public view of a subscriber (never leak password_hash).
export async function loadSubscriber(db: SupabaseClient, id: string) {
  const { data: sub, error } = await db
    .from('subscribers')
    .select('id, contract, full_name, address, phone, tariff_id, balance, status, next_charge')
    .eq('id', id)
    .single()
  if (error) throw error

  let tariff = null
  if (sub.tariff_id) {
    const { data: t } = await db
      .from('tariffs')
      .select('id, name, speed, price')
      .eq('id', sub.tariff_id)
      .maybeSingle()
    tariff = t
  }

  const { data: tx } = await db
    .from('transactions')
    .select('amount, method, type, created_at')
    .eq('subscriber_id', id)
    .order('created_at', { ascending: false })
    .limit(50)

  return { ...sub, tariff, transactions: tx ?? [] }
}
