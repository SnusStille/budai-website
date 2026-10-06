import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { PRODUCTION_URL } from "@/lib/site";

/**
 * Supabase Auth callback — PKCE code, magic-link token_hash, provider errors.
 *
 * Magic-link localhost bug: if Supabase Dashboard "Site URL" is still
 * http://localhost:3000 and redirectTo is not allowlisted, emails point at
 * localhost. Fix Site URL = https://stilledev.se (AUTH_SETUP.md).
 */
function safeAppOrigin(): string {
  if (process.env.NODE_ENV !== "production") {
    return "http://localhost:3000";
  }

  if (process.env.VERCEL_ENV === "production") {
    return PRODUCTION_URL;
  }

  // VERCEL_URL is supplied by the deployment environment, unlike request headers.
  const vercelHost = (process.env.VERCEL_URL || "").trim().toLowerCase();
  if (/^[a-z0-9-]+(?:\.[a-z0-9-]+)*\.vercel\.app$/.test(vercelHost)) {
    return `https://${vercelHost}`;
  }

  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (configuredUrl) {
    try {
      const configured = new URL(configuredUrl);
      if (
        configured.protocol === "https:" &&
        (configured.hostname === "stilledev.se" ||
          configured.hostname === "www.stilledev.se")
      ) {
        return configured.origin;
      }
    } catch {
      // Fall back to the canonical production origin for invalid configuration.
    }
  }

  return PRODUCTION_URL;
}

function playgroundRedirect(origin: string, params: Record<string, string>) {
  const q = new URLSearchParams(params);
  return NextResponse.redirect(`${origin}/?${q.toString()}#playground`);
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const errorParam = searchParams.get("error");
  const errorDesc = searchParams.get("error_description");

  const origin = safeAppOrigin();

  const ok = () => playgroundRedirect(origin, { auth: "ok" });
  const fail = (reason: string) =>
    playgroundRedirect(origin, { auth: "error", reason: reason.slice(0, 300) });

  if (errorParam) {
    return fail(
      errorDesc || errorParam
        ? "Sign-in was cancelled or denied. You can try again from the Playground."
        : "Authentication cancelled"
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("YOUR_PROJECT")) {
    return fail("Sign-in is temporarily unavailable. Please try again later.");
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
          const useSecure = origin.startsWith("https://");
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, {
              ...options,
              secure: useSecure ? true : options?.secure,
              sameSite: (options?.sameSite as "lax" | "strict" | "none") ?? "lax",
              path: options?.path ?? "/",
            });
          });
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
            "Login must finish in the same browser where you clicked Sign in. Open https://stilledev.se and try again."
          );
        }
        return fail(
          "Sign-in failed. Try again from the Playground, or use email magic link."
        );
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
          error.message.toLowerCase().includes("expired")
            ? "Magic link expired. Request a new one from the Playground."
            : "Could not verify the magic link. Request a new one from the Playground."
        );
      }
      return response;
    }

    const { data } = await supabase.auth.getSession();
    if (data.session) return response;

    return fail(
      "Missing login code. Request a new magic link from the site you are using (stilledev.se or localhost)."
    );
  } catch (e) {
    console.error("[auth/callback]", e);
    return fail("Authentication failed. Please try again from the Playground.");
  }
}
