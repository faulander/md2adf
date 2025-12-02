import type { ADFDocument, ADFNode, ADFMark, ADFToMarkdownOptions } from '../common/types.js';
import { defaultADFToMarkdownOptions } from '../config/defaults.js';
import { InvalidADFError } from '../common/errors.js';

/**
 * Convert ADF document to Markdown string
 */
export function adfToMarkdown(
  adf: ADFDocument,
  options: ADFToMarkdownOptions = {}
): string {
  const opts = { ...defaultADFToMarkdownOptions, ...options };

  if (!adf || adf.type !== 'doc') {
    throw new InvalidADFError('Invalid ADF document: missing or invalid "doc" type');
  }

  const content = adf.content || [];
  const lines: string[] = [];

  for (const node of content) {
    const markdown = convertNode(node, opts, 0);
    if (markdown !== null) {
      lines.push(markdown);
    }
  }

  return lines.join('\n\n');
}

/**
 * Convert a single ADF node to Markdown
 */
function convertNode(
  node: ADFNode,
  options: ADFToMarkdownOptions,
  depth: number
): string | null {
  switch (node.type) {
    case 'paragraph':
      return convertParagraph(node, options);

    case 'heading':
      return convertHeading(node, options);

    case 'codeBlock':
      return convertCodeBlock(node);

    case 'blockquote':
      return convertBlockquote(node, options, depth);

    case 'bulletList':
      return convertBulletList(node, options, depth);

    case 'orderedList':
      return convertOrderedList(node, options, depth);

    case 'taskList':
      return convertTaskList(node, options, depth);

    case 'table':
      return convertTable(node, options);

    case 'rule':
      return '---';

    case 'mediaSingle':
      return convertMediaSingle(node);

    case 'blockCard':
      return convertBlockCard(node);

    case 'panel':
      return convertPanel(node, options);

    case 'expand':
      return convertExpand(node, options);

    default:
      return null;
  }
}

/**
 * Convert paragraph node
 */
function convertParagraph(node: ADFNode, options: ADFToMarkdownOptions): string {
  return convertInlineContent(node.content || [], options);
}

/**
 * Convert heading node
 */
function convertHeading(node: ADFNode, options: ADFToMarkdownOptions): string {
  const level = (node.attrs?.level as number) || 1;
  const prefix = '#'.repeat(level);
  const content = convertInlineContent(node.content || [], options);
  return `${prefix} ${content}`;
}

/**
 * Convert code block node
 */
function convertCodeBlock(node: ADFNode): string {
  const language = (node.attrs?.language as string) || '';
  const content = node.content?.map((n) => n.text || '').join('') || '';
  return `\`\`\`${language}\n${content}\n\`\`\``;
}

/**
 * Convert blockquote node
 */
function convertBlockquote(
  node: ADFNode,
  options: ADFToMarkdownOptions,
  depth: number
): string {
  const content = node.content || [];
  const lines: string[] = [];

  for (const child of content) {
    const markdown = convertNode(child, options, depth + 1);
    if (markdown !== null) {
      // Prefix each line with >
      const prefixed = markdown
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');
      lines.push(prefixed);
    }
  }

  return lines.join('\n>\n');
}

/**
 * Convert bullet list node
 */
function convertBulletList(
  node: ADFNode,
  options: ADFToMarkdownOptions,
  depth: number
): string {
  const items = node.content || [];
  const indent = '  '.repeat(depth);
  const lines: string[] = [];

  for (const item of items) {
    const content = convertListItemContent(item, options, depth);
    lines.push(`${indent}- ${content}`);
  }

  return lines.join('\n');
}

/**
 * Convert ordered list node
 */
function convertOrderedList(
  node: ADFNode,
  options: ADFToMarkdownOptions,
  depth: number
): string {
  const items = node.content || [];
  const indent = '  '.repeat(depth);
  const startOrder = (node.attrs?.order as number) || 1;
  const lines: string[] = [];

  items.forEach((item, index) => {
    const content = convertListItemContent(item, options, depth);
    lines.push(`${indent}${startOrder + index}. ${content}`);
  });

  return lines.join('\n');
}

/**
 * Convert task list node
 */
function convertTaskList(
  node: ADFNode,
  options: ADFToMarkdownOptions,
  depth: number
): string {
  const items = node.content || [];
  const indent = '  '.repeat(depth);
  const lines: string[] = [];

  for (const item of items) {
    const state = item.attrs?.state as string;
    const checkbox = state === 'DONE' ? '[x]' : '[ ]';
    const content = convertListItemContent(item, options, depth);
    lines.push(`${indent}- ${checkbox} ${content}`);
  }

  return lines.join('\n');
}

/**
 * Convert list item content
 */
function convertListItemContent(
  item: ADFNode,
  options: ADFToMarkdownOptions,
  depth: number
): string {
  const content = item.content || [];
  const parts: string[] = [];

  for (const child of content) {
    if (child.type === 'paragraph') {
      parts.push(convertParagraph(child, options));
    } else if (child.type === 'bulletList' || child.type === 'orderedList') {
      const nestedList = convertNode(child, options, depth + 1);
      if (nestedList) {
        parts.push('\n' + nestedList);
      }
    } else {
      const markdown = convertNode(child, options, depth);
      if (markdown) {
        parts.push(markdown);
      }
    }
  }

  return parts.join('\n');
}

/**
 * Convert table node
 */
