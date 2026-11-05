import { NextRequest, NextResponse } from "next/server";
import { serviceClient } from "@/lib/adminAuth";
import { WAITLIST_STATUS_COOKIE, verifyWaitlistToken } from "@/lib/waitlist-status";

export const dynamic = "force-dynamic";

/** Only the holder of a valid proof-of-signup cookie can look up their own row. */
export async function GET(req: NextRequest) {
  const email = verifyWaitlistToken(req.cookies.get(WAITLIST_STATUS_COOKIE)?.value);
  if (!email) return NextResponse.json({ status: null });

  const sb = serviceClient();
  if (!sb) return NextResponse.json({ status: null });
  const { data, error } = await sb.rpc("waitlist_status", { p_email: email });
  const row = Array.isArray(data) ? data[0] : data;
  if (error || !row) return NextResponse.json({ status: null });
  return NextResponse.json({
    status: {
      position: row.pos as number,
      total: row.total as number,
      code: (row.code as string) ?? null,
      referrals: (row.referrals as number) ?? 0,
    },
  });
}
