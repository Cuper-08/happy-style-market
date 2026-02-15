/**
 * Strips HTML tags, style blocks, and CSS from a description string.
 * Returns clean, readable text.
 */
export function stripHtml(html: string | null | undefined): string {
  if (!html) return '';

  let text = html;

  // Remove <style>...</style> blocks entirely
  text = text.replace(/<style[\s\S]*?<\/style>/gi, '');

  // Remove <script>...</script> blocks
  text = text.replace(/<script[\s\S]*?<\/script>/gi, '');

  // Replace <br>, <br/>, <br /> with newlines
  text = text.replace(/<br\s*\/?>/gi, '\n');

  // Replace block-level closing tags with newlines
  text = text.replace(/<\/(p|div|h[1-6]|li|tr)>/gi, '\n');

  // Remove all remaining HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Decode common HTML entities
  text = text.replace(/&amp;/g, '&');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&quot;/g, '"');
  text = text.replace(/&#39;/g, "'");
  text = text.replace(/&apos;/g, "'");
  text = text.replace(/&nbsp;/g, ' ');

  // Remove CSS-like content that might remain (e.g., .class { ... })
  text = text.replace(/\.[a-zA-Z_][\w-]*\s*\{[^}]*\}/g, '');

  // Clean up multiple spaces and blank lines
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n\s*\n/g, '\n\n');
  text = text.trim();

  return text;
}
