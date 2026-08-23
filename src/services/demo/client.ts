/**
 * Demo client — a Supabase-shaped API backed by the DemoStore.
 *
 * It implements exactly the surface the app consumes (auth + a thenable
 * query builder + storage stubs) so `getSupabase()` can hand feature APIs a
 * working client in demo mode. The typed boundary is sealed at
 * src/services/supabase.ts where the client is cast to SupabaseClient.
 *
 * This file intentionally uses loose internal types: it is a bridge between
 * the app and a fake API, so exact typing would only obscure the mapping.
 */

import { DemoStore, makeId, type DbRow, type DemoSession, type DemoUser } from './store';

/* ── unique keys per table for upserts (mirrors schema constraints) ── */

const UPSERT_KEYS: Record<string, string[]> = {
  profiles: ['id'],
  subscriptions: ['user_id'],
  challenge_attempts: ['challenge_id', 'athlete_id'],
  athlete_equipment: ['athlete_id', 'equipment_id'],
  athlete_ratings: ['athlete_id', 'scope', 'focus'],
  athlete_skills: ['athlete_id', 'skill_code'],
  streaks: ['user_id'],
};

function uniqueKeyFor(table: string): string[] {
  return UPSERT_KEYS[table] ?? ['id'];
}

/* ── filters ── */

interface Filter {
  column: string;
  op: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in';
  value: unknown;
}

function parseOr(raw: string): Filter[] {
  return raw
    .split(',')
    .filter(Boolean)
    .map((term) => {
      const [column, op, ...rest] = term.trim().split('.');
      return { column: column ?? '', op: (op ?? 'eq') as Filter['op'], value: rest.join('.') };
    });
}

/** Order two values: numbers numerically, everything else lexically (ISO dates). */
function compareValues(a: unknown, b: unknown): number {
  if (a === b) return 0;
  if (a == null) return -1;
  if (b == null) return 1;
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b));
}

function matches(row: DbRow, filters: Filter[]): boolean {
  return filters.every((f) => {
    const actual = row[f.column];
    switch (f.op) {
      case 'eq': return actual === f.value;
      case 'neq': return actual !== f.value;
      case 'gt': return actual != null && f.value != null && compareValues(actual, f.value) > 0;
      case 'gte': return actual != null && f.value != null && compareValues(actual, f.value) >= 0;
      case 'lt': return actual != null && f.value != null && compareValues(actual, f.value) < 0;
      case 'lte': return actual != null && f.value != null && compareValues(actual, f.value) <= 0;
      case 'in': return Array.isArray(f.value) && f.value.includes(actual);
      default: return true;
    }
  });
}

function project(row: DbRow, columns: string): DbRow {
  const cols = columns
    .split(',')
    .map((c) => c.trim())
    .filter((c) => c.length > 0 && c !== '*');
  if (cols.length === 0) return { ...row };
  const out: DbRow = {};
  for (const c of cols) {
    if (c in row) out[c] = row[c];
  }
  return out;
}

function tableRows(store: DemoStore, table: string): DbRow[] {
  // Unknown tables behave like empty relations (no crash).
  store.tables[table] = store.tables[table] ?? [];
  return store.tables[table]!;
}

/* ── auth → supabase-shaped user/session ── */

function supabaseUser(user: DemoUser): Record<string, unknown> {
  const now = new Date().toISOString();
  return {
    id: user.id,
    aud: 'authenticated',
    role: 'authenticated',
    email: user.email,
    email_confirmed_at: now,
    phone: null,
    created_at: now,
    updated_at: now,
    app_metadata: { provider: 'email' },
    user_metadata: { full_name: user.fullName, username: user.username },
    identities: [
      {
        id: user.id,
        user_id: user.id,
        identity_data: { sub: user.id, email: user.email },
        provider: 'email',
        last_sign_in_at: now,
        created_at: now,
        updated_at: now,
      },
    ],
    is_anonymous: false,
  };
}

function supabaseSession(session: DemoSession | null): Record<string, unknown> | null {
  if (!session) return null;
  return {
    access_token: session.accessToken,
    refresh_token: session.refreshToken,
    expires_at: Math.floor(Date.now() / 1000) + 2_592_000,
    expires_in: 2_592_000,
    token_type: 'bearer',
    user: supabaseUser(session.user),
  };
}

type AuthListener = (event: string, session: { user: Record<string, unknown> } | null) => void;

/* ── query builder ── */

