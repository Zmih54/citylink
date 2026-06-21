-- CityLink provider portal — initial schema, RLS, RPC and seed data.
-- Safe to run once on a fresh Supabase project.

create extension if not exists pgcrypto;

-- =========================================================================
-- Tables
-- =========================================================================

create table if not exists public.tariffs (
  id          text primary key,
  name        text    not null,
  tagline     text    default '',
  speed       int     not null,                 -- Mbit/s
  price       int     not null,                 -- грн/міс
  popular     boolean default false,
  features    jsonb   default '[]'::jsonb,
  sort_order  int     default 0,
  active      boolean default true
);

create table if not exists public.subscribers (
  id            uuid primary key default gen_random_uuid(),
  contract      text unique not null,           -- логін / номер договору
  password_hash text,                           -- bcrypt (pgcrypto)
  full_name     text not null,
  address       text default '',
  phone         text default '',
  tariff_id     text references public.tariffs(id) on delete set null,
  balance       numeric(12,2) default 0,
  status        text default 'active',          -- active | blocked | suspended
  ip_address    inet,                           -- призначена (статична) IP для IP-входу
  next_charge   date,
  created_at    timestamptz default now()
);

create table if not exists public.transactions (
  id            uuid primary key default gen_random_uuid(),
  subscriber_id uuid references public.subscribers(id) on delete cascade,
  created_at    timestamptz default now(),
  amount        numeric(12,2) not null,
  method        text default '',
  type          text default ''                 -- Поповнення | Списання | ...
);

create table if not exists public.subscriber_sessions (
  token         text primary key,
  subscriber_id uuid references public.subscribers(id) on delete cascade,
  created_at    timestamptz default now(),
  expires_at    timestamptz not null
);

