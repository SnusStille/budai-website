/**
 * Admin API — Labs notifications
 *
 * GET → list unread + recent notifications
 * PATCH → mark as read
 */
import { NextRequest, NextResponse } from "next/server";
import { serviceClient, isAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = serviceClient();
  if (!sb) {
    return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
  }

  const { data: items } = await sb
    .from("labs_notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return NextResponse.json({ items: items || [] });
}

export async function PATCH(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = serviceClient();
  if (!sb) {
    return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
  }

  try {
    const body = await req.json();

    if (body?.all) {
      await sb
        .from("labs_notifications")
        .update({ is_read: true })
        .eq("is_read", false);
    } else if (body?.id) {
      await sb
        .from("labs_notifications")
        .update({ is_read: true })
        .eq("id", body.id);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
}
