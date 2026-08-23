-- SPRINT seed data — basketball (realistic values, no lorem ipsum).
-- Run via `supabase db reset` (seed enabled in config.toml) or manually
-- after the schema migration.

insert into public.sports (id, name, icon, tagline) values
  ('basketball', 'Basketball', 'basketball', 'Own the floor.'),
  ('soccer', 'Soccer', 'football', 'Command the pitch.'),
  ('tennis', 'Tennis', 'tennisball', 'Win the rally.');

/* ─────────── skills (10) ─────────── */

insert into public.skills (sport, code, name, category, description, weight, sort_order) values
  ('basketball', 'shooting',      'Shooting',        'shooting',       'Catch-and-shoot, off-the-dribble and free-throw accuracy.',  0.160, 1),
  ('basketball', 'handling',      'Ball Handling',   'ball-handling',  'Crossover, between-the-legs, control under pressure.',          0.140, 2),
  ('basketball', 'finishing',     'Finishing',       'finishing',      'Layups, weak-hand finishes, contact finishes at the rim.',      0.130, 3),
  ('basketball', 'passing',       'Passing',         'passing',        'Catch-and-deliver accuracy, reads, decision speed.',             0.100, 4),
  ('basketball', 'defense',       'Defense',         'defense',        'Stance, footwork, hands and on-ball containment.',               0.120, 5),
  ('basketball', 'speed',         'Speed',           'athleticism',    'Sprint speed and change-of-pace over short distances.',          0.100, 6),
  ('basketball', 'agility',       'Agility',         'athleticism',    'Lateral quickness, change of direction and foot speed.',         0.090, 7),
  ('basketball', 'explosiveness', 'Explosiveness',   'athleticism',    'First-step burst and jump power.',                                0.090, 8),
  ('basketball', 'reaction',      'Reaction',        'athleticism',    'Anticipation and response time to visual cues.',                 0.040, 9),
  ('basketball', 'decision',      'Decision Making', 'mentality',      'Choosing the right play, quickly, under pressure.',               0.030, 10);

insert into public.skill_prerequisites (skill_id, requires_skill_id)
select s.id, r.id
from public.skills s
join public.skills r on r.sport = s.sport
where s.sport = 'basketball'
  and s.code = 'decision'
  and r.code in ('handling', 'passing');

/* ─── drills (30) ─── */

