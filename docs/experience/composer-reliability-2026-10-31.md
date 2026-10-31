# Playground work-loop reliability

This pass makes common interactions deliberate rather than destructive:

- Workflow suggestions, capability starters and Surprise prefill an editable prompt; they do not call the AI until the user sends. Replacing an unsent message requires confirmation.
- Starting or opening another conversation asks before discarding an unsent message or attachment. Workspace edits retain their existing separate protection.
- Follow-up actions and voice-mode prompts do not erase a separately typed composer draft or attach its pending image. Continue on a specific answer explicitly includes that answer (up to 3,200 characters), rather than inadvertently referring to the newest response. Long answers can be opened in Workspace and shortened before using that action.
- Browser dictation appends to the pre-existing composer text; interim results replace only the current dictation, not the prior draft.
- The existing API limits each message to 4,000 JavaScript UTF-16 code units and considers the last 12 messages. The composer checks the full message including the mode prefix before sending and displays a counter near the limit. It preserves over-limit text without making an API call. When an earlier message exceeds the limit, the client sends a clearly marked shortened version; the original remains visible and stored. The interface explains shortened context and the 11-message prior-history window.

The API retains its validation and contracts, using shared constants to prevent limit drift. Tests use browser transport and speech-recognition doubles, not real provider calls. This pass adds no dependency or service and does not claim live-web research, cross-device document storage, or physical-device/Safari verification.
