# Loader investigation (2026-10-24)

> Historical baseline / pre-Confluence iteration. Current implementation, recovery details and **53-test** verification: [Confluence verification](./confluence-verification.md) and [current overhaul audit](./current-overhaul.md).

Baseline: `426a348`. Inspected layouts, Providers, every loader/overlay reference,
BrainFlight, Hero, CSS stacking, effect cleanup, hydration, and full Git history
(`git fetch --unshallow origin`).

## What actually exists in this checkout

There is **one** LoadingScreen mount, in root Providers. There is no `loading.tsx`,
nested layout, or remaining film Leader in the current tree. It would be inaccurate
to claim two LoadingScreen mounts. The older `c50cc20`/`2109abc` studio experience did
have a separate Leader, but its product loader was route-scoped. `426a348` removed
the studio page and restored an unconditional global loader.

The current reproducible ownership bug is the **handoff**: LoadingScreen calls
`markIntroDone()` at the START of its 900ms fade. Hero immediately mounts
HeroBrainPanel (a second BrainFlight), ParticleCore, and AICore's large animated logo
under the still-mounted full-screen intro. The two brains plus two brand/intro-like
compositions are crossfaded together. Not a z-index fix: these are separately owned,
separately running renderers. Baseline browser screenshots are retained outside Git.

Additional source-level defects:
- Loader effect owns an untracked exit timeout, which survives unmount/Strict Mode
  cleanup. No keyboard skip, no safety timeout. 5.6s + .9s is unnecessarily long.
- Scramble has a separate RAF clock and is not deliberate letter-by-letter typing.
- Initial `show=true` paints the overlay even when localStorage later skips it.
- BrainFlight's offscreen resume sets `running=true`, then calls a kick function
  that only works when reduced-motion AND not running. It never resumes normally.
- Reduced-motion's initial frame has zero gain; context loss isn't handled.
- Two full-page 2D environment loops + ParticleCore run alongside both brains.
- Root loader also covers admin/legal/share routes unnecessarily.

## Fix

Providers remains the only owner. One persistent BrainFlight travels into the hero;
Hero does not import any brain, particle canvas, logo stage or second intro.
One intro clock types **BUDAI**; a cancellable exit timer releases it. A session-scoped,
pre-paint policy skips returning/deep-linked/reduced-motion/save-data visitors without
a black flash. An independent 4.5s bootstrap safety guard releases content even if
hydration fails. Normal sequence: 2.35s + .7s reveal. No body scroll lock. Only this
brain is relevant to intro readiness; the world is loaded later. All timers/listeners
are cleaned up. Brain RAF resume, hidden-tab suspension, shaders, context loss,
readiness and resize are repaired. Bloom is quarter-resolution, two passes.

Original brain recovered from `43f44c9`: repository-owned procedural SDF anatomy,
neural nodes/connections, raw WebGL2. No external model download or asset license.

## External inspection limitation

Direct requests to stilledev.se and the supplied Vercel preview fail with
`SSL_ERROR_SYSCALL` under this workspace's outbound-host restrictions. GitHub history
and the actual local checkout are available; production rendering is verified locally
with `next build`/`next start`, not claimed to be a deployed-site inspection.

## Browser findings and test environment

Chromium 153's software GPU compositor initially starved requestAnimationFrame in
this sandbox for several seconds. Disabling only GPU **compositing in the browser
launch arguments** (`--disable-gpu-compositing`) fixes that headless-only stall while
retaining actual SwiftShader WebGL rendering. This is a test harness flag, not an
application setting or a replacement for the 3D brain. Removing process flags,
hiding content, disabling CSS effects, or forcing no WebGL did not resolve it.

With the working browser configuration, production browser observations captured
`B` → `BU` → `BUD` → `BUDA` → `BUDAI`, one loader maximum, one brain maximum, and the
same actual canvas after the landing reveal. Browser tests also cover keyboard
skip/focus, a deliberately stalled RAF clock, delayed brain bundle, shader failure,
context loss, reduced motion, reload/history and mobile widths.

The completion signal now fires only after the reveal has finished. Completion is
idempotent: RAF, asset deadline, reveal timer and safety timer cannot restart it.
The content is inert only while the full-screen intro is playing. Skip restores
focus to the real main landmark. The brain pauses when its hero aperture has faded
out and resumes, without reconstruction, on reverse scroll.

A separate browser issue appeared during deep-link testing: unconditional CSS
`smooth` scrolling allowed the initial fragment animation to continue after an
explicit viewport change. Initial fragments/history now use native immediate
settling; focused in-page links retain CSS smooth navigation for user actions.
The expensive world remains lazy, while the lightweight Builder content and
functional Playground retain stable server-rendered space during hydration.

The final development/Strict Mode run exposed one more real timing edge case: a
cold shader/JIT frame could cross two letter deadlines and skip `B`. The intro now
advances at most one character at a time, with a minimum visible character interval
and a short completed-word dwell. Nominal timing is unchanged; the independent
safety deadline still wins over a stalled clock. A pure regression test simulates
the missed frame, and the actual development browser now captures all five prefixes.

The final lab measurement also caught decorative CLS in the handoff itself:
transitioning the frame's `left/top/width/height` registered about 0.196 desktop
CLS and repeatedly reallocated GPU render targets. The frame now retains its
geometry and moves with uniform scale/translation only; the title has a reserved,
left-aligned field. The 12-second desktop measurement dropped to about **0.0024**
and 390px mobile to **0.000025**, including the small font/caret shifts. Both
mobile widths and desktop now have a real-browser layout-shift regression guard.
The independent timeout also records the session completion, so a failed/stalled
visual sequence cannot replay on the next reload.
