import { NextResponse } from "next/server";
import { serviceClient } from "@/lib/supabase/service";

/**
 * GET /api/labs/export/[id]/brief
 * Returns a printable HTML version of the project brief.
 * Opens in a new tab; user can Cmd+P / Ctrl+P to save as PDF.
 * Uses service-role auth — same protection as other admin endpoints
 * (must be called from logged-in admin context; we validate by project id).
 *
 * Since this is server-side rendered and meant for admin use only,
 * we pass the conversation id via URL.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = serviceClient();
  if (!supabase) {
    return new NextResponse("Supabase not configured", { status: 500 });
  }

  const { data: project } = await supabase
    .from("labs_projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!project) {
    return new NextResponse("Project not found", { status: 404 });
  }

  const prof = project.project_profile || {};
  const customer = prof.customer || {};
  const feats = prof.key_features || [];
  const niceToHave = prof.nice_to_have_features || [];
  const risks = [...(prof.business_risks || []), ...(prof.technical_risks || [])];

  const esc = (s: any) => String(s ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]!));

  const row = (label: string, value: any) =>
    `<tr><th>${esc(label)}</th><td>${value ? esc(value) : '<span class="muted">—</span>'}</td></tr>`;

  const html = `<!DOCTYPE html>
<html lang="sv">
<head>
<meta charset="utf-8" />
<title>Projektbrief — ${esc(project.project_title || "Utan titel")}</title>
<style>
  @page { size: A4; margin: 20mm 18mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif; color: #111; max-width: 720px; margin: 0 auto; padding: 24px; font-size: 13px; line-height: 1.55; }
  h1 { font-size: 22px; margin: 0 0 4px; letter-spacing: -0.02em; }
  h2 { font-size: 14px; margin: 24px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #e5e5e5; text-transform: uppercase; letter-spacing: 0.06em; font-weight: 600; color: #333; font-size: 11px; }
  .meta { font-size: 11px; color: #666; margin-bottom: 16px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 4px; }
  th { text-align: left; font-weight: 600; width: 140px; padding: 5px 8px 5px 0; color: #444; vertical-align: top; font-size: 11.5px; }
  td { padding: 5px 0; color: #111; }
  ul { margin: 4px 0; padding-left: 18px; }
  li { margin-bottom: 2px; }
  .muted { color: #999; font-style: italic; }
  .rec { background: #f6fbff; border-left: 3px solid #00e5ff; padding: 10px 14px; margin: 6px 0; border-radius: 0 6px 6px 0; }
  .badge { display: inline-block; background: #00e5ff; color: #000; font-size: 9px; font-weight: 700; padding: 2px 7px; border-radius: 3px; text-transform: uppercase; letter-spacing: 0.08em; vertical-align: middle; margin-left: 8px; }
  .footer { margin-top: 40px; padding-top: 12px; border-top: 1px solid #e5e5e5; font-size: 10px; color: #999; text-align: center; }
  @media print { body { padding: 0; } .no-print { display: none; } }
  .no-print button { padding: 8px 16px; background: #00e5ff; color: #000; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; font-size: 12px; }
</style>
</head>
<body>
<div class="no-print" style="text-align:right; margin-bottom:16px;">
  <button onclick="window.print()">Skriv ut / Spara som PDF</button>
</div>

<h1>${esc(project.project_title || "Projektbrief")}<span class="badge">${esc(project.status)}</span></h1>
<div class="meta">
  Skapad ${new Date(project.created_at).toLocaleString("sv-SE")} · Prioritet ${project.priority_score ?? "?"}/100
</div>

<h2>Kund</h2>
<table>
  ${row("Namn", project.contact_name || customer.name)}
  ${row("E-post", project.contact_email)}
  ${row("Telefon", project.contact_phone)}
  ${row("Företag", project.company || customer.company_name)}
  ${row("Typ", customer.type)}
  ${row("Bransch", customer.industry)}
  ${row("Roll", customer.role)}
  ${row("Webb", customer.website)}
</table>

<h2>Projekt</h2>
<table>
  ${row("Kategori", project.project_category || prof.project_category)}
  ${row("Mål", project.customer_goal || prof.customer_goal)}
  ${row("Problem", project.problem || prof.problem)}
  ${row("Målgrupp", project.target_audience || prof.target_audience)}
  ${row("Avsikt", prof.client_intent)}
</table>

<h2>Nödvändiga funktioner</h2>
${feats.length ? `<ul>${feats.map((f: string) => `<li>${esc(f)}</li>`).join("")}</ul>` : '<p class="muted">—</p>'}

${niceToHave.length ? `<h2>Önskade funktioner (kan vänta)</h2><ul>${niceToHave.map((f: string) => `<li>${esc(f)}</li>`).join("")}</ul>` : ""}

<h2>Budget &amp; tid</h2>
<table>
  ${row("Budget", project.budget || prof.budget)}
  ${row("Tidsplan", project.timeline || prof.timeline)}
</table>

${(prof.recommended_mvp || project.recommended_mvp) ? `<h2>Rekommendation</h2><div class="rec">${esc(prof.recommended_mvp || project.recommended_mvp)}</div>` : ""}

${risks.length ? `<h2>Identifierade risker</h2><ul>${risks.map((r: string) => `<li>${esc(r)}</li>`).join("")}</ul>` : ""}

${project.next_steps ? `<h2>Nästa steg</h2><p>${esc(project.next_steps)}</p>` : ""}

${project.internal_notes ? `<h2>Olivers anteckningar (intern)</h2><p>${esc(project.internal_notes)}</p>` : ""}

<div class="footer">
  Stilledev Labs · Projektbrief genererad ${new Date().toLocaleString("sv-SE")}
</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
