import { createHash } from "crypto";
import type { NextRequest } from "next/server";
import { serviceClient } from "@/lib/supabase/service";
import { clientIp } from "@/lib/rate-limit";
export async function logAudit(req: NextRequest | null, action: string, targetType?: string, targetId?: string, details: Record<string,string|number|boolean> = {}) {
  try {
    const sb = serviceClient(); if (!sb) return;
    const ipHash = req ? createHash("sha256").update(clientIp(req)).digest("hex").slice(0,32) : null;
    await sb.from("admin_audit_logs").insert({ actor: "admin", action, target_type: targetType||null, target_id: targetId||null, details, ip_hash: ipHash });
    await sb.from("admin_events").insert({ kind: action.slice(0,40), message: `${action}${targetType?` · ${targetType}`:""}`, meta: {} });
  } catch {}
}
export function csvCell(v: unknown): string { const s = v==null?"":String(v); return `"${s.replace(/"/g,'""')}"`; }
export function toCsv(headers: string[], rows: Record<string,unknown>[]): string { return [headers.join(","), ...rows.map(r=>headers.map(h=>csvCell(r[h])).join(","))].join("\n"); }