type BuilderMode = 'select' | 'insert' | 'update' | 'upsert';

export class DemoBuilder {
  private filters: Filter[] = [];
  private orderBy: { column: string; ascending: boolean } | null = null;
  private limitN: number | null = null;
  private selected = '*';
  private counting = false;
  private singleMode: 'none' | 'maybe' | 'single' = 'none';
  private payload: unknown = null;

  constructor(
    private store: DemoStore,
    private table: string,
    private mode: BuilderMode,
  ) {}

  private push(op: Filter['op'], column: string, value: unknown): this {
    this.filters.push({ column, op, value });
    return this;
  }

  eq(column: string, value: unknown): this {
    return this.push('eq', column, value);
  }
  neq(column: string, value: unknown): this {
    return this.push('neq', column, value);
  }
  gt(column: string, value: unknown): this {
    return this.push('gt', column, value);
  }
  gte(column: string, value: unknown): this {
    return this.push('gte', column, value);
  }
  lt(column: string, value: unknown): this {
    return this.push('lt', column, value);
  }
  lte(column: string, value: unknown): this {
    return this.push('lte', column, value);
  }
  in(column: string, values: unknown[]): this {
    return this.push('in', column, values);
  }
  or(raw: string): this {
    for (const f of parseOr(raw)) this.filters.push(f);
    return this;
  }

  order(column: string, opts?: { ascending?: boolean }): this {
    this.orderBy = { column, ascending: opts?.ascending ?? true };
    return this;
  }

  limit(n: number): this {
    this.limitN = n;
    return this;
  }

  maybeSingle(): this {
    this.singleMode = 'maybe';
    return this;
  }

  single(): this {
    this.singleMode = 'single';
    return this;
  }