create table if not exists public.admins (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

create index if not exists idx_tx_subscriber on public.transactions(subscriber_id, created_at desc);
create index if not exists idx_sub_ip on public.subscribers(ip_address);

-- =========================================================================
-- Helpers
-- =========================================================================

create or replace function public.is_admin(uid uuid)
returns boolean language sql security definer stable as $$
  select exists (select 1 from public.admins where user_id = uid);
$$;

-- =========================================================================
-- Row Level Security
-- =========================================================================

alter table public.tariffs              enable row level security;
alter table public.subscribers          enable row level security;
alter table public.transactions         enable row level security;
alter table public.subscriber_sessions  enable row level security;
alter table public.admins               enable row level security;

-- Tariffs: public can read active plans; admins can do everything.
drop policy if exists tariffs_public_read on public.tariffs;
create policy tariffs_public_read on public.tariffs
  for select using (active = true);

drop policy if exists tariffs_admin_all on public.tariffs;
create policy tariffs_admin_all on public.tariffs
  for all using (public.is_admin(auth.uid())) with check (public.is_admin(auth.uid()));

-- Subscribers / transactions: only admins may read directly (writes go via RPC).
-- Service role (Edge Functions) bypasses RLS entirely.
drop policy if exists subscribers_admin_read on public.subscribers;
create policy subscribers_admin_read on public.subscribers
  for select using (public.is_admin(auth.uid()));

drop policy if exists transactions_admin_read on public.transactions;
create policy transactions_admin_read on public.transactions
  for select using (public.is_admin(auth.uid()));

-- Admins table: a user can see their own admin row.
drop policy if exists admins_self_read on public.admins;
create policy admins_self_read on public.admins
  for select using (user_id = auth.uid());

-- subscriber_sessions: no policies → only service role can touch it.

-- =========================================================================
-- Admin RPC (SECURITY DEFINER, gated by is_admin)
-- =========================================================================

create or replace function public.admin_upsert_subscriber(
  p_id          uuid,
  p_contract    text,
  p_full_name   text,
  p_address     text,
  p_phone       text,
  p_tariff_id   text,
  p_status      text,
  p_ip          text,
  p_next_charge date,
  p_password    text
) returns uuid
language plpgsql security definer as $$
declare v_id uuid;
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  if p_id is null then
    insert into public.subscribers
      (contract, full_name, address, phone, tariff_id, status, ip_address, next_charge, password_hash)
    values
      (p_contract, p_full_name, coalesce(p_address,''), coalesce(p_phone,''), p_tariff_id,
       coalesce(nullif(p_status,''),'active'), nullif(p_ip,'')::inet, p_next_charge,
       case when coalesce(p_password,'') = '' then null else crypt(p_password, gen_salt('bf')) end)
    returning id into v_id;
  else
    update public.subscribers set
      contract      = p_contract,
      full_name     = p_full_name,
      address       = coalesce(p_address,''),
      phone         = coalesce(p_phone,''),
      tariff_id     = p_tariff_id,
      status        = coalesce(nullif(p_status,''), status),
      ip_address    = nullif(p_ip,'')::inet,
      next_charge   = p_next_charge,
      password_hash = case when coalesce(p_password,'') = '' then password_hash
                           else crypt(p_password, gen_salt('bf')) end
    where id = p_id
    returning id into v_id;
  end if;

  return v_id;
end; $$;

create or replace function public.admin_adjust_balance(
  p_subscriber_id uuid,
  p_amount        numeric,
  p_note          text default '',
  p_method        text default 'Адмін'
) returns void
language plpgsql security definer as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  update public.subscribers
     set balance = balance + p_amount
   where id = p_subscriber_id;

  insert into public.transactions (subscriber_id, amount, method, type)
  values (p_subscriber_id, abs(p_amount),
          coalesce(nullif(p_method,''),'Адмін'),
          case when p_amount >= 0 then 'Поповнення' else 'Списання' end
          || case when coalesce(p_note,'') <> '' then ' · ' || p_note else '' end);
end; $$;

create or replace function public.admin_delete_subscriber(p_id uuid)
returns void language plpgsql security definer as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;
  delete from public.subscribers where id = p_id;
end; $$;

-- =========================================================================
-- Subscriber auth helpers (called only by Edge Functions via service role)
-- =========================================================================

create or replace function public.subscriber_check_password(p_contract text, p_password text)
returns uuid language sql security definer stable as $$
  select id from public.subscribers
   where contract = p_contract
     and status = 'active'
     and password_hash is not null
     and password_hash = crypt(p_password, password_hash)
   limit 1;
$$;

revoke execute on function public.subscriber_check_password(text, text) from anon, authenticated;

-- =========================================================================
-- Admin bootstrap helper (run from SQL editor / service role only)
-- =========================================================================

create or replace function public.promote_to_admin(p_email text)
returns void language plpgsql security definer as $$
declare v uuid;
begin
  select id into v from auth.users where lower(email) = lower(p_email);
  if v is null then
    raise exception 'No auth user with email %', p_email;
  end if;
  insert into public.admins(user_id) values (v) on conflict do nothing;
end; $$;

revoke execute on function public.promote_to_admin(text) from anon, authenticated;

-- =========================================================================
-- Seed data
-- =========================================================================

insert into public.tariffs (id, name, tagline, speed, price, popular, features, sort_order) values
  ('maximum','MAXIMUM','Оптимальний для дому',150,170,false,
   '["Симетрична швидкість","Модем в оренду","Безкоштовне прокладання кабелю"]'::jsonb,1),
  ('standart','STANDART','Для родини та стрімінгу',250,240,true,
   '["Симетрична швидкість","Модем в оренду","Безкоштовне прокладання кабелю"]'::jsonb,2),
  ('turbo','TURBO','Для геймінгу та 4K',350,280,false,
   '["Симетрична швидкість","Модем в оренду","Пріоритетна підтримка"]'::jsonb,3)
on conflict (id) do nothing;

-- Demo subscriber: contract 1001 / password demo
insert into public.subscribers
  (contract, password_hash, full_name, address, phone, tariff_id, balance, status, next_charge)
values
  ('1001', crypt('demo', gen_salt('bf')), 'Сергій Петренко',
   'м. Глухів, вул. Києво-Московська, 24, кв. 12', '+380660261075',
   'standart', 180, 'active', date '2026-07-01')
on conflict (contract) do nothing;

insert into public.transactions (subscriber_id, amount, method, type, created_at)
select s.id, v.amount, v.method, v.type, v.created_at
from public.subscribers s
join (values
  (240, 'Приват24',    'Списання абонплати', timestamptz '2026-06-01'),
  (240, 'Картка Visa',  'Поповнення',         timestamptz '2026-05-28'),
  (240, 'Приват24',    'Списання абонплати', timestamptz '2026-05-01'),
  (240, 'EasyPay',     'Поповнення',         timestamptz '2026-04-27')
) as v(amount, method, type, created_at) on true
where s.contract = '1001'
  and not exists (select 1 from public.transactions t where t.subscriber_id = s.id);
