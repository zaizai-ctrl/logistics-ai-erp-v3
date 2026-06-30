create extension if not exists pgcrypto;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  name text default '',
  phone text default '',
  tracking_number text not null unique,
  product_raw text default '',
  product_standard text default '',
  amount numeric(12,2) default 0,
  cost numeric(12,2) default 0,
  status text not null default '待入库',
  remark text default '',
  created_at timestamptz not null default now(),
  constraint orders_status_check check (
    status in ('待入库', '已入库', '待收款', '已收款', '待打款', '已完成')
  )
);

create table if not exists product_library (
  id bigint generated always as identity primary key,
  keyword text not null,
  product_name text not null,
  default_amount numeric(12,2) default 0,
  cost_price numeric(12,2) default 0
);

create table if not exists inventory (
  id bigint generated always as identity primary key,
  product text not null,
  purchase_price numeric(12,2) default 0,
  qty integer default 0,
  sold_qty integer default 0,
  stock_qty integer default 0,
  profit numeric(12,2) default 0
);

create table if not exists finance_summary (
  id integer primary key default 1,
  total_purchase numeric(14,2) default 0,
  total_sales numeric(14,2) default 0,
  pending_payment numeric(14,2) default 0,
  pending_receive numeric(14,2) default 0,
  profit numeric(14,2) default 0
);

create table if not exists logs (
  id bigint generated always as identity primary key,
  action text not null,
  detail text default '',
  created_at timestamptz not null default now()
);

insert into finance_summary (id, total_purchase, total_sales, pending_payment, pending_receive, profit)
values (1, 0, 0, 0, 0, 0)
on conflict (id) do nothing;

insert into product_library (keyword, product_name, default_amount, cost_price)
values
  ('苹果手表,watch,s9,apple watch', 'Apple Watch Series 9 45mm', 2599, 2100),
  ('iphone 15 pro max,苹果15promax,15pm', 'iPhone 15 Pro Max 256G', 7999, 7200),
  ('ipad air,平板air', 'iPad Air 11-inch', 4399, 3900),
  ('戴森吹风机,dyson', 'Dyson Supersonic', 2699, 2200)
on conflict do nothing;
