-- ==============================================================================
-- K&P ATELIER — PHYGITAL GIFT COUNTER POS & DIGITAL GIFT SCHEMA
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ==============================================================================

-- 1. Create gift_products table
create table if not exists public.gift_products (
  id uuid primary key default gen_random_uuid(),
  token varchar(32) unique not null,                  -- Mã vòng tay (e.g. KP-2010-XXXX)
  creator_key text not null default '',               -- MÃ 1: mật khẩu tạo thiệp, lưu dạng băm scrypt (không bao giờ lưu plaintext)
  unlock_pin text not null default '',                -- MÃ 2: mã mở thiệp, lưu dạng băm scrypt
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  chain_id text not null,
  chain_name text not null,
  chain_price integer not null default 0,
  charms jsonb not null default '[]'::jsonb,
  total_price integer not null default 0,
  payment_method text not null default 'cash', -- 'cash' | 'transfer'
  status text not null default 'pending', -- 'pending' (chưa tạo thiệp) | 'completed' (đã tạo thiệp)
  gift_data jsonb, -- Dữ liệu thiệp do khách hàng tự tay custom (ảnh, voice, letter, pin...)
  email_sent boolean default false,
  created_at timestamptz default now(),
  completed_at timestamptz
);

-- Upgrade script if table already exists
alter table public.gift_products add column if not exists creator_key text not null default '';
alter table public.gift_products add column if not exists unlock_pin text not null default '';
-- Hashes are longer than the old varchar columns, and the old '2010' default must go.
alter table public.gift_products alter column creator_key type text;
alter table public.gift_products alter column unlock_pin type text;
alter table public.gift_products alter column unlock_pin set default '';

-- 2. Indexes for fast query lookup
create index if not exists idx_gift_products_token on public.gift_products (token);
create index if not exists idx_gift_products_customer_email on public.gift_products (customer_email);
create index if not exists idx_gift_products_status on public.gift_products (status);
create index if not exists idx_gift_products_created_at on public.gift_products (created_at desc);

-- 3. Row Level Security: ENABLED with NO public policies.
-- The anon key can read/write nothing. Only the server (service-role key, which bypasses RLS)
-- touches this table, and it decides what each caller may see.
alter table public.gift_products enable row level security;

-- Remove the old wide-open policies if an earlier version of this script created them.
drop policy if exists "Allow public read by token" on public.gift_products;
drop policy if exists "Allow public insert" on public.gift_products;
drop policy if exists "Allow public update" on public.gift_products;

-- 4. Failed-attempt counters (brute-force lockout: 5 wrong codes -> locked 15 minutes).
create table if not exists public.access_attempts (
  key text primary key,                 -- e.g. 'gift:open:KP-2010-XXXXXX' or 'admin:username'
  failures integer not null default 0,
  locked_until timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.access_attempts enable row level security; -- no policies: server only

-- 5. Table privileges for the Data API.
-- With "Automatically expose new tables" turned off, Supabase no longer grants anything by default,
-- so the server role needs explicit grants. anon/authenticated get nothing (defence in depth on top of RLS).
revoke all on public.gift_products from anon, authenticated;
revoke all on public.access_attempts from anon, authenticated;
grant select, insert, update, delete on public.gift_products to service_role;
grant select, insert, update, delete on public.access_attempts to service_role;

-- 6. Bracelet chains sold at the counter (name + price), managed from the admin "Sản phẩm" tab.
-- Safe to run more than once: the starting chains are only inserted when missing.
create table if not exists public.chains (
  id text primary key,
  name text not null,
  price integer not null check (price >= 0),
  color text not null default '#DCC0C0',
  description text not null default '',
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.chains enable row level security; -- no policies: server only

insert into public.chains (id, name, price, color, description, sort_order) values
  ('silver', 'Bạc Ý S925 Thanh Mảnh',    45000, '#DCC0C0', 'Sáng bóng, tinh xảo, thanh lịch', 0),
  ('rose',   'Vàng Hồng 14K Ấm Áp',      49000, '#FEA095', 'Ngọt ngào, tôn da phái đẹp',      1),
  ('pearl',  'Ngọc Trai Nước Ngọt Mini', 55000, '#FAF0ED', 'Dịu dàng, quý phái, tự nhiên',    2),
  ('cord',   'Dây Dù Kỷ Niệm Bền Bỉ',    35000, '#897172', 'Trẻ trung, cá tính sinh viên',    3)
on conflict (id) do nothing;

revoke all on public.chains from anon, authenticated;
grant select, insert, update, delete on public.chains to service_role;

-- 7. Soft delete for orders: a deleted order is hidden from the lists and reports and its gift
-- stops opening for customers, but the row stays and can be restored from the "Thùng rác" view.
alter table public.gift_products add column if not exists deleted_at timestamptz;
create index if not exists idx_gift_products_deleted_at on public.gift_products (deleted_at);
