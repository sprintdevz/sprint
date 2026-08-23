// Update-Athlete edge function.
// Validates and applies athlete profile updates (always server-side validation).

import { createClient } from "jsr:@supabase/supabase-js@2";

interface UpdateBody {
  athleteId: string;
  patch: Record<string, unknown>;
}

const ALLOWED_FIELDS = [
  "position", "height_cm", "weight_kg", "birth_year",
  "experience_years", "experience_level", "goal",
  "training_frequency",
];

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

    const body = (await req.json()) as UpdateBody;
    const { data: athlete } = await supabase.from("athletes")
      .select("id, user_id, sport")
      .eq("id", body.athleteId).single();
    if (!athlete || athlete.user_id !== user.id) return json({ error: "Forbidden" }, 403, headers);

    const clean: Record<string, unknown> = {};
    for (const key of Object.keys(body.patch)) {
      if (!ALLOWED_FIELDS.includes(key)) continue;
      const value = body.patch[key];
      if (value === undefined || value === null || value === "") continue;
      if (key === "height_cm" || key === "weight_kg") {
        const n = Number(value);
        if (!Number.isFinite(n)) continue;
        clean[key] = Math.round(Math.max(30, Math.min(250, n)));
      } else if (key === "experience_years" || key === "training_frequency") {
        const n = Number(value);
        if (!Number.isFinite(n)) continue;
        clean[key] = Math.round(Math.max(0, Math.min(50, n)));
      } else {
        clean[key] = String(value).slice(0, 60);
      }
    }

    const { error } = await supabase.from("athletes").update(clean).eq("id", body.athleteId);
    if (error) throw error;
    return json({ ok: true, updated: clean }, 200, headers);
  } catch (e) {
    console.error("update-athlete", e);
    return json({ error: e instanceof Error ? e.message : "Internal error" }, 500, headers);
  }
}

function json(obj: unknown, status: number, headers: Record<string, string>): Response {
  return new Response(JSON.stringify(obj), { status, headers: { ...headers, "Content-Type": "application/json" } });
}