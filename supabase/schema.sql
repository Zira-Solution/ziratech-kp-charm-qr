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

-- 8. Charity fund donations, filled automatically by the SePay webhook (bank transfers into the fund account).
-- `sepay_id` is SePay's transaction id: the unique constraint makes webhook retries idempotent.
create table if not exists public.donations (
  id uuid primary key default gen_random_uuid(),
  sepay_id bigint unique not null,
  gateway text not null default '',            -- bank brand name
  account_number text not null default '',
  amount bigint not null check (amount > 0),   -- VND
  content text not null default '',            -- transfer note written by the donor
  reference_code text not null default '',    -- bank reference code
  transaction_date timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_donations_transaction_date on public.donations (transaction_date desc);

alter table public.donations enable row level security; -- no policies: server only
revoke all on public.donations from anon, authenticated;
grant select, insert, update, delete on public.donations to service_role;

-- ==============================================================================
-- 9. Stall sales, imported from the "DOANH THU" sheet by src/scripts/seed-sales.ts.
-- The web records no money: revenue = stall_sales + received donations (all from the DOANH THU sheet).
-- Safe to run more than once.
-- ==============================================================================
create table if not exists public.stall_sales (
  id uuid primary key default gen_random_uuid(),
  sold_on date not null,
  product_name_raw text not null,              -- name exactly as written in the sheet
  category text not null check (category in (
    'bracelet','keychain','keychain_phone','bear_mini','bear','diy','card','flower','blindbox','combo','unclassified'
  )),
  items jsonb,                                  -- list of items when category = 'combo'
  qty integer not null default 1 check (qty > 0),
  unit_price bigint not null check (unit_price >= 0), -- VND
  note text,
  channel text not null default 'stall',
  source_row integer not null,                  -- line number in data/doanh-thu.csv
  part smallint not null default 0,             -- >0 when one sheet line was split into several items
  created_at timestamptz not null default now()
);

-- Re-running the seed never duplicates a line. (Upgrade: older runs used unique (sold_on, source_row).)
alter table public.stall_sales add column if not exists part smallint not null default 0;
alter table public.stall_sales drop constraint if exists stall_sales_sold_on_source_row_key;
create unique index if not exists uq_stall_sales_row on public.stall_sales (sold_on, source_row, part);

create index if not exists idx_stall_sales_sold_on on public.stall_sales (sold_on);

-- 10. Donations: add channel/status, and let cash donations taken at the stall in (no SePay id).
alter table public.donations alter column sepay_id drop not null;
alter table public.donations add column if not exists channel text not null default 'web';
alter table public.donations add column if not exists status text not null default 'received';
alter table public.donations add column if not exists donated_on date;
alter table public.donations add column if not exists source_row integer;
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'donations_channel_check') then
    alter table public.donations add constraint donations_channel_check check (channel in ('web', 'stall'));
  end if;
end $$;
create unique index if not exists uq_donations_stall_row on public.donations (donated_on, source_row);

-- 11. Money handed over to the shelter. `transferred_at` stays null when the date is unknown.
create table if not exists public.fund_transfers (
  id uuid primary key default gen_random_uuid(),
  amount bigint not null check (amount > 0),    -- VND
  proof_path text,
  transferred_at timestamptz,
  note text not null default '',
  source text unique,                           -- idempotency key for imported rows
  created_at timestamptz not null default now()
);

-- 12. Campaign expenses (cost of goods). Filled only with figures the team provides.
create table if not exists public.campaign_expenses (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  amount bigint not null check (amount >= 0),   -- VND
  note text,
  created_at timestamptz not null default now()
);
alter table public.campaign_expenses add column if not exists spent_on date;
alter table public.campaign_expenses add column if not exists source_row integer; -- line in data/chi-phi.csv
create unique index if not exists uq_campaign_expenses_row on public.campaign_expenses (source_row);

-- 13. Views behind the landing page and the admin sales table.
create or replace view public.fund_by_channel as
  select 'stall'::text as channel, coalesce(sum(unit_price * qty), 0)::bigint as amount, count(*)::bigint as lines
    from public.stall_sales
  union all
  select 'donation_stall', coalesce(sum(amount), 0)::bigint, count(*)::bigint
    from public.donations where status = 'received' and channel = 'stall'
  union all
  select 'donation_web', coalesce(sum(amount), 0)::bigint, count(*)::bigint
    from public.donations where status = 'received' and channel = 'web';

create or replace view public.fund_sales_by_day_category as
  select sold_on, category, sum(qty)::bigint as qty, sum(unit_price * qty)::bigint as amount
    from public.stall_sales
    group by sold_on, category;

create or replace view public.fund_summary as
  select
    (select coalesce(sum(amount), 0) from public.fund_by_channel)::bigint as total_revenue,
    (select coalesce(sum(amount), 0) from public.fund_transfers)::bigint as transferred,
    (select coalesce(sum(amount), 0) from public.campaign_expenses)::bigint as expenses;

-- Server only (service role), like every other table.
alter table public.stall_sales enable row level security;
alter table public.fund_transfers enable row level security;
alter table public.campaign_expenses enable row level security;
revoke all on public.stall_sales, public.fund_transfers, public.campaign_expenses from anon, authenticated;
revoke all on public.fund_by_channel, public.fund_sales_by_day_category, public.fund_summary from anon, authenticated;
grant select, insert, update, delete on public.stall_sales, public.fund_transfers, public.campaign_expenses to service_role;
grant select on public.fund_by_channel, public.fund_sales_by_day_category, public.fund_summary to service_role;
