-- Create wishlists table
create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  product_id uuid not null,
  created_at timestamptz default now(),
  unique (user_id, product_id)
);

-- Enable RLS
alter table public.wishlists enable row level security;

-- Users can view their own wishlist
create policy "Users can view own wishlist"
  on public.wishlists for select
  using (auth.uid() = user_id);

-- Users can add to their own wishlist
create policy "Users can insert own wishlist"
  on public.wishlists for insert
  with check (auth.uid() = user_id);

-- Users can remove from their own wishlist
create policy "Users can delete own wishlist"
  on public.wishlists for delete
  using (auth.uid() = user_id);

-- Index for fast lookups
create index if not exists idx_wishlists_user_id on public.wishlists(user_id);
create index if not exists idx_wishlists_product_id on public.wishlists(product_id);
