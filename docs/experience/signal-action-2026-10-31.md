# Signal → Action: product pass, 2026-10-31

## Audit and decisions

The checkout started clean on `aea32b2b96eb0d26e9624a9eeed07836a15205ab`, matching fetched `origin/main`. PR #6 is merged, while #5 is an older open branch; neither was used as a base. `docs/experience` contains historical reports, not a description of every current component. In particular, the current source enforces 12 guest / 80 member messages per day (`lib/limits.ts`), not the 10/35 described in older reports. Enforcement is soft and depends on the configured Supabase usage tables. The current page orders Hero → Neural Journey → Playground → Capabilities/access → Builder → Roadmap/waitlist → Footer. The current Three.js/scroll owners and all routes remain intact.

The real Playground already has streaming, modes, vision gating, browser speech recognition, local/cloud history, editable/deletable memory, export and a Workspace. The API invokes Anthropic, not web search. Memory is enabled by default for accounts and the server may automatically store a model-selected durable fact; it is not exclusively manually selected. Documentation/copy claiming otherwise was unsafe. Workspace was read-only and its actions referred ambiguously to the last response rather than the chosen document. Conversation persistence also overwrote renamed titles.

## Research and prioritization

- [Claude](https://www.anthropic.com/claude) demonstrates editable outputs alongside a conversation; we reuse the existing Workspace rather than building a document platform.
- [Perplexity](https://www.perplexity.ai/help-center/en/articles/10352895-how-does-perplexity-work) ties answers to actual web retrieval and clickable sources. BudAI has no such retrieval; a truthful limitation and instructions not to fabricate citations are preferable to fake sources.
- [Cursor](https://cursor.com/) and [Lovable](https://lovable.dev/) show outcomes in the context of the task; BudAI's Builder remains an explicitly prepared illustration, not a deployed app builder.
- [Notion AI](https://www.notion.com/product/ai) places AI close to working material and permissions; [Granola](https://www.granola.ai/) shows rough notes becoming actionable output. A small prepared transformation and editable workflow prompts apply that idea without a paid integration.
- [ElevenLabs](https://elevenlabs.io/) makes voice interaction legible through specific use cases. BudAI's existing browser-dependent speech remains; no voice service or claims of transcription infrastructure were added.

Prioritized: (1) a prepared Signal → Action example and four bilingual editable workflows, no automatic AI calls (high value, low cost/risk); (2) editing and explicit selected-text actions in the existing Workspace (high value, modest complexity); (3) research and memory transparency (high trust, no new service); (4) retaining renamed conversation titles (daily-use reliability). Deferred: live web research/citations, document sync/versioning, full agents, extra voice integrations, and a new 3D/scroll system. They require infrastructure, trust or cost not justified by this pass.

## Implementation and constraints

Workflow selection only prefills the composer and selects the existing mode; the user sends the request. The example is prepared and labelled. Workspace edits are temporary, not synced to the original conversation: download Markdown to save, or copy. AI actions include the selected edited text, with a 3,200-character guard to avoid silently truncating it or exceeding the existing API's per-message limit. A subsequent response doesn't silently replace an open draft; open the new response explicitly to replace it. Research does not search or verify sources. Automatic memory can be disabled; temporary chats do not send the memory block or persist auto-memory. No new dependency or paid service was added.

Changes: `SignalWorkflows.tsx`, `AIPlayground.tsx`, `experience.css`, memory copy in `BrainScrollStory.tsx`, `CapabilityMap.tsx`, `CapabilityStudioScreen.tsx`, `brain-story.ts` and `capability-engine.ts`, history persistence in `localStore.ts` and `cloudStore.ts`, and `tests/signal-workflows.spec.ts`.

See final delivery for the actual test and deployment status. Local browser transport doubles test UI and request construction, not Anthropic or Supabase availability. Browser speech depends on device/browser permissions. AI output and research claims still require user review.
