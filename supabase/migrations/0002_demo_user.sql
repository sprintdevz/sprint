-- Demo athlete for local development (dev only — delete before production).
-- Creates a demo auth user + athlete + ratings so the app is explorable
-- immediately after `supabase db reset` + sign-in with demo@sprint.dev / demo1234.

insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, aud, role)
values (
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000000',
  'demo@sprint.dev',
  crypt('demo1234', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{"full_name": "Demo Athlete"}',
  'authenticated',
  'authenticated'
) on conflict (id) do nothing;

insert into public.profiles (id, email, username, full_name)
values ('00000000-0000-0000-0000-000000000001', 'demo@sprint.dev', 'demo', 'Demo Athlete')
on conflict (id) do nothing;

insert into public.athletes (id, user_id, sport, position, experience_years, goal, training_frequency)
values (
  '00000000-0000-0000-0000-000000000002',
  '00000000-0000-0000-0000-000000000001',
  'basketball', 'Point Guard', 2, 'playmaker', 3
) on conflict (id) do nothing;

-- Rating snapshot (mirrors a calibrated athlete).
insert into public.athlete_ratings (athlete_id, scope, focus, rating, deviation, games, provisional, peak) values
  ('00000000-0000-0000-0000-000000000002', 'overall', null, 1358, 64, 14, false, 1381),
  ('00000000-0000-0000-0000-000000000002', 'skill', 'shooting', 1412, 58, 14, false, 1430),
  ('00000000-0000-0000-0000-000000000002', 'skill', 'handling', 1331, 61, 12, false, 1355),
  ('00000000-0000-0000-0000-000000000002', 'skill', 'finishing', 1205, 70, 9, false, 1220),
  ('00000000-0000-0000-0000-000000000002', 'skill', 'defense', 1172, 74, 8, false, 1180),
  ('00000000-0000-0000-0000-000000000002', 'skill', 'decision', 1104, 82, 6, true, 1104)
on conflict (athlete_id, scope, focus) do nothing;

insert into public.streaks (athlete_id, current, longest, last_active) values
  ('00000000-0000-0000-0000-000000000002', 7, 12, to_char(now(), 'YYYY-MM-DD'))
on conflict (athlete_id) do nothing;