import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Stille-only admin read of product conversations.
 * Auth: x-admin-key header must match ADMIN password (same as /admin UI).
 * Uses service role — never expose this key to the browser beyond the admin gate.
 */

function adminPassword() {
  return process.env.NEXT_PUBLIC_ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "Daylightshere76";
}

function serviceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!url || !key || url.includes("YOUR_PROJECT")) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

function authorized(req: NextRequest) {
  const h = req.headers.get("x-admin-key") || "";
  return h.length > 0 && h === adminPassword();
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = serviceClient();
  if (!sb) {
    return NextResponse.json(
      {
        error: "Service role not configured",
        hint: "Set SUPABASE_SERVICE_ROLE_KEY on the server for admin conversation reads.",
        conversations: [],
      },
      { status: 503 }
    );
  }

  const id = req.nextUrl.searchParams.get("id");
  const q = (req.nextUrl.searchParams.get("q") || "").trim();
  const limit = Math.min(80, Math.max(1, Number(req.nextUrl.searchParams.get("limit")) || 40));

  try {
    if (id) {
      const { data: convo, error: cErr } = await sb
        .from("conversations")
        .select("id,user_id,title,created_at,updated_at,archived,pinned")
        .eq("id", id)
        .maybeSingle();
      if (cErr || !convo) {
        return NextResponse.json({ error: cErr?.message || "Not found" }, { status: 404 });
      }
      const { data: profile } = await sb
        .from("profiles")
        .select("email,display_name")
        .eq("id", convo.user_id)
        .maybeSingle();
      const { data: messages } = await sb
        .from("messages")
        .select("id,role,content,image_url,generated_image_url,created_at,meta")
        .eq("conversation_id", id)
        .order("created_at", { ascending: true })
        .limit(200);
      return NextResponse.json({
        conversation: {
          ...convo,
          email: profile?.email || null,
          display_name: profile?.display_name || null,
        },
        messages: messages || [],
      });
    }

    let query = sb
      .from("conversations")
      .select("id,user_id,title,created_at,updated_at,archived,pinned")
      .eq("archived", false)
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (q) {
      query = query.ilike("title", `%${q}%`);
    }

    const { data: convos, error } = await query;
    if (error) {
      return NextResponse.json({ error: error.message, conversations: [] }, { status: 500 });
    }

    const userIds = Array.from(new Set((convos || []).map((c) => c.user_id as string)));
    const { data: profiles } = userIds.length
      ? await sb.from("profiles").select("id,email,display_name").in("id", userIds)
      : { data: [] as { id: string; email: string | null; display_name: string | null }[] };

    const pmap = new Map((profiles || []).map((p) => [p.id, p]));

    // message counts
    const withMeta = await Promise.all(
      (convos || []).map(async (c) => {
        const { count } = await sb
          .from("messages")
          .select("id", { count: "exact", head: true })
          .eq("conversation_id", c.id);
        const p = pmap.get(c.user_id);
        return {
          ...c,
          message_count: count ?? 0,
          email: p?.email || null,
          display_name: p?.display_name || null,
        };
      })
    );

    return NextResponse.json({ conversations: withMeta });
  } catch (e) {
    console.error("[admin/conversations]", e);
    return NextResponse.json({ error: "Failed", conversations: [] }, { status: 500 });
  }
}
