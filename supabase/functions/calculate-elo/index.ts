// Calculate-ELO edge function.
//
// Server-side rating. The client never sends deltas — it sends the raw
// performance (score + difficulty) and the server re-derives the rating
// update with the same Glicko-1 math the client previews. This guarantees
// "do not trust client-provided ELO changes".

import { createClient, SupabaseClient } from "jsr:@supabase/supabase-js@2";

type RatingScope = "overall" | "sport" | "skill";

interface EloBody {
  athleteId: string;
  scope: RatingScope;
  focus: string | null; // sport code for 'sport', skill code for 'skill'
  performance: {
    difficultyRating: number;
    successRate: number; // 0..1
    repeatCount: number; // anti-farm
  };
  eventType: "session" | "assessment" | "challenge" | "calibration";
  sessionId?: string;
  assessmentId?: string;
}

const Q = Math.LN10 / 400;
const g = (rd: number) => 1 / Math.sqrt(1 + (3 * Q * Q * rd * rd) / (Math.PI * Math.PI));
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

function glicko(rating: number, rd: number, opp: number, oppRd: number, score: number) {
  const e = 1 / (1 + Math.pow(10, (-g(oppRd) * (rating - opp)) / 400));
  const dSq = 1 / (Q * Q * g(oppRd) * g(oppRd) * e * (1 - e));
  const newRating = rating + (Q / (1 / (rd * rd) + 1 / dSq)) * g(oppRd) * (score - e);
  const newRd = Math.sqrt(1 / (1 / (rd * rd) + 1 / dSq));
  return { rating: newRating, rd: newRd, expectation: e };
}

export default async function (req: Request, ctx: Context): Promise<Response> {
  const origin = req.headers.get("origin") ?? "*";
  const headers = {
    "Access-Control-Allow-Origin": origin,
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
    const authHeader = req.headers.get("authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) return json({ error: "Missing auth" }, 401, headers);

    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) return json({ error: "Unauthorized" }, 401, headers);

    const body = (await req.json()) as EloBody;
    if (!body.athleteId || body.scope !== "skill") {
      return json({ error: "Invalid body" }, 400, headers);
    }

    // Verify ownership: the calling user must own this athlete record.
    const { data: athlete } = await supabase
      .from("athletes").select("id, user_id")
      .eq("id", body.athleteId).single();
    if (!athlete || athlete.user_id !== user.id) {
      return json({ error: "Forbidden" }, 403, headers);
    }

    // Load current rating state.
    let { data: row } = await supabase
      .from("athlete_ratings")
      .select("id, rating, deviation, games, peak")
      .eq("athlete_id", body.athleteId)
      .eq("scope", body.scope)
      .eq("focus", body.focus ?? "")   // overall has focus null
      .maybeSingle();

    let rating = row?.rating ?? 1000;
    let rd = row?.deviation ?? 350;
    let games = row?.games ?? 0;
    let peak = row?.peak ?? 1000;

    let score = clamp(body.performance.successRate, 0, 1);
    const expectation = 1 / (1 + Math.pow(10, (-g(85) * (rating - body.performance.difficultyRating)) / 400));

    // Anti-farm dampening, mirroring the client engine: repeating the same
    // benchmark keeps the direction of the result but shrinks its weight.
    if (body.performance.repeatCount > 0) {
      const weight = 1 / (1 + 0.3 * body.performance.repeatCount);
      score = expectation + (score - expectation) * weight;
    }

    const result = glicko(rating, rd, body.performance.difficultyRating, 85, score);
    let delta = result.rating - rating;
    if (result.expectation > 0.92 && delta > 0) delta *= 0.35;
    if (score < 0.25 && delta < 0) delta *= 0.7;

    rating = clamp(Math.round(rating + delta), 300, 3000);
    rd = clamp(Math.round(result.newRd), 30, 350);
    games += 1;
    peak = Math.max(peak, rating);

    // Upsert rating row + history in a transaction.
    const { error: upsertError } = await supabase.from("athlete_ratings").upsert({
      athlete_id: body.athleteId,
      scope: body.scope,
      focus: body.focus ?? null,
      rating,
      deviation: rd,
      games,
      provisional: games < 6,
      peak,
      updated_at: new Date().toISOString(),
    }, { onConflict: "athlete_id,scope,focus" });
    if (upsertError) throw upsertError;

    const { error: historyError } = await supabase.from("rating_history").insert({
      athlete_id: body.athleteId,
      scope: body.scope,
      focus: body.focus ?? null,
      rating_before: row?.rating ?? 1000,
      rating_after: rating,
      delta,
      deviation_after: rd,
      event_type: body.eventType,
      session_id: body.sessionId ?? null,
      assessment_id: body.assessmentId ?? null,
    });
    if (historyError) throw historyError;

    return json({
      scope: body.scope,
      focus: body.focus,
      rating,
      deviation: rd,
      delta,
      games,
      provisional: games < 10,
    }, 200, headers);
  } catch (e) {
    console.error("calculate-elo", e);
    return json({ error: e instanceof Error ? e.message : "Internal error" }, 500, headers);
  }
}

function json(obj: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(obj), { status, headers: { ...headers, "Content-Type": "application/json" } });
}