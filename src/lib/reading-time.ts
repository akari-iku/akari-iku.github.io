/** Rough reading time from raw markdown (ja: chars/550, en: words/200). */
export function readingTime(body: string, lang: 'ja' | 'en'): string {
  const text = body
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
  if (lang === 'ja') {
    const chars = text.replace(/\s/g, '').length;
    return `約${Math.max(1, Math.round(chars / 550))}分`;
  }
  const words = text.split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}
