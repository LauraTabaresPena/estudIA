-- Study Companion · Ejecuta este script una vez en SQL Editor de Supabase.
-- auth.users y las contraseñas son gestionados exclusivamente por Supabase Auth.
begin;

create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Cada fila representa un hito del plan. El contenido admite Markdown y HTML seguro.
create table public.study_plans (
  user_id uuid not null references public.users(id) on delete cascade,
  id text not null check (char_length(id) between 1 and 100),
  title text not null check (char_length(title) between 1 and 160),
  body_markdown text not null default '' check (char_length(body_markdown) <= 20000),
  sort_order integer not null default 0,
  completed_at timestamptz,
  primary key (user_id, id)
);

create table public.pomodoro_logs (
  id uuid primary key,
  user_id uuid not null references public.users(id) on delete cascade,
  mode text not null check (mode in ('focus', 'short', 'long')),
  duration_seconds integer not null check (duration_seconds between 60 and 10800),
  started_at timestamptz not null,
  completed_at timestamptz not null,
  check (completed_at >= started_at)
);

create index pomodoro_logs_user_completed_idx
  on public.pomodoro_logs (user_id, completed_at desc);
-- La PK compuesta de study_plans ya indexa user_id para filtros y RLS.

alter table public.users enable row level security;
alter table public.study_plans enable row level security;
alter table public.pomodoro_logs enable row level security;

revoke all on public.users, public.study_plans, public.pomodoro_logs from public, anon, authenticated;
grant usage on schema public to authenticated;
grant select, insert on public.users to authenticated;
grant select, insert, update, delete on public.study_plans to authenticated;
grant select, insert on public.pomodoro_logs to authenticated;

create policy users_select_own on public.users for select to authenticated
  using ((select auth.uid()) = id);
create policy users_insert_own on public.users for insert to authenticated
  with check ((select auth.uid()) = id);

create policy plans_select_own on public.study_plans for select to authenticated
  using ((select auth.uid()) = user_id);
create policy plans_insert_own on public.study_plans for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy plans_update_own on public.study_plans for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy plans_delete_own on public.study_plans for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy logs_select_own on public.pomodoro_logs for select to authenticated
  using ((select auth.uid()) = user_id);
create policy logs_insert_own on public.pomodoro_logs for insert to authenticated
  with check ((select auth.uid()) = user_id);

commit;
