-- CityLink — Telegram support bot: linking, state machine, operator relay, bot credits.
-- Run after 0001_init.sql.

-- =========================================================================
-- Tables
-- =========================================================================

-- Maps a Telegram user to a billing subscriber (set after /link verification).
create table if not exists public.telegram_links (
  telegram_id   bigint primary key,
  subscriber_id uuid not null references public.subscribers(id) on delete cascade,
  username      text default '',
  created_at    timestamptz default now()
);

-- Tiny per-chat state machine (linking flow, awaiting payment amount, operator mode).
create table if not exists public.telegram_state (
  telegram_id bigint primary key,
  mode        text default '',     -- '', awaiting_contract, awaiting_password, awaiting_pay, operator
  scratch     jsonb default '{}'::jsonb,
  updated_at  timestamptz default now()
);

-- Operator hand-off: remembers which admin-chat message belongs to which user,
-- so an admin's reply can be relayed back to the right person.
create table if not exists public.telegram_relays (
  admin_msg_id     bigint primary key,
  user_telegram_id bigint not null,
  created_at       timestamptz default now()
);

alter table public.telegram_links  enable row level security;
alter table public.telegram_state  enable row level security;
alter table public.telegram_relays enable row level security;
-- No policies → only the service role (Edge Functions) may touch these tables.

-- =========================================================================
-- Service-role credit (used by LiqPay callback). Not gated by is_admin,
-- but execute is revoked from anon/authenticated; service role bypasses RLS.
-- =========================================================================

create or replace function public.bot_credit_subscriber(
  p_subscriber_id uuid,
  p_amount        numeric,
  p_method        text default 'LiqPay',
  p_note          text default ''
) returns void
language plpgsql security definer as $$
begin
  if p_amount <= 0 then
    raise exception 'amount must be positive';
  end if;

  update public.subscribers
     set balance = balance + p_amount
   where id = p_subscriber_id;

  insert into public.transactions (subscriber_id, amount, method, type)
  values (p_subscriber_id, p_amount,
          coalesce(nullif(p_method,''), 'LiqPay'),
          'Поповнення' || case when coalesce(p_note,'') <> '' then ' · ' || p_note else '' end);
end; $$;

revoke execute on function public.bot_credit_subscriber(uuid, numeric, text, text) from anon, authenticated;
