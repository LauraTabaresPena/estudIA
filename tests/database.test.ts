import { PGlite } from '@electric-sql/pglite'
import { readFile } from 'node:fs/promises'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

// PostgreSQL real en WASM. Solo se simulan auth.users, roles y auth.uid de Supabase.
const db = new PGlite()
const alice = '11111111-1111-4111-8111-111111111111'
const bob = '22222222-2222-4222-8222-222222222222'

beforeAll(async () => {
  await db.exec(`
    create role anon; create role authenticated;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to authenticated, anon;
    grant execute on function auth.uid() to authenticated, anon;
    insert into auth.users values ('${alice}'), ('${bob}');
  `)
  await db.exec(await readFile(new URL('../supabase/schema.sql', import.meta.url), 'utf8'))
  await db.exec(`
    insert into public.users (id) values ('${alice}'), ('${bob}');
    insert into public.study_plans (user_id, id, title) values ('${alice}', 'a', 'Plan de Alice'), ('${bob}', 'b', 'Plan de Bob');
    set role authenticated;
    select set_config('request.jwt.claim.sub', '${alice}', false);
  `)
}, 30000)
afterAll(async () => { await db.close() })

describe('Esquema y políticas RLS', () => {
  it('solo permite leer el perfil y los hitos propios', async () => {
    expect((await db.query('select id from public.users')).rows).toEqual([{ id: alice }])
    expect((await db.query('select title from public.study_plans')).rows).toEqual([{ title: 'Plan de Alice' }])
  })
  it('permite marcar el hito propio y bloquea cambios en el de otro usuario', async () => {
    await db.query("update public.study_plans set completed_at = now() where id = 'a'")
    expect((await db.query('select completed_at is not null as done from public.study_plans')).rows).toEqual([{ done: true }])
    expect((await db.query("update public.study_plans set title = 'No permitido' where id = 'b' returning id")).rows).toEqual([])
    await expect(db.query(`update public.study_plans set user_id = '${bob}' where id = 'a'`)).rejects.toThrow(/row-level security/i)
    await expect(db.query(`insert into public.study_plans (user_id, id, title) values ('${bob}', 'intruso', 'No permitido')`)).rejects.toThrow(/row-level security/i)
  })
  it('guarda ciclos sin duplicarlos y prohíbe atribuirlos a otro usuario', async () => {
    const logId = '33333333-3333-4333-8333-333333333333'
    const insert = `insert into public.pomodoro_logs values ('${logId}', '${alice}', 'focus', 1500, '2026-10-13T08:00:00Z', '2026-10-13T08:25:00Z')`
    await db.exec(insert)
    await expect(db.exec(insert)).rejects.toThrow(/duplicate key/i)
    await expect(db.exec(`insert into public.pomodoro_logs values ('44444444-4444-4444-8444-444444444444', '${bob}', 'focus', 1500, now(), now())`)).rejects.toThrow(/row-level security/i)
    await expect(db.exec('delete from public.pomodoro_logs')).rejects.toThrow(/permission denied/i)
  })
  it('rechaza duraciones inválidas y acceso anónimo', async () => {
    await expect(db.exec(`insert into public.pomodoro_logs values ('55555555-5555-4555-8555-555555555555', '${alice}', 'focus', 0, now(), now())`)).rejects.toThrow(/check constraint/i)
    await db.exec('set role anon')
    await expect(db.query('select * from public.study_plans')).rejects.toThrow(/permission denied/i)
    await db.exec('set role authenticated')
  })
  it('una segunda cuenta no ve los ciclos de la primera', async () => {
    await db.exec(`select set_config('request.jwt.claim.sub', '${bob}', false)`)
    expect((await db.query('select id from public.pomodoro_logs')).rows).toEqual([])
    expect((await db.query('select title from public.study_plans')).rows).toEqual([{ title: 'Plan de Bob' }])
  })
})
