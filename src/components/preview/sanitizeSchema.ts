/**
 * Restrictive sanitize schema: only allows standard Markdown-generated tags
 * plus <u> for underline. Does NOT spread defaultSchema to avoid allowing
 * raw HTML tags like img, input, video, etc.
 */
export const previewSanitizeSchema = {
  tagNames: [
    // Block elements (from Markdown)
    'p', 'br', 'hr',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'blockquote',
    // Lists
    'ul', 'ol', 'li',
    // Inline elements (from Markdown)
    'a', 'em', 'strong', 'del', 'code', 'pre',
    // Tables (from GFM)
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
    // Text formatting
    'sup', 'sub',
    // Underline (added for our inline formatting)
    'u',
  ],
  attributes: {
    a: ['href', 'title'],
    code: [['className', /^language-./]],
    h2: [['className', 'sr-only']],
    u: [],
  },
  protocols: {
    href: ['http', 'https', 'mailto'],
  },
};
