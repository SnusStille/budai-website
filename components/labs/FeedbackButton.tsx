"use client";

/**
 * Feedback FAB (floating action button) — bottom-right corner, same style as BudAI.
 * Opens a minimal modal for quick feedback; submits via fire-and-forget fetch
 * to /api/labs/feedback (no auth, no spam if rate-limited server-side).
 */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquareText, X, Send, Check } from "lucide-react";

interface Props {
  lang: "sv" | "en";
  conversationId?: string | null;
}

const LABELS = {
  sv: {
    button: "Feedback",
    title: "Berätta vad du tycker",
    subtitle: "Vad fungerar bra? Vad kan bli bättre? Tar bara några sekunder.",
    placeholder: "T.ex. 'Jag skulle vilja ha…' eller 'Något krånglade när…'",
    emailLabel: "E-post (frivilligt, om du vill ha svar)",
    emailPlaceholder: "din@email.se",
    send: "Skicka",
    sending: "Skickar…",
    thanks: "Tack! Din feedback är mottagen.",
    close: "Stäng",
    rating: "Hur väl fungerade det?",
  },
  en: {
    button: "Feedback",
    title: "Tell me what you think",
    subtitle: "What worked well? What could be better? Takes only a few seconds.",
    placeholder: "e.g. 'I wish there was…' or 'Something went wrong when…'",
    emailLabel: "Email (optional, if you want a reply)",
    emailPlaceholder: "your@email.com",
    send: "Send",
    sending: "Sending…",
    thanks: "Thanks! Your feedback has been received.",
    close: "Close",
    rating: "How well did it work?",
  },
};

export default function FeedbackButton({ lang, conversationId }: Props) {
  const l = LABELS[lang];
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (message.trim().length < 3 || sending) return;
    setSending(true);
    try {
      await fetch("/api/labs/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: message.trim(),
          email: email.trim() || null,
          rating,
          conversationId: conversationId || null,
          path: window.location.pathname,
        }),
      });
      setSent(true);
      setTimeout(() => { setOpen(false); setSent(false); setMessage(""); setEmail(""); setRating(null); }, 2000);
    } catch {
      setSent(true);
      setTimeout(() => { setOpen(false); setSent(false); setMessage(""); setEmail(""); setRating(null); }, 2000);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <motion.button
        type="button"
        className="fb-fab"
        onClick={() => setOpen(true)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2, duration: 0.4 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label={l.button}
        title={l.button}
      >
        <MessageSquareText size={16} />
        <span className="fb-fab-label">{l.button}</span>
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fb-overlay"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fb-modal"
              role="dialog"
              aria-modal="true"
              aria-label={l.title}
            >
              <button
                type="button"
                className="fb-close"
                onClick={() => setOpen(false)}
                aria-label={l.close}
              >
                <X size={16} />
              </button>

              {sent ? (
                <div className="fb-thanks">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="fb-thanks-icon"
                  >
                    <Check size={22} />
                  </motion.div>
                  <p>{l.thanks}</p>
                </div>
              ) : (
                <>
                  <h3 className="fb-title">{l.title}</h3>
                  <p className="fb-subtitle">{l.subtitle}</p>

                  <div className="fb-rating">
                    <span className="fb-rating-label">{l.rating}</span>
                    <div className="fb-stars">
                      {[1,2,3,4,5].map(n => (
                        <button
                          key={n}
                          type="button"
                          className={`fb-star ${rating !== null && n <= rating ? "fb-star-active" : ""}`}
                          onClick={() => setRating(n)}
                          aria-label={`${n}/5`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    className="fb-textarea"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={l.placeholder}
                    rows={4}
                    autoFocus
                  />

                  <input
                    type="email"
                    className="fb-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={l.emailPlaceholder}
                    aria-label={l.emailLabel}
                  />

                  <div className="fb-actions">
                    <button
                      type="button"
                      className="fb-send"
                      onClick={submit}
                      disabled={message.trim().length < 3 || sending}
                    >
                      <Send size={13} />
                      {sending ? l.sending : l.send}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
