# Playground request lifecycle

This pass focuses on preventing late or incomplete results from misleading the user:

- One active Playground request per tab is allowed, including while a cloud conversation is being created. Stop, chat switches, deleting the active chat, account changes and unmount invalidate the request and abort its fetch/reader. Late callbacks are ignored even if a transport does not honour abort.
- Stop immediately retains received text with a visible “Response stopped” marker. If there was no received text, no fabricated answer is inserted. Escape first closes an open overlay, then stops the active request.
- The existing 90-second timeout now covers the response body, not just headers. Stream failures display an error even after partial content; partial content remains visible. A retry replaces the failed turn in the current UI/request, reuses the original user-message ID, and does not send a duplicate prompt.
- Switching chats flushes the pending history snapshot instead of waiting for the debounce. Temporary chats remain excluded. Supabase snapshots still use the previous append-only, per-tab queue: already-synced error or partial messages are not removed retroactively, and cross-tab concurrency is not fully solved.
- If an image is attached, natural-language image-generation detection no longer silently routes the submission away from image analysis.

Browser tests simulate delayed, stalled, failed and abort-ignoring transports. They are not tests of the real Anthropic or Supabase services. A client abort cannot guarantee that an upstream provider did no work or incurred no usage; status and quotas remain ultimately server-dependent. Real authenticated image-generation and vision flows also need provider-backed verification.
