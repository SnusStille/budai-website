import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Supabase Auth callback
 *
 * Handles:
 * - OAuth PKCE `?code=` (Google) — MUST finish in the same browser that started login
 *   (code_verifier is cookie-bound; cross-device/browser always fails — we explain why)
 * - Email magic link `?token_hash=` + `type=`
 * - Provider `?error=`
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const errorParam = searchParams.get("error");
  const errorDesc = searchParams.get("error_description");

  const ok = () => NextResponse.redirect(`${origin}/?auth=ok#playground`);
  const fail = (reason: string) =>
    NextResponse.redirect(
      `${origin}/?auth=error&reason=${encodeURIComponent(reason)}#playground`
    );

  if (errorParam) {
    return fail(errorDesc || errorParam || "Authentication cancelled");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("YOUR_PROJECT")) {
    return fail("Auth is not configured on this server");
  }

  const cookieStore = await cookies();

  try {
    let response = ok();

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            try {
              cookieStore.set(name, value);
            } catch {
              /* */
            }
          });
          response = ok();
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });

    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (error) {
        console.error("[auth/callback] exchange", error.message);
        const m = error.message.toLowerCase();
        if (m.includes("verifier") || m.includes("pkce") || m.includes("code challenge")) {
          return fail(
            "Login must finish in the same browser where you clicked Sign in. Open BudAI here and try Google again."
          );
        }
        return fail(error.message);
      }
      return response;
    }

    if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: tokenHash,
        type: type as "email" | "magiclink" | "signup" | "invite" | "recovery",
      });
      if (error) {
        console.error("[auth/callback] otp", error.message);
        return fail(
          error.message.includes("expired")
            ? "Magic link expired. Request a new one."
            : error.message
        );
      }
      return response;
    }

    const { data } = await supabase.auth.getSession();
    if (data.session) return response;

    return fail(
      "Missing login code. Use the link in the same browser, or try Google again from this device."
    );
  } catch (e) {
    console.error("[auth/callback]", e);
    return fail("Authentication failed. Please try again.");
  }
}
