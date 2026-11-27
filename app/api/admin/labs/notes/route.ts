/**
 * Admin API — Labs project notes
 *
 * POST { projectId, body }  → add a note
 * DELETE ?id=...            → delete a note
 */
import { NextRequest, NextResponse } from "next/server";
import { serviceClient, isAdmin } from "@/lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = serviceClient();
  if (!sb) {
    return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
  }

  try {
    const body = await req.json();
    const projectId = body?.projectId;
    const noteBody = typeof body?.body === "string" ? body.body.trim() : "";

    if (!projectId || typeof projectId !== "string") {
      return NextResponse.json({ error: "Project ID required." }, { status: 400 });
    }
    if (!noteBody || noteBody.length < 1) {
      return NextResponse.json({ error: "Note cannot be empty." }, { status: 400 });
    }
    if (noteBody.length > 4000) {
      return NextResponse.json({ error: "Note too long (max 4000 characters)." }, { status: 400 });
    }

    const { data: note, error } = await sb
      .from("labs_notes")
      .insert({
        project_id: projectId,
        body: noteBody,
        author: "admin",
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Update note count - fetch current count and increment
    const { data: project } = await sb
      .from("labs_projects")
      .select("admin_notes_count")
      .eq("id", projectId)
      .maybeSingle();

    const currentCount = project?.admin_notes_count ?? 0;
    await sb
      .from("labs_projects")
      .update({ admin_notes_count: currentCount + 1, is_read: false })
      .eq("id", projectId);

    return NextResponse.json({ note });
  } catch (err) {
    return NextResponse.json({ error: "Failed to save note." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const sb = serviceClient();
  if (!sb) {
    return NextResponse.json({ error: "Database unavailable." }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Note ID required." }, { status: 400 });
  }

  // Get the note to find project_id before deleting
  const { data: note } = await sb
    .from("labs_notes")
    .select("project_id")
    .eq("id", id)
    .maybeSingle();

  if (!note) {
    return NextResponse.json({ error: "Note not found." }, { status: 404 });
  }

  await sb.from("labs_notes").delete().eq("id", id);

  // Decrement note count
  const { data: project } = await sb
    .from("labs_projects")
    .select("admin_notes_count")
    .eq("id", note.project_id)
    .maybeSingle();

  const currentCount = project?.admin_notes_count ?? 1;
  await sb
    .from("labs_projects")
    .update({ admin_notes_count: Math.max(0, currentCount - 1) })
    .eq("id", note.project_id);

  return NextResponse.json({ success: true });
}