  select(columns: string, opts?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }): this {
    this.selected = columns;
    if (opts?.count) this.counting = true;
    return this;
  }

  insert(value: unknown): this {
    this.payload = value;
    this.mode = 'insert';
    return this;
  }

  update(value: unknown): this {
    this.payload = value;
    this.mode = 'update';
    return this;
  }

  upsert(value: unknown): this {
    this.payload = value;
    this.mode = 'upsert';
    return this;
  }

  /* ── thenable execution ── */

  then<TResult1 = unknown, TResult2 = never>(
    onfulfilled?: ((value: unknown) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): Promise<TResult1 | TResult2> {
    const result = this.execute();
    return (result instanceof Promise ? result : Promise.resolve(result)).then(onfulfilled, onrejected);
  }

  private execute(): unknown {
    const rows = tableRows(this.store, this.table);

    if (this.counting) {
      const n = rows.filter((r) => matches(r, this.filters)).length;
      return { data: null, count: n, error: null };
    }

    switch (this.mode) {
      case 'insert':
        return this.doWrite(rows, 'insert');
      case 'upsert':
        return this.doWrite(rows, 'upsert');
      case 'update':
        return this.doUpdate(rows);
      default:
        return this.doSelect(rows);
    }
  }

  private doSelect(rows: DbRow[]): unknown {
    if (this.table === 'leaderboards') {
      const scope = this.filters.find((f) => f.column === 'scope')?.value as string | undefined;
      const sport = this.filters.find((f) => f.column === 'sport')?.value as string | undefined;
      const focus = this.filters.find((f) => f.column === 'focus')?.value as string | null | undefined;
      if (scope) this.store.materializeLeaderboard(scope, sport ?? 'basketball', focus ?? null);
    }

    let out = rows.filter((r) => matches(r, this.filters));

    if (this.orderBy) {
      const { column, ascending } = this.orderBy;
      out = [...out].sort((a, b) => {
        const cmp = compareValues(a[column], b[column]);
        return ascending ? cmp : -cmp;
      });
    }
    if (this.limitN !== null && this.limitN >= 0) {
      out = out.slice(0, this.limitN);
    }

    if (this.singleMode === 'single' && out.length !== 1) {
      return { data: null, error: { message: 'PGRST116: The result contains 0 rows', code: 'PGRST116' } };
    }

    if (this.singleMode === 'maybe') {
      return { data: out[0] ? project(out[0], this.selected) : null, error: null };
    }
    return { data: out.map((r) => project(r, this.selected)), error: null };
  }

  private doWrite(rows: DbRow[], mode: 'insert' | 'upsert'): unknown {
    const values = Array.isArray(this.payload) ? this.payload : [this.payload];
    const inserted: DbRow[] = [];

    for (const raw of values) {
      if (raw === null || typeof raw !== 'object') continue;
      const value = raw as DbRow;
      const keys = uniqueKeyFor(this.table);
      let row: DbRow | null = null;

      if (mode === 'upsert') {
        row = rows.find((r) => keys.every((k) => r[k] === value[k])) ?? null;
      } else if (this.table === 'athletes' && typeof value.user_id === 'string') {
        // athletes.user_id is unique — replace rather than duplicate.
        row = rows.find((r) => r.user_id === value.user_id) ?? null;
      }

      if (row) {
        for (const [k, v] of Object.entries(value)) {
          if (v !== undefined) row[k] = v;
        }
        inserted.push(row);
      } else {
        const now = new Date().toISOString();
        const fresh: DbRow = {
          ...value,
          id: value.id ?? makeId(this.table.slice(0, 3)),
          created_at: value.created_at ?? now,
          updated_at: value.updated_at ?? now,
        };
        rows.push(fresh);
        inserted.push(fresh);
      }
    }

    this.store.persist();

    let data: unknown = null;
    if (this.selected !== '*') {
      data =
        this.singleMode !== 'none'
          ? inserted[0]
            ? project(inserted[0], this.selected)
            : null
          : inserted.map((r) => project(r, this.selected));
    }
    if (this.singleMode === 'single' && !inserted[0]) {
      return { data: null, error: { message: 'Insert returned no rows' } };
    }
    return { data, error: null };
  }

  private doUpdate(rows: DbRow[]): unknown {
    const patch = (this.payload ?? {}) as DbRow;
    const matched = rows.filter((r) => matches(r, this.filters));

    if (this.table === 'sessions' && patch.status === 'completed') {
      for (const row of matched) {
        const plan = row.plan as import('@/features/training/types').SessionPlan | null;
        const results = (patch.plan as { results?: Record<string, number> } | null)?.results ?? {};
        const athleteId = row.athlete_id as string;
        const skillCode = row.focus_skill_code as string;
        for (const [k, v] of Object.entries(patch)) row[k] = v;
        if (plan) this.store.applySessionResult(athleteId, skillCode, plan, results);
      }
      this.store.persist();
      return { data: this.shapeUpdated(matched), error: null };
    }

    if (this.table === 'assessment_attempts' && patch.status === 'completed') {
      for (const row of matched) {
        const athleteId = row.athlete_id as string;
        for (const [k, v] of Object.entries(patch)) row[k] = v;
        this.store.applyAssessmentResult(athleteId, row);
      }
      this.store.persist();
      return { data: this.shapeUpdated(matched), error: null };
    }

    for (const row of matched) {
      for (const [k, v] of Object.entries(patch)) {
        if (k !== 'id') row[k] = v;
      }
    }
    this.store.persist();
    return { data: this.shapeUpdated(matched), error: null };
  }

  private shapeUpdated(rows: DbRow[]): unknown {
    if (this.singleMode !== 'none') {
      return rows[0] ? project(rows[0], this.selected) : null;
    }
    return rows.map((r) => project(r, this.selected));
  }
}

/* ── auth ── */

