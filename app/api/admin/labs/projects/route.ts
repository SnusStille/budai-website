/**
 * Admin API — Stilledev Labs projects
 *
 * GET  ?id=...        → single project with messages, notes, snapshots
 * GET  ?status=...    → list projects (with optional filters)
 * PATCH { id, fields } → update project fields
 */
import { NextRequest, NextResponse } from "next/server";
import { serviceClient, isAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOWED_UPDATE_FIELDS = [
  "status", "starred", "is_read",
  "contact_name", "contact_email", "contact_phone", "company", "preferred_contact",
  "project_title", "project_category", "customer_goal", "target_audience",
  "problem", "proposed_solution", "scope_mvp", "scope_future",
  "budget", "budget_assessment", "timeline", "timeline_assessment",
  "competition", "existing_solutions", "recommended_mvp", "next_steps",
  "technical_complexity", "admin_assignee", "priority_score",
  "priority_strengths", "priority_concerns", "priority_recommendation",
  "internal_notes", "next_recommended_action",
];

export async function GET(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = serviceClient();
  if (!sb) {
    return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const status = searchParams.get("status");
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);

  if (id) {
    const { data: project } = await sb
      .from("labs_projects")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const { data: conversation } = await sb
      .from("labs_conversations")
      .select("*")
      .eq("id", project.conversation_id)
      .maybeSingle();

    const { data: messages } = await sb
      .from("labs_messages")
      .select("*")
      .eq("conversation_id", project.conversation_id)
      .order("created_at", { ascending: true });

    const { data: notes } = await sb
      .from("labs_notes")
      .select("*")
      .eq("project_id", id)
      .order("created_at", { ascending: true });

    return NextResponse.json({
      project,
      conversation,
      // Extract latest profile snapshot from conversation for blueprint/confidence display
      profile: conversation?.project_profile || null,
      messages: (messages || []).map((m) => ({
        ...m,
        content: m.content.replace(/\[\[(PROFILE|SUMMARY):[\s\S]*?\]\]/gi, "").trim(),
      })),
      notes: notes || [],
    });
  }

  let query = sb
    .from("labs_projects")
    .select(`
      id, conversation_id, status, starred, contact_name, contact_email, company,
      project_title, project_category, customer_goal, priority_score,
      budget, timeline, created_at, updated_at, contact_collected_at,
      summary_generated_at, is_read, admin_notes_count
    `)
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (category && category !== "all") {
    query = query.eq("project_category", category);
  }

  if (q) {
    const searchTerm = `%${q}%`;
    query = query.or(
      `project_title.ilike.${searchTerm},contact_name.ilike.${searchTerm},contact_email.ilike.${searchTerm},company.ilike.${searchTerm},customer_goal.ilike.${searchTerm}`
    );
  }

  const { data: projects, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  // Enrich with message counts
  const projectsWithCounts = await Promise.all(
    (projects || []).map(async (p) => {
      const { data: conv } = await sb
        .from("labs_conversations")
        .select("message_count, last_message_at")
        .eq("id", p.conversation_id)
        .maybeSingle();
      return {
        ...p,
        message_count: conv?.message_count ?? 0,
        last_message_at: conv?.last_message_at ?? p.updated_at,
      };
    })
  );

  // Status counts
  const statusCounts: Record<string, number> = {};
  const allStatuses = [
    "new_inquiry", "conversation_active", "needs_review", "qualified",
    "meeting_requested", "quote_sent", "accepted", "declined", "completed",
  ];
  for (const s of allStatuses) {
    const { count } = await sb
      .from("labs_projects")
      .select("*", { count: "exact", head: true })
      .eq("status", s);
    statusCounts[s] = count || 0;
  }

  const { count: unreadCount } = await sb
    .from("labs_projects")
    .select("*", { count: "exact", head: true })
    .eq("is_read", false);

  return NextResponse.json({
    projects: projectsWithCounts,
    unreadCount: unreadCount || 0,
    statusCounts,
  });
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
    const id = body?.id;
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Project ID required." }, { status: 400 });
    }

    const fields: Record<string, unknown> = {};
    const source = body.fields || body;
    for (const key of ALLOWED_UPDATE_FIELDS) {
      if (key in source) {
        fields[key] = source[key];
      }
    }

    if (Object.keys(fields).length === 0) {
      return NextResponse.json({ error: "No valid fields to update." }, { status: 400 });
    }

    const { error } = await sb.from("labs_projects").update(fields).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Update failed." }, { status: 500 });
  }
}
