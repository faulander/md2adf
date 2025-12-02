import MarkdownIt from 'markdown-it';
import type Token from 'markdown-it/lib/token.mjs';

// Create markdown-it instance with common extensions
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: false,
});

// Enable strikethrough
md.enable('strikethrough');

/**
 * Parse markdown text into markdown-it tokens
 */
export function parseMarkdown(markdown: string): Token[] {
  return md.parse(markdown, {});
}

/**
 * Get the markdown-it instance for customization
 */
export function getMarkdownItInstance(): MarkdownIt {
  return md;
}

/**
 * Create a custom markdown-it instance with specific options
 */
export function createMarkdownParser(options?: MarkdownIt.Options): MarkdownIt {
  return new MarkdownIt({
    html: false,
    linkify: true,
    typographer: false,
    ...options,
  });
}
