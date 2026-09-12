/** Human-facing auth errors — never dump raw provider JSON to UI. */
export function friendlyAuthError(msg: string, lang: "sv" | "en" = "en"): string {
  const m = (msg || "").toLowerCase();

  const sv = lang === "sv";

  if (
    m.includes("provider is not enabled") ||
    m.includes("unsupported provider") ||
    m.includes("google sign-in is currently unavailable") ||
    m.includes("google is not enabled")
  ) {
    return sv
      ? "Google-inloggning är inte tillgänglig just nu. Använd magisk länk via e-post, eller försök senare."
      : "Google sign-in is currently unavailable. Please use the magic-link email option, or try again later.";
  }
  if (m.includes("popup") || m.includes("cancelled") || m.includes("canceled")) {
    return sv ? "Google-inloggningen avbröts." : "Google sign-in was cancelled.";
  }
  if (m.includes("too many") || m.includes("rate") || m.includes("security")) {
    return sv
      ? "För många försök. Vänta en minut och prova igen."
      : "Too many attempts. Please wait a minute and try again.";
  }
  if (m.includes("redirect") && (m.includes("url") || m.includes("allow") || m.includes("misconfig"))) {
    return sv
      ? "Inloggningsomdirigering är felkonfigurerad. Försök senare."
      : "Sign-in redirect is misconfigured. Please try again later.";
  }
  if (m.includes("pkce") || m.includes("verifier") || m.includes("code challenge") || m.includes("same browser")) {
    return sv
      ? "Logga in i samma webbläsare där du startade. Öppna stilledev.se och försök igen."
      : "Finish sign-in in the same browser where you started. Open the site and try again.";
  }
  if (m.includes("expired") || m.includes("otp")) {
    return sv
      ? "Länken har gått ut. Begär en ny magisk länk från Playground."
      : "Magic link expired. Request a new one from the Playground.";
  }
  if (m.includes("not configured") || m.includes("temporarily unavailable") || m.includes("supabase_url")) {
    return sv
      ? "Inloggning är tillfälligt otillgänglig. Försök senare."
      : "Sign-in is temporarily unavailable. Please try again later.";
  }
  if (m.includes("magic") || m.includes("email") || m.includes("could not send")) {
    return sv
      ? "Kunde inte skicka magisk länk. Kontrollera e-postadressen."
      : "Could not send the magic link. Check the email address and try again.";
  }
  if (m.includes("could not start google")) {
    return sv
      ? "Kunde inte starta Google-inloggning. Prova magisk länk via e-post."
      : "Could not start Google sign-in. Please try email magic link.";
  }
  if (m.includes("missing login code")) {
    return sv
      ? "Inloggningskoden saknas. Begär en ny magisk länk från sajten."
      : "Missing login code. Request a new magic link from the site.";
  }

  // Generic fallback — never show raw backend strings that look technical
  if (
    m.includes("error") &&
    (m.includes("{") || m.includes("stack") || m.includes("exception") || m.length > 180)
  ) {
    return sv
      ? "Inloggningen misslyckades. Försök igen i den här webbläsaren."
      : "Sign-in failed. Try again in this browser.";
  }

  // If message already looks human (our own copy), pass through
  if (msg && msg.length < 180 && !m.includes("supabase") && !m.includes("oauth")) {
    return msg;
  }

  return sv
    ? "Inloggningen misslyckades. Försök igen, eller använd magisk länk via e-post."
    : "Sign-in failed. Try again, or use the email magic link.";
}