function convertTable(node: ADFNode, options: ADFToMarkdownOptions): string {
  const rows = node.content || [];
  if (rows.length === 0) return '';

  const lines: string[] = [];
  let hasHeader = false;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.content || [];
    const isHeaderRow = cells.some((cell) => cell.type === 'tableHeader');

    const cellContents = cells.map((cell) => {
      const cellContent = cell.content || [];
      return convertInlineContent(
        cellContent.flatMap((p) => p.content || []),
        options
      );
    });

    lines.push(`| ${cellContents.join(' | ')} |`);

    // Add separator after header row
    if (isHeaderRow && !hasHeader) {
      hasHeader = true;
      const separator = cells.map(() => '---').join(' | ');
      lines.push(`| ${separator} |`);
    }
  }

  // If no header was found, add separator after first row
  if (!hasHeader && rows.length > 0) {
    const firstRow = rows[0];
    const cellCount = firstRow.content?.length || 0;
    const separator = Array(cellCount).fill('---').join(' | ');
    lines.splice(1, 0, `| ${separator} |`);
  }

  return lines.join('\n');
}

/**
 * Convert mediaSingle node (images)
 */
function convertMediaSingle(node: ADFNode): string {
  const media = node.content?.[0];
  if (!media || media.type !== 'media') return '';

  const attrs = media.attrs || {};
  const url = (attrs.url as string) || '';
  const alt = (attrs.alt as string) || '';

  if (attrs.type === 'external' && url) {
    return `![${alt}](${url})`;
  }

  return '';
}

/**
 * Convert blockCard node
 */
function convertBlockCard(node: ADFNode): string {
  const url = (node.attrs?.url as string) || '';
  return url ? `[${url}](${url})` : '';
}

/**
 * Convert panel node
 */
function convertPanel(node: ADFNode, options: ADFToMarkdownOptions): string {
  const content = node.content || [];
  const panelType = (node.attrs?.panelType as string) || 'info';

  const prefix = `> **${panelType.toUpperCase()}:**`;
  const body = content
    .map((child) => convertNode(child, options, 0))
    .filter((s) => s !== null)
    .join('\n');

  return `${prefix}\n> ${body.split('\n').join('\n> ')}`;
}

/**
 * Convert expand node
 */
function convertExpand(node: ADFNode, options: ADFToMarkdownOptions): string {
  const title = (node.attrs?.title as string) || 'Details';
  const content = node.content || [];

  const body = content
    .map((child) => convertNode(child, options, 0))
    .filter((s) => s !== null)
    .join('\n\n');

  return `<details>\n<summary>${title}</summary>\n\n${body}\n</details>`;
}

/**
 * Convert inline content to Markdown
 */
function convertInlineContent(nodes: ADFNode[], options: ADFToMarkdownOptions): string {
  let result = '';

  for (const node of nodes) {
    result += convertInlineNode(node, options);
  }

  return result;
}

/**
 * Convert a single inline node
 */
function convertInlineNode(node: ADFNode, options: ADFToMarkdownOptions): string {
  switch (node.type) {
    case 'text':
      return convertTextNode(node);

    case 'hardBreak':
      return '  \n';

    case 'mention':
      return convertMention(node, options);

    case 'emoji':
      return convertEmoji(node);

    case 'inlineCard':
      return convertInlineCard(node);

    default:
      return '';
  }
}

/**
 * Convert text node with marks
 */
function convertTextNode(node: ADFNode): string {
  let text = node.text || '';
  const marks = node.marks || [];

  // Apply marks in reverse order so nesting is correct
  for (const mark of [...marks].reverse()) {
    text = applyMark(text, mark);
  }

  return text;
}

/**
 * Apply a mark to text
 */
function applyMark(text: string, mark: ADFMark): string {
  switch (mark.type) {
    case 'strong':
      return `**${text}**`;

    case 'em':
      return `*${text}*`;

    case 'code':
      return `\`${text}\``;

    case 'strike':
      return `~~${text}~~`;

    case 'link': {
      const href = (mark.attrs?.href as string) || '';
      const title = mark.attrs?.title as string;
      if (title) {
        return `[${text}](${href} "${title}")`;
      }
      return `[${text}](${href})`;
    }

    case 'underline':
      // Markdown doesn't have native underline, use HTML
      return `<u>${text}</u>`;

    case 'subsup': {
      const type = mark.attrs?.type as string;
      if (type === 'sub') {
        return `<sub>${text}</sub>`;
      }
      return `<sup>${text}</sup>`;
    }

    default:
      return text;
  }
}

/**
 * Convert mention node
 */
function convertMention(node: ADFNode, options: ADFToMarkdownOptions): string {
  const id = (node.attrs?.id as string) || '';
  const text = node.attrs?.text as string;

  if (options.mentionFormatter) {
    return options.mentionFormatter(id, text);
  }

  return text || `@${id}`;
}

/**
 * Convert emoji node
 */
function convertEmoji(node: ADFNode): string {
  const shortName = (node.attrs?.shortName as string) || '';
  const text = node.attrs?.text as string;

  // Prefer Unicode representation if available
  if (text) {
    return text;
  }

  // Otherwise return shortname
  return shortName;
}

/**
 * Convert inlineCard node
 */
function convertInlineCard(node: ADFNode): string {
  const url = (node.attrs?.url as string) || '';
  return url ? `[${url}](${url})` : '';
}

export { convertNode, convertInlineContent };
