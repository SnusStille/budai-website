import { NextRequest, NextResponse } from "next/server";
import { passwordOk } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const { password } = (await req.json().catch(() => ({}))) as { password?: string };
  if (passwordOk(password || "")) return NextResponse.json({ ok: true });
  await new Promise((r) => setTimeout(r, 600));
  return NextResponse.json({ ok: false }, { status: 401 });
}
