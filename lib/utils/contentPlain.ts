/**
 * Extract plain text from TipTap JSON for search and reading time.
 */
export function contentPlain(content: unknown): string {
  if (!content || typeof content !== "object") return "";
  const doc = content as { content?: Array<{ content?: Array<{ text?: string }>; text?: string }> };
  const parts: string[] = [];
  function walk(nodes: Array<{ content?: Array<{ text?: string }>; text?: string }> | undefined) {
    if (!Array.isArray(nodes)) return;
    for (const node of nodes) {
      if (node.text) parts.push(node.text);
      if (node.content) walk(node.content);
    }
  }
  walk(doc.content);
  return parts.join(" ");
}
