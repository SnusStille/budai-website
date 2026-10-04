/** Hide memory metadata, including a marker split across provider chunks. */
export function visibleStreamText(text: string): string {
  const marker = "[[MEMORY:";
  const at = text.toUpperCase().indexOf(marker);
  if (at >= 0) return text.slice(0, at).trimEnd();
  for (let n = marker.length - 1; n > 0; n--) {
    if (text.toUpperCase().endsWith(marker.slice(0, n)))
      return text.slice(0, -n);
  }
  return text;
}