export function createDemoAuth(store: DemoStore): { auth: AuthApi } {
  const listeners = new Set<AuthListener>();

  const emit = (event: string, session: DemoSession | null) => {
    const shaped = session ? ({ user: supabaseUser(session.user) } as Record<string, unknown>) : null;
    for (const cb of listeners) cb(event, shaped as never);
  };

  const emailOf = (email: string): string => email.trim().toLowerCase();

  const userByEmail = (email: string): DemoUser | null => {
    const profile = store.table('profiles').find((p) => p.email === emailOf(email));
    if (!profile) return null;
    return {
      id: profile.id as string,
      email: emailOf(email),
      fullName: (profile.full_name as string | null) ?? (profile.username as string | null) ?? '',
      username: (profile.username as string | null) ?? (profile.id as string),
    };
  };

  const createSession = (user: DemoUser): DemoSession => {
    const session: DemoSession = {
      accessToken: makeId('tok'),
      refreshToken: makeId('tk'),
      user,
    };
    store.saveSession(session);
    return session;
  };

  const provision = (email: string, fullName?: string, username?: string): DemoUser => {
    const local = email.split('@')[0]?.replace(/[^a-z0-9_.-]/gi, '') || 'athlete';
    const user: DemoUser = {
      id: makeId('usr'),
      email,
      fullName: fullName ?? local,
      username: username ?? local,
    };
    store.table('profiles').push({
      id: user.id,
      username: user.username,
      full_name: user.fullName,
      email: user.email,
      avatar_url: null,
    });
    store.persist();
    return user;
  };

  const auth: AuthApi = {
    signUp: async (input: { email: string; password: string; options?: { data?: Record<string, unknown> } }) => {
      const email = emailOf(input.email);
      if (userByEmail(email)) {
        return { data: { user: null, session: null }, error: { message: 'That email is already registered.' } };
      }
      const user = provision(email, input.options?.data?.full_name as string | undefined, input.options?.data?.username as string | undefined);
      const session = createSession(user);
      emit('SIGNED_IN', session);
      return { data: { user: supabaseUser(user), session: supabaseSession(session) }, error: null };
    },

    signInWithPassword: async (input: { email: string; password: string }) => {
      const email = emailOf(input.email);
      // Demo frictionlessness: any email/password signs in; unknown emails
      // are provisioned on the spot (no server to verify against).
      const user = userByEmail(email) ?? provision(email);
      const session = createSession(user);
      emit('SIGNED_IN', session);
      return { data: { user: supabaseUser(user), session: supabaseSession(session) }, error: null };
    },

    signOut: async () => {
      store.saveSession(null);
      emit('SIGNED_OUT', null);
      return { error: null };
    },

    updateUser: async (patch: { password?: string; email?: string }) => {
      const session = store.session;
      if (!session) return { data: { user: null }, error: { message: 'Not signed in' } };
      const user = session.user as DemoUser;
      if (patch.email) user.email = emailOf(patch.email);
      store.persist();
      emit('USER_UPDATED', session);
      return { data: { user: supabaseUser(user) }, error: null };
    },

    getUser: async () => {
      return { data: { user: store.session ? supabaseUser(store.session.user) : null }, error: null };
    },

    getSession: async () => {
      return { data: { session: supabaseSession(store.session) }, error: null };
    },

    onAuthStateChange: (callback: AuthListener) => {
      listeners.add(callback);
      emit('INITIAL_SESSION', store.session);
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              listeners.delete(callback);
            },
          },
        },
      };
    },

    resetPasswordForEmail: async () => ({ data: {}, error: null }),

    resend: async () => ({ data: {}, error: null }),
  };

  return { auth };
}

export interface AuthApi {
  signUp: (input: {
    email: string;
    password: string;
    options?: { data?: Record<string, unknown> };
  }) => Promise<{ data: unknown; error: { message: string } | null }>;
  signInWithPassword: (input: { email: string; password: string }) => Promise<{ data: unknown; error: { message: string } | null }>;
  signOut: () => Promise<{ error: { message: string } | null }>;
  updateUser: (patch: { password?: string; email?: string }) => Promise<{ data: unknown; error: { message: string } | null }>;
  getUser: () => Promise<{ data: { user: unknown } ; error: { message: string } | null }>;
  getSession: () => Promise<{ data: { session: unknown }; error: { message: string } | null }>;
  onAuthStateChange: (callback: AuthListener) => { data: { subscription: { unsubscribe: () => void } } };
  resetPasswordForEmail: () => Promise<{ data: unknown; error: { message: string } | null }>;
  resend: () => Promise<{ data: unknown; error: { message: string } | null }>;
}

/* ── the client ── */

export interface DemoClient {
  auth: AuthApi;
  from: (table: string) => DemoBuilder;
  storage: {
    from: (bucket: string) => {
      upload: (path: string, _blob: unknown) => Promise<{ data: null; error: { message: string } }>;
      getPublicUrl: (path: string) => { data: { publicUrl: string } };
    };
  };
  functions: {
    invoke: (name: string) => Promise<{ data: null; error: { message: string } }>;
  };
  /** Wipe demo data + session and reseed (demo escape hatch). */
  reset: () => void;
}

/** Build the demo client (fresh or from persisted storage). */
export function createDemoClient(): DemoClient {
  const store = new DemoStore();
  const { auth } = createDemoAuth(store);

  return {
    auth,
    from: (table: string) => new DemoBuilder(store, table, 'select'),
    storage: {
      from: (_bucket: string) => ({
        upload: async () => ({ data: null, error: { message: 'Uploads are not available in demo mode.' } }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
    functions: {
      invoke: async () => ({ data: null, error: { message: 'Edge functions are not available in demo mode.' } }),
    },
    reset: () => store.resetDemo(),
  };
}