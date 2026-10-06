import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const sb = serviceClient();
  if (!sb) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const b = (await req.json().catch(() => ({}))) as { kind?: string; message?: string; page?: string };
  const message = String(b.message || "").trim().slice(0, 2000);
  if (message.length < 3) return NextResponse.json({ error: "Too short" }, { status: 400 });
  const kind = ["idea", "bug", "other"].includes(String(b.kind)) ? String(b.kind) : "other";
  const { error } = await sb.from("feedback").insert({ kind, message, page: String(b.page || "").slice(0, 200) });
  if (error) return NextResponse.json({ error: "Could not save" }, { status: 500 });
  return NextResponse.json({ ok: true });
}
