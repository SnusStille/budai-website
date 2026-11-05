/** D12: keep the fixed composer visible when a mobile keyboard opens. */

/** Below this overlap we treat the change as browser chrome, not a keyboard. */
export const KEYBOARD_OVERLAP_THRESHOLD_PX = 120;

/**
 * `window.innerHeight` is the layout viewport; `visualViewport.height` is what
 * is actually visible. On iOS the layout viewport does not shrink when the
 * keyboard appears, so the difference is the height we need to reclaim.
 */
export function keyboardOverlap(
  innerHeight: number,
  visualHeight: number,
  visualOffsetTop: number
): number {
  if (![innerHeight, visualHeight, visualOffsetTop].every(Number.isFinite)) return 0;
  const overlap = Math.round(innerHeight - visualHeight - visualOffsetTop);
  return Math.max(0, Math.min(Math.round(innerHeight), overlap));
}
