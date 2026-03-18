-- Run this in Supabase SQL Editor to enable the Global Naam Jap Counter

-- 1. Create the counter table
create table if not exists naam_jap_counter (
  id int primary key default 1,
  count bigint not null default 0,
  constraint single_row check (id = 1)
);

-- 2. Seed with an initial count (feels alive from day 1)
insert into naam_jap_counter (id, count)
values (1, 247381)
on conflict (id) do nothing;

-- 3. Atomic increment function (avoids race conditions)
create or replace function increment_naam_jap()
returns bigint
language sql
security definer
as $$
  update naam_jap_counter
  set count = count + 1
  where id = 1
  returning count;
$$;

-- 4. Allow public read/write (anonymous users can increment)
alter table naam_jap_counter enable row level security;

create policy "allow public read" on naam_jap_counter
  for select using (true);

create policy "allow public increment via rpc" on naam_jap_counter
  for update using (true);

grant execute on function increment_naam_jap() to anon, authenticated;
