/**
 * Admin API — Labs conversations (those not yet tied to a project)
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

  const limit = Math.min(parseInt(new URL(req.url).searchParams.get("limit") || "50", 10), 200);

  // Get recent conversations that don't yet have projects
  const { data: conversations } = await sb
    .from("labs_conversations")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(limit);

  // Get project conversation IDs to filter
  const { data: projectConvs } = await sb
    .from("labs_projects")
    .select("conversation_id");

  const projectIds = new Set((projectConvs || []).map((p: { conversation_id: string }) => p.conversation_id));

  // For each conversation without a project, get the last user message as preview
  const convosWithoutProjects = (conversations || []).filter(
    (c: { id: string }) => !projectIds.has(c.id)
  );

  const results = [];
  for (const conv of convosWithoutProjects.slice(0, limit)) {
    const { data: messages } = await sb
      .from("labs_messages")
      .select("role, content, created_at")
      .eq("conversation_id", conv.id)
      .eq("role", "user")
      .order("created_at", { ascending: false })
      .limit(1);

    results.push({
      ...conv,
      last_user_message: messages?.[0]?.content?.slice(0, 200) || null,
    });
  }

  return NextResponse.json({ conversations: results });
}
