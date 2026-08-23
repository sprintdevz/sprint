// Generate-Session edge function.
//
// Server-side session generation: reads the athlete profile + skill ratings,
// picks the biggest weakness, and writes a personalized plan row. The client
// also has a mirror generator (src/features/training/generator.ts) used for
// offline previews; this endpoint makes the server the source of truth when
// connectivity exists. Generates a plan_token so a session can only be
// submitted once (prevents duplicate submissions).

import { createClient } from "jsr:@supabase/supabase-js@2";

interface GenerateBody {
  athleteId: string;
  minutes?: number;
}

const Q = Math.LN10 / 400;

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
    const { athleteId, minutes } = await req.json() as GenerateBody;

    const { data: athlete } = await supabase.from("athletes")
      .select("id, user_id, sport, goal")
      .eq("id", athleteId).single();
    if (!athlete || athlete.user_id !== user.id) return json({ error: "Forbidden" }, 403, headers);

    const { data: skills } = await supabase.from("athlete_skills")
      .select("skill_code, rating, deviation, attempts")
      .eq("athlete_id", athleteId);

    const weakest = (skills ?? []).sort((a, b) => a.rating - b.rating)[0];
    const focusSkill = weakest?.skill_code ?? "shooting";

    // Minimal deterministic plan: warmups + 3 challenge blocks on the focus skill.
    const deltaMinutes = Math.round((minutes ?? 25) / 5);
    const plan = {
      focus: focusSkill,
      difficulty: "intermediate",
      blocks: [
        { type: "warmup", durationSec: 300 },
        { type: "challenge", skill: focusSkill, attempts: 10, target: 7 },
        { type: "drill", skill: focusSkill, durationSec: 180 },
        { type: "challenge", skill: focusSkill, attempts: 10, target: 8, harder: true },
        { type: "cooldown", durationSec: 120 },
      ],
      durationMin: minutes ?? 25,
    };

    const planToken = crypto.randomUUID();
    const { data: session, error } = await supabase.from("sessions").insert({
      athlete_id: athleteId,
      sport: athlete.sport,
      focus_skill_code: focusSkill,
      focus_reason: "Weakest skill by rating",
      status: "planned",
      difficulty: "intermediate",
      minutes: deltaMinutes,
      plan,
      plan_token: planToken,
    }).select("id").single();
    if (error) throw error;

    return json({ sessionId: session?.id, plan, planToken }, 200, headers);
  } catch (e) {
    console.error("generate-session", e);
    return json({ error: e instanceof Error ? e.message : "Internal error" }, 500, headers);
  }
}

function json(obj: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(obj), { status, headers: { ...headers, "Content-Type": "application/json" } });
}