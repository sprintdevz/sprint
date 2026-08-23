// Process-Assessment edge function.
// Receives completed assessment attempt results (per-challenge scores),
// calibrates the initial rating server-side, writes per-skill ratings,
// overall ratings and the definitive ELO reveal values.

import { createClient } from "jsr:@supabase/supabase-js@2";

interface ProcessBody {
  athleteId: string;
  assessmentId: string;
  /** skillCode → normalized score 0..1 */
  scores: Record<string, number>;
  /** ISO started_at from the attempt row. */
  startedAt: string;
  /** Optional: 6-digit assessment pin (non-secret for dev builds). */
  pin?: string;
}

const INITIAL = 1000;
const MIN = 300;
const MAX = 3000;

function clamp(v: number, lo: number, hi: number) { return Math.min(hi, Math.max(lo, v)); }

export default async function (req: Request, ctx: Context): Promise<Response> {
  const headers = {
    "Access-Control-Allow-Origin": req.headers.get("origin") ?? "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  if (req.method === "OPTIONS") return new Response("ok", { headers });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return json({ error: "Missing auth" }, 401, headers);
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return json({ error: "Unauthorized" }, 401, headers);

    const body = (await req.json()) as ProcessBody;
    const { data: athlete } = await supabase.from("athletes")
      .select("id, user_id, sport")
      .eq("id", body.athleteId).single();
    if (!athlete || athlete.user_id !== user.id) return json({ error: "Forbidden" }, 403, headers);

    // Load skill weights for the sport to compute the overall rating.
    const { data: skills } = await supabase.from("skills")
      .select("code, weight").eq("sport", athlete.sport);

    const weights = new Map((skills ?? []).map((s) => [s.code, Number(s.weight)]));
    let weightedSum = 0;
    let weightTotal = 0;
    const skillRatings: Record<string, number> = {};
    for (const [code, raw] of Object.entries(body.scores)) {
      const score = clamp(Number(raw), 0, 1);
      const rating = Math.round(clamp(INITIAL - 400 + 800 * score, MIN, MAX));
      skillRatings[code] = rating;
      const w = weights.get(code) ?? 0.1;
      weightedSum += rating * w;
      weightTotal += w;
    }
    const overallRating = Math.round(weightTotal > 0 ? weightedSum / weightTotal : INITIAL);

    // Upsert athlete_ratings rows (overall + per-skill) + history entries.
    const rows = [
      { athlete_id: body.athleteId, scope: "overall", focus: null, rating: overallRating, deviation: 230, games: 1, provisional: true, peak: overallRating },
      ...Object.entries(skillRatings).map(([code, rating]) => ({
        athlete_id: body.athleteId, scope: "skill", focus: code, rating, deviation: 230, games: 1, provisional: true, peak: rating,
      })),
    ];
    const { error: upsertError } = await supabase.from("athlete_ratings").upsert(rows, {
      onConflict: "athlete_id,scope,focus",
    });
    if (upsertError) throw upsertError;

    const history = [
      { athlete_id: body.athleteId, scope: "overall", focus: null, rating_before: INITIAL, rating_after: overallRating, delta: overallRating - INITIAL, deviation_after: 230, event_type: "calibration" },
      ...Object.entries(skillRatings).map(([code, rating]) => ({
        athlete_id: body.athleteId, scope: "skill", focus: code, rating_before: INITIAL, rating_after: rating, delta: rating - INITIAL, deviation_after: 230, event_type: "calibration",
      })),
    ];
    const { error: historyError } = await supabase.from("rating_history").insert(history);
    if (historyError) throw historyError;

    // Insert per-skill athlete_skills rows.
    const { error: skillsError } = await supabase.from("athlete_skills").upsert(
      Object.entries(skillRatings).map(([code, rating]) => ({
        athlete_id: body.athleteId,
        skill_code: code,
        rating,
        deviation: 230,
        mastery: Math.max(0, Math.min(1, (rating - 600) / 1200)),
        trend: 0,
        attempts: 1,
        personal_best: rating,
        last_played_at: new Date().toISOString(),
      })),
      { onConflict: "athlete_id,skill_code" },
    );
    if (skillsError) throw skillsError;

    return json({
      overallRating,
      skillRatings,
      strongestSkill: Object.entries(skillRatings).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
      biggestOpportunity: Object.entries(skillRatings).sort((a, b) => a[1] - b[1])[0]?.[0] ?? null,
    }, 200, headers);
  } catch (e) {
    console.error("process-assessment", e);
    return json({ error: e instanceof Error ? e.message : "Internal error" }, 500, headers);
  }
}

function json(obj: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(obj), { status, headers: { ...headers, "Content-Type": "application/json" } });
}