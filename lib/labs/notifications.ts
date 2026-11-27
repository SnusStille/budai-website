/**
 * Stilledev Labs — smart notifications to Oliver.
 *
 * Only sends emails for meaningful events (new conversation with substance,
 * contact details submitted, project qualified), not every single message.
 */
import { sendEmail, emailConfigured } from "@/lib/email";
import { serviceClient } from "@/lib/supabase/service";

const LABS_NOTIFICATION_EMAIL = process.env.LABS_NOTIFICATION_EMAIL || "info@stilledev.se";

export type LabsNotificationKind =
  | "new_conversation"
  | "contact_received"
  | "project_qualified"
  | "summary_ready"
  | "high_priority_lead";

/** Create a notification in the DB and optionally email it. */
export async function createLabsNotification(opts: {
  projectId?: string;
  conversationId?: string;
  kind: LabsNotificationKind;
  title: string;
  body?: string;
  email: boolean;
}): Promise<void> {
  const sb = serviceClient();
  if (!sb) return;

  try {
    const { data: notif, error } = await sb
      .from("labs_notifications")
      .insert({
        project_id: opts.projectId || null,
        kind: opts.kind,
        title: opts.title,
        body: opts.body || null,
        email_sent: false,
      })
      .select("id")
      .single();

    if (error || !notif) return;

    if (opts.email && emailConfigured()) {
      const subject = `[Labs] ${opts.title}`;
      const text =
        (opts.body || "") +
        `\n\n--\nStilledev Labs notification\nOpen admin: ${process.env.NEXT_PUBLIC_SITE_URL || "https://stilledev.se"}/admin`;

      const sent = await sendEmail(LABS_NOTIFICATION_EMAIL, subject, text);
      if (sent) {
        await sb
          .from("labs_notifications")
          .update({ email_sent: true })
          .eq("id", notif.id);
      }
    }
  } catch {
    // Never let notification failure break the main flow
  }
}

/**
 * Determine if we should notify about a new conversation.
 * We only notify after the user's first real message (not empty).
 */
export async function maybeNotifyNewConversation(
  conversationId: string,
  firstMessage: string
): Promise<void> {
  const trimmed = firstMessage.trim();
  if (trimmed.length < 10) return;

  // Check if we already notified for this conversation
  const sb = serviceClient();
  if (!sb) return;

  try {
    const { data: existing } = await sb
      .from("labs_notifications")
      .select("id")
      .eq("kind", "new_conversation")
      .eq("project_id", null)
      .filter("created_at", "gt", new Date(Date.now() - 60_000).toISOString())
      .limit(1);

    // To avoid noise, only email for new conversations that have substance (>=50 chars)
    const shouldEmail = trimmed.length >= 50;

    await createLabsNotification({
      conversationId,
      kind: "new_conversation",
      title: "Ny konversation startad",
      body: `Första meddelande: "${trimmed.slice(0, 200)}${trimmed.length > 200 ? "…" : ""}"`,
      email: shouldEmail,
    });
  } catch {
    // swallow
  }
}
