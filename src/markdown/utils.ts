import type Token from 'markdown-it/lib/token.mjs';

/**
 * Generate a unique local ID for task lists
 */
export function generateLocalId(): string {
  return Math.random().toString(36).substring(2, 11);
}

/**
 * Check if token is an inline token
 */
export function isInlineToken(token: Token): boolean {
  return token.type === 'inline';
}

/**
 * Check if token is a block-level token
 */
export function isBlockToken(token: Token): boolean {
  return !token.type.includes('inline') && token.nesting !== 0;
}

/**
 * Get the tag name from a token type
 */
export function getTagFromTokenType(type: string): string {
  const tagMap: Record<string, string> = {
    paragraph_open: 'p',
    paragraph_close: 'p',
    heading_open: 'h',
    heading_close: 'h',
    blockquote_open: 'blockquote',
    blockquote_close: 'blockquote',
    bullet_list_open: 'ul',
    bullet_list_close: 'ul',
    ordered_list_open: 'ol',
    ordered_list_close: 'ol',
    list_item_open: 'li',
    list_item_close: 'li',
    code_block: 'code',
    fence: 'code',
    table_open: 'table',
    table_close: 'table',
    thead_open: 'thead',
    thead_close: 'thead',
    tbody_open: 'tbody',
    tbody_close: 'tbody',
    tr_open: 'tr',
    tr_close: 'tr',
    th_open: 'th',
    th_close: 'th',
    td_open: 'td',
    td_close: 'td',
    hr: 'hr',
  };

  return tagMap[type] || type.replace(/_open|_close/, '');
}

/**
 * Parse heading level from token tag (h1-h6)
 */
export function parseHeadingLevel(tag: string): 1 | 2 | 3 | 4 | 5 | 6 {
  const match = tag.match(/h([1-6])/);
  if (match) {
    return parseInt(match[1], 10) as 1 | 2 | 3 | 4 | 5 | 6;
  }
  return 1;
}

/**
 * Extract language from fence token info
 */
export function extractCodeLanguage(info: string): string | undefined {
  const lang = info.trim().split(/\s+/)[0];
  return lang || undefined;
}

/**
 * Check if text contains mention pattern
 */
export function containsMention(text: string): boolean {
  return /@\w+/.test(text) || /@\[[^\]]+\]\([^)]+\)/.test(text);
}

/**
 * Check if text contains emoji shortcode pattern
 */
export function containsEmoji(text: string): boolean {
  return /:[a-zA-Z0-9_+-]+:/.test(text);
}

/**
 * Normalize whitespace in text
 */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ');
}

/**
 * Escape special markdown characters
 */
export function escapeMarkdown(text: string): string {
  return text.replace(/([\\`*_{}[\]()#+\-.!])/g, '\\$1');
}

/**
 * Unescape markdown characters
 */
export function unescapeMarkdown(text: string): string {
  return text.replace(/\\([\\`*_{}[\]()#+\-.!])/g, '$1');
}
