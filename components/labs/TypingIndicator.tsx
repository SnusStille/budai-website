"use client";

/**
 * Typing indicator — three bouncing dots shown while waiting for first AI token.
 * Appears inside the assistant message bubble for the first ~600ms to signal
 * that BudAI is thinking. Removed once streaming actually starts.
 */
import { motion } from "framer-motion";

export default function TypingIndicator() {
  return (
    <span className="ti-wrap" aria-label="Thinking">
      {[0,1,2].map(i => (
        <motion.span
          key={i}
          className="ti-dot"
          initial={{ opacity: 0.3, y: 0 }}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
        />
      ))}
    </span>
  );
}
