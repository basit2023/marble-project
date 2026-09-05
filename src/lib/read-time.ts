/** Estimate visible HTML prose at 200 words/minute without counting markup/scripts. */
export function calculateReadTime(html: string): number {
  const prose = html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ").replace(/&(?:#\d+|#x[\da-f]+|\w+);/gi, " ");
  const words = prose.trim().split(/\s+/u).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}
