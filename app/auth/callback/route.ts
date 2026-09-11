import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getSiteUrl, PRODUCTION_URL } from "@/lib/site";

/**
 * Supabase Auth callback — PKCE code, magic-link token_hash, provider errors.
 *
 * Magic-link localhost bug: if Supabase Dashboard "Site URL" is still
 * http://localhost:3000 and redirectTo is not allowlisted, emails point at
 * localhost. Fix Site URL = https://stilledev.se (AUTH_SETUP.md).
 */
function safeAppOrigin(request: Request): string {
  const url = new URL(request.url);
  const xfHost = request.headers.get("x-forwarded-host");
  const host = (xfHost || request.headers.get("host") || url.host)
    .split(",")[0]
    .trim()
    .toLowerCase();
  const xfProto = request.headers.get("x-forwarded-proto");
  let proto = (xfProto || url.protocol.replace(":", "") || "https")
    .split(",")[0]
    .trim()
    .toLowerCase();

  if (!host || host.startsWith("0.0.0.0")) {
    return getSiteUrl();
  }

  // Production brand domain always HTTPS
  if (host === "stilledev.se" || host === "www.stilledev.se") {
    return `https://${host}`;
  }

  const isLoopback = host.startsWith("localhost") || host.startsWith("127.0.0.1");
  if (isLoopback) {
    return `http://${host.includes(":") ? host : `${host}:3000`}`.replace(
      ":3000:3000",
      ":3000"
    );
  }

  // Vercel / preview
  if (host.endsWith(".vercel.app") || host.endsWith(".e2b.app")) {
    return `https://${host}`;
  }

  if (proto !== "http" && proto !== "https") proto = "https";
  if (process.env.NODE_ENV === "production" && proto === "http") proto = "https";

  return `${proto}://${host}`;
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

  let origin = safeAppOrigin(request);

  // Hard safety: never send production NODE_ENV users to localhost
  if (
    process.env.VERCEL_ENV === "production" &&
    (origin.includes("localhost") || origin.includes("127.0.0.1"))
  ) {
    origin = PRODUCTION_URL;
  }

  const ok = () => playgroundRedirect(origin, { auth: "ok" });
  const fail = (reason: string) =>
    playgroundRedirect(origin, { auth: "error", reason: reason.slice(0, 300) });

  if (errorParam) {
    return fail(errorDesc || errorParam || "Authentication cancelled");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey || supabaseUrl.includes("YOUR_PROJECT")) {
    return fail("Auth is not configured. Set NEXT_PUBLIC_SUPABASE_URL and ANON_KEY on Vercel.");
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
          error.message.toLowerCase().includes("expired")
            ? "Magic link expired. Request a new one from the Playground."
            : error.message
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