insert into public.drills (sport, code, name, description, category, skill_code, intensity, duration_s, equipment, premium, difficulty_rating) values
  ('basketball', 'form-focus',          'Form Shooting',         'One hand, perfect arc, set mechanic — 10 makes from the paint.',          'shooting',       'shooting',      'easy',    30,  '["basketball","hoop"]',             false, 900),
  ('basketball', 'free-throw-ladder',   'Free Throw Ladder',     'Rack of 5, step off the line after every make; 10 straight.',            'shooting',       'shooting',      'medium',  20,  '["basketball","hoop"]',             false, 1050),
  ('basketball', 'spot-up-volume',      'Spot-Up Volume',        'Catch and shoot 25 threes from above the break at game speed.',        'shooting',       'shooting',      'medium',  25,  '["basketball","hoop"]',             false, 1200),
  ('basketball', 'off-dribble-pullup',  'Off-Dribble Pull-Up',   'One or two dribbles into a pull-up from the elbow.',                    'shooting',       'shooting',      'high',    30,  '["basketball","hoop"]',             false, 1300),
  ('basketball', 'double-move-shooting','Double-Move Shooting',  'Hesitation, crossover, pull-up — repeat from three spots.',             'shooting',       'shooting',      'high',    30,  '["basketball","hoop","cones"]',     false, 1400),
  ('basketball', 'pressure-shooting',   'Pressure Shooting',     'Game pace: 10 catch-and-shoots in 90 seconds, must hit 7.',            'shooting',       'shooting',      'high',    90,  '["basketball","hoop"]',             false, 1550),
  ('basketball', 'static-crossover',    'Static Crossover',      'Low, hard, quick crossovers in a stationary stance — eyes up.',       'ball-handling',  'handling',      'easy',    60,  '["basketball"]',                    false, 850),
  ('basketball', 'two-ball-dribble',    'Two-Ball Dribble',      'Dribble two balls simultaneously, then alternating.',                  'ball-handling',  'handling',      'medium',  45,  '["basketball"]',                    false, 1000),
  ('basketball', 'cone-weave',          'Cone Weave',            'Weave through 5 cones at full effort, change of direction each cone.',  'ball-handling',  'handling',      'high',    40,  '["basketball","cones"]',            false, 1150),
  ('basketball', 'dark-zone',           'Dark-Zone Handle',     'Dribble inside a marked zone, no charging — instant response.',        'ball-handling',  'handling',      'medium',  35,  '["basketball","cones"]',            false, 1250),
  ('basketball', 'weak-hand-layups',    'Weak-Hand Layups',     'Every layup with the off hand, off both feet, body protected.',       'finishing',      'finishing',     'medium',  30,  '["basketball","hoop"]',             false, 950),
  ('basketball', 'euro-step',           'Euro-Step Series',     'Catch, rip, wide step, finish — master the two-step release.',         'finishing',      'finishing',     'high',    30,  '["basketball","hoop"]',             false, 1250),
  ('basketball', 'contact-finish',       'Contact Finish',        'Swing through a defender pad — absorb and extend.',                 'finishing',      'finishing',     'high',    30,  '["basketball","hoop","pads"]',      false, 1400),
  ('basketball', 'wall-pass-series',     'Wall Pass Series',     'Chest, bounce, overhead against the wall — both hands.',              'passing',        'passing',       'easy',    45,  '["basketball","wall"]',             false, 900),
  ('basketball', 'read-progressions',    'Read Progressions',    'Three cones, one pass per read — hit the open option as called.',     'passing',        'passing',       'medium',  30,  '["basketball","cones"]',            false, 1100),
  ('basketball', 'no-dribble-game',      'No-Dribble Game',      'Circle drill — one touch, keep moving, no dribble allowed.',         'passing',        'passing',       'high',    60,  '["basketball","wall"]',              false, 1350),
  ('basketball', 'defensive-slides',     'Defensive Slides',     'In stance, slide the court 4x without crossing your feet.',           'defense',        'defense',       'high',    20,  '["cones"]',                         false, 950),
  ('basketball', 'hand-activity',        'Poke & Swipe',         'Poke, deflect, swipe at a live dribbler without losing stance.',     'defense',        'defense',       'medium',  40,  '["basketball"]',                    false, 1100),
  ('basketball', 'shell-defense',        'Shell Defense',        'Four-man shell — help, recover, contest every catch.',                'defense',        'defense',       'high',    60,  '["basketball","cones"]',            false, 1200),
  ('basketball', 'flying-20m',           'Flying 20m Sprint',    '15m build-up into a full 20m sprint — hit max velocity.',            'athleticism',    'speed',         'high',    15,  '["cones"]',                         false, 1050),
  ('basketball', 'resisted-sprint',      'Resisted Sprints',     'Sled or band pulls for 15m — drive the ground, stay tall.',          'athleticism',    'speed',         'high',    15,  '["cones","sled"]',                  false, 1350),
  ('basketball', 't-drill',              'T-Drill',              'Sprint, shuffle, shuffle, sprint back — clean angles.',               'athleticism',    'agility',       'high',    20,  '["cones","stopwatch"]',             false, 1150),
  ('basketball', '5-10-5',               '5-10-5 Shuttle',       'Sprint 5, touch, 10, touch, 5 — beat your last time.',                'athleticism',    'agility',       'high',    15,  '["cones","stopwatch"]',             false, 1000),
  ('basketball', 'vertical-jump',        'Vertical Jump',        'Full approach jump, touch the highest rung.',                          'athleticism',    'explosiveness', 'high',    10,  '["wall"]',                          false, 1100),
  ('basketball', 'broad-jump',           'Broad Jump',           'Standing broad jump — stick the landing, best of 3.',                 'athleticism',    'explosiveness', 'high',    10,  '["cones"]',                         false, 1150),
  ('basketball', 'reaction-lights',      'Reaction Lights',      'Tap the lit cone — 6 taps, beat your time.',                           'athleticism',    'reaction',      'medium',  25,  '["cones"]',                         false, 950),
  ('basketball', 'mirror-tag',           'Mirror Tag',           'Mirror a partner''s breaks — react, don''t predict.',                  'athleticism',    'reaction',      'low',     45,  '["cones"]',                         false, 1050),
  ('basketball', 'read-defender',        'Read the Defender',    'Coach cues shade — go opposite, switch on the counter.',              'mentality',      'decision',      'medium',  45,  '["basketball","cones"]',            false, 1150),
  ('basketball', '2v1-advantage',        '2v1 Advantage',        'Every rep: pass or dribble? Read the space on the second defender.', 'mentality',      'decision',      'medium',  45,  '["basketball","cones"]',            false, 1300),
  ('basketball', 'pro-denial',           'Pro Denial Defense',   'Nobody touches the ball on your side of the floor.',                  'defense',        'defense',       'high',    60,  '["basketball","cones"]',            true, 1500);

/* ─── assessments ─── */

insert into public.assessments (sport, code, title, description, difficulty, minutes, challenge_count, is_initial, premium) values
  ('basketball', 'initial',      'Initial Assessment',   'Ten challenges across every skill. Sets your starting SPRINT rating.', 'beginner',     15, 10, true,  false),
  ('basketball', 'hurdle-1200',  'Competitive Hurdle',   'Raise the bar on the five skills that decide games. Unlocks at 1200.', 'intermediate', 12, 5,  false, false),
  ('basketball', 'hurdle-1600',  'Elite Hurdle',         'The full gauntlet — timing, touch and toughness. Unlocks at 1600.',   'advanced',     22, 5,  false, true);

