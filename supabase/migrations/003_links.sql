
begin;

create table if not exists public.links (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null
    references public.profiles(id) on delete cascade,
  title text not null,
  url text not null,
  description text not null default '',
  position integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint links_title_length
    check (char_length(title) between 1 and 100),
  constraint links_description_length
    check (char_length(description) <= 200),
  constraint links_url_length
    check (char_length(url) between 10 and 2048),
  constraint links_url_https_http
    check (url ~* '^https?://[^[:space:]]+$'),
  constraint links_position_nonnegative
    check (position >= 0)
);

create index if not exists links_owner_order_idx
  on public.links(profile_id, position, created_at);

create or replace function public.set_link_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_links_updated_at
  on public.links;

create trigger set_links_updated_at
before update on public.links
for each row execute function
  public.set_link_updated_at();

alter table public.links enable row level security;

revoke all on table public.links from anon;
revoke all on table public.links from authenticated;

grant select, insert, delete on public.links
  to authenticated;

grant update (
  title,
  url,
  description,
  position,
  is_active
) on public.links to authenticated;

create policy links_select_owner
on public.links
for select
to authenticated
using (
  profile_id = (select auth.uid())
);

create policy links_insert_owner
on public.links
for insert
to authenticated
with check (
  profile_id = (select auth.uid())
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.account_status = 'active'
  )
);

create policy links_update_owner
on public.links
for update
to authenticated
using (
  profile_id = (select auth.uid())
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.account_status = 'active'
  )
)
with check (
  profile_id = (select auth.uid())
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.account_status = 'active'
  )
);

create policy links_delete_owner
on public.links
for delete
to authenticated
using (
  profile_id = (select auth.uid())
  and exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.account_status = 'active'
  )
);

-- Reorder a complete set of links atomically.
create or replace function public.reorder_my_links(
  p_ids uuid[]
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_count integer;
  v_unique_count integer;
begin
  if (select auth.uid()) is null then
    raise exception 'Authentication required';
  end if;

  select count(*)
  into v_count
  from public.links
  where profile_id = (select auth.uid());

  select count(distinct x)
  into v_unique_count
  from unnest(p_ids) as x;

  if cardinality(p_ids) <> v_count
    or v_unique_count <> v_count
    or exists (
      select 1
      from unnest(p_ids) as x
      where not exists (
        select 1
        from public.links l
        where l.id = x
          and l.profile_id = (select auth.uid())
      )
    )
  then
    raise exception 'Invalid link order';
  end if;

  update public.links as l
  set position = ordered.ordinality - 1
  from unnest(p_ids) with ordinality as ordered(id, ordinality)
  where l.id = ordered.id
    and l.profile_id = (select auth.uid());
end;
$$;

revoke all on function public.reorder_my_links(uuid[])
  from public, anon;

grant execute on function public.reorder_my_links(uuid[])
  to authenticated;

commit;