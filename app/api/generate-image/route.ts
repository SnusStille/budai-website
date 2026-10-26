import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { dayKey, limitFor } from "@/lib/limits";

/**
 * Image generation via OpenAI Images API when OPENAI_API_KEY is set.
 * Returns 501 with clear message if not configured — never fakes images.
 */

async function resolveUser(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) return null;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  if (!url || !anon) return null;
  const sb = createClient(url, anon);
  const { data } = await sb.auth.getUser(auth.slice(7));
  return data.user ?? null;
}

export async function POST(req: NextRequest) {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key || key.length < 10 || key.includes("your-")) {
    return NextResponse.json(
      {
        error:
          "Image generation is not configured. Set OPENAI_API_KEY on the server to enable BudAI image gen.",
        code: "not_configured",
      },
      { status: 501 }
    );
  }

  const user = await resolveUser(req);
  if (!user) {
    return NextResponse.json(
      { error: "Sign in required for image generation.", code: "auth" },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim().slice(0, 1200) : "";
  if (prompt.length < 3) {
    return NextResponse.json({ error: "Prompt required" }, { status: 400 });
  }

  // Quota check before upstream call; increment only after image is generated
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const skey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  const sb = url && skey && !url.includes("YOUR_PROJECT") ? createClient(url, skey) : null;
  const day = dayKey();
  let existingUsage: { messages?: number; images?: number; generations?: number } | null = null;
  if (sb) {
    try {
      const { data } = await sb
        .from("usage_daily")
        .select("*")
        .eq("user_id", user.id)
        .eq("day", day)
        .maybeSingle();
      existingUsage = data;
      const used = data?.generations ?? 0;
      if (used >= limitFor("member", "generations")) {
        return NextResponse.json({ error: "Daily generation limit reached.", code: "limit" }, { status: 429 });
      }
    } catch {
      /* */
    }
  }

  const commitGenerationUsage = async () => {
    if (!sb) return;
    try {
      await sb.from("usage_daily").upsert({
        user_id: user.id,
        day,
        messages: existingUsage?.messages ?? 0,
        images: existingUsage?.images ?? 0,
        generations: (existingUsage?.generations ?? 0) + 1,
      });
    } catch {
      /* */
    }
  };

  try {
    const model = process.env.OPENAI_IMAGE_MODEL || "gpt-image-1";
    const res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        prompt: `High quality, modern aesthetic. ${prompt}`,
        size: "1024x1024",
        n: 1,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("image gen", res.status, errText.slice(0, 400));
      return NextResponse.json({ error: "Image generation failed" }, { status: 502 });
    }

    const data = await res.json();
    const b64 = data?.data?.[0]?.b64_json;
    const urlOut = data?.data?.[0]?.url;
    if (b64) {
      await commitGenerationUsage();
      return NextResponse.json({
        imageBase64: b64,
        mime: "image/png",
        revised: data?.data?.[0]?.revised_prompt || null,
      });
    }
    if (urlOut) {
      await commitGenerationUsage();
      return NextResponse.json({ imageUrl: urlOut, revised: data?.data?.[0]?.revised_prompt || null });
    }
    return NextResponse.json({ error: "No image in response" }, { status: 502 });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Generation error" }, { status: 500 });
  }
}