/* ─── seasons (5) ─── */

insert into public.seasons (sport, name, code, starts_at, ends_at, status, min_rating, rewards) values
  ('basketball', 'Season 1 — The Foundation', 'S1', '2026-01-05', '2026-03-01', 'completed', 400, '{"xp": 1000, "title": "Season 1 Veteran"}'),
  ('basketball', 'Season 2 — The Climb',     'S2', '2026-03-09', '2026-05-03', 'completed', 400, '{"xp": 1500, "title": "Season 2 Climber"}'),
  ('basketball', 'Season 3 — The Breakout',  'S3', '2026-05-11', '2026-07-05', 'completed', 400, '{"xp": 2000, "title": "Season 3 Breakout"}'),
  ('basketball', 'Season 4 — Momentum',      'S4', '2026-07-13', '2026-09-06', 'completed', 400, '{"xp": 2500, "title": "Season 4 Momentum"}'),
  ('basketball', 'Season 5 — Full Sprint',   'S5', '2026-09-14', '2026-11-08', 'active',    400, '{"xp": 3000, "title": "Season 5 Sprinter"}');

/* ─── challenges (50: 10 per season, 8 weekly + 2 premium) ─── */

insert into public.challenges (sport, season_id, title, description, metric, target, reward_xp, premium, starts_at, ends_at, status)
select
  'basketball',
  s.id,
  c.title,
  c.description,
  c.metric,
  jsonb_build_object('n', c.target),
  c.reward_xp,
  c.premium,
  (s.starts_at::date + ((c.week - 1) * 8 + c.day) * interval '1 day')::timestamptz,
  (s.starts_at::date + ((c.week - 1) * 8 + c.day + 6) * interval '1 day')::timestamptz,
  'active'
from public.seasons s
cross join (values
  (1,  1, 'Weekly Scoring Burst',      'Land 300 points of makes at your target intensity.',        'reps',    300, 60,  false),
  (1,  2, 'Handle Hour',               'Log 40 minutes of ball-handling work this week.',           'minutes', 40,  50,  false),
  (1,  3, 'Rim Attack',               'Finish 50 rim attempts by Sunday.',                          'reps',    50,  50,  false),
  (1,  4, 'Free Throw Streak',        'Hit 25 consecutive free throws in one session.',             'reps',    25,  100, true),
  (2,  5, 'Broke the Streak',         'Beat your personal best in any training drill.',             'reps',    1,   50,  false),
  (2,  6, 'Iron Defense',             '15 consecutive clean defensive slides.',                      'reps',    15,  60,  false),
  (2,  7, 'Decision Day',             '5 read-the-game reps with 100% correct picks.',               'reps',    5,   60,  false),
  (2,  8, 'Rim Attack',               'Finish 60 rim attempts over the week.',                       'reps',    60,  60,  false),
  (3,  9, 'Explosive Week',           '10 vertical jump sessions; touch your max 5 times.',          'reps',    5,   60,  false),
  (3, 10, 'Lockdown Weekend',         'Win 10 shell-defense rounds with a stop.',                    'reps',    10,  70,  true)
) as c(week, day, title, description, metric, target, reward_xp, premium)
where s.code = 'S5';

/* ─── equipment & reference rows ─── */

insert into public.equipment (sport, name, slug, category, icon) values
  ('basketball', 'Basketball',       'basketball', 'ball',     'basketball'),
  ('basketball', 'Court / Hoop',     'hoop',       'facility', 'business'),
  ('basketball', 'Cones',            'cones',      'gear',     'flag'),
  ('basketball', 'Wall',             'wall',       'facility', 'business'),
  ('basketball', 'Sled or Bands',    'sled',       'gear',     'gym'),
  ('basketball', 'Stopwatch',        'stopwatch',  'gear',     'timer'),
  ('basketball', 'Defensive Pads',   'pads',       'gear',     'shield');

insert into public.training_goals (sport, code, name, description, metric) values
  ('basketball', 'all-around', 'All-Around Dominance', 'No weaknesses. Raise the whole game.',        'improvement'),
  ('basketball', 'scoring',    'Scoring Machine',      'Shooting, finishing, space — score at will.', 'improvement'),
  ('basketball', 'playmaker',  'Floor General',        'Handle pressure and set everyone up.',          'improvement'),
  ('basketball', 'athletic',   'Athletic Peak',        'Speed, explosiveness and conditioning.',        'improvement'),
  ('basketball', 'lockdown',   'Lockdown Defender',    'Become the player opponents avoid.',            'improvement');