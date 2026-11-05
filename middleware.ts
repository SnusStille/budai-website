import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { buildCsp } from "@/lib/csp";
import { isNonCanonicalHost } from "@/lib/host";

/**
 * Per-request CSP nonce + optional session refresh for Supabase Auth (PKCE).
 * The Supabase part no-ops when env is missing / placeholder.
 */
export async function middleware(request: NextRequest) {
  const nonce = crypto.randomUUID().replace(/-/g, "");
  const csp = buildCsp(nonce);

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  // Next.js reads the nonce from this request header and applies it to its
  // own scripts, so they satisfy the very same policy the response sends.
  requestHeaders.set("Content-Security-Policy", csp);

  // A5: the Vercel default domain mirrors the canonical site. Do not let
  // crawlers index it as duplicate content, but keep preview URLs usable.
  // Behind a proxy, nextUrl.hostname can be the internal upstream host, so
  // trust the actual Host header and fall back to nextUrl when it is missing.
  const host = request.headers.get("host") || request.nextUrl.hostname;
  const noindex = isNonCanonicalHost(host);
  const makeResponse = () => {
    const res = NextResponse.next({ request: { headers: requestHeaders } });
    res.headers.set("Content-Security-Policy", csp);
    if (noindex) res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  };
  let response = makeResponse();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || url.includes("YOUR_PROJECT")) {
    return response;
  }

  try {
    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = makeResponse();
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    });
    await supabase.auth.getUser();
  } catch {
    /* ignore */
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
