import type Token from 'markdown-it/lib/token.mjs';
import type {
  ADFDocument,
  ADFNode,
  ADFMark,
  ADFTextNode,
  MarkdownToADFOptions,
} from '../common/types.js';
import { ADF_VERSION } from '../config/constants.js';
import { defaultMarkdownToADFOptions } from '../config/defaults.js';
import { parseMarkdown } from './parser.js';
import { generateLocalId, parseHeadingLevel, extractCodeLanguage } from './utils.js';
import { getEmojiUnicode, isValidEmoji } from '../emojis/dictionary.js';
import { defaultMentionResolver } from '../mentions/resolver.js';
import { defaultSmartLinkResolver } from '../smartLinks/resolver.js';

/**
 * Convert Markdown string to ADF document
 */
export function markdownToAdf(markdown: string, options: MarkdownToADFOptions = {}): ADFDocument {
  const opts = { ...defaultMarkdownToADFOptions, ...options };
  const tokens = parseMarkdown(markdown);
  const content = convertTokens(tokens, opts);

  return {
    version: ADF_VERSION,
    type: 'doc',
    content,
  };
}

/**
 * Convert markdown-it tokens to ADF nodes
 */
function convertTokens(tokens: Token[], options: MarkdownToADFOptions): ADFNode[] {
  const nodes: ADFNode[] = [];
  let i = 0;

  while (i < tokens.length) {
    const result = convertToken(tokens, i, options);

    if (result.node) {
      nodes.push(result.node);
    }

    i = result.nextIndex;
  }

  return nodes;
}

interface ConvertResult {
  node: ADFNode | null;
  nextIndex: number;
}

/**
 * Convert a single token and its children
 */
function convertToken(
  tokens: Token[],
  index: number,
  options: MarkdownToADFOptions
): ConvertResult {
  const token = tokens[index];

  switch (token.type) {
    case 'paragraph_open':
      return convertParagraph(tokens, index, options);

    case 'heading_open':
      return convertHeading(tokens, index, options);

    case 'code_block':
    case 'fence':
      return convertCodeBlock(token, index);

    case 'blockquote_open':
      return convertBlockquote(tokens, index, options);

    case 'bullet_list_open':
      return convertBulletList(tokens, index, options);

    case 'ordered_list_open':
      return convertOrderedList(tokens, index, options);

    case 'table_open':
      return convertTable(tokens, index, options);

    case 'hr':
      return { node: { type: 'rule' }, nextIndex: index + 1 };

    default:
      // Skip unknown or closing tokens
      return { node: null, nextIndex: index + 1 };
  }
}

/**
 * Convert paragraph token
 */
function convertParagraph(
  tokens: Token[],
  startIndex: number,
  options: MarkdownToADFOptions
): ConvertResult {
  let i = startIndex + 1;
  const content: ADFNode[] = [];

  while (i < tokens.length && tokens[i].type !== 'paragraph_close') {
    if (tokens[i].type === 'inline') {
      const inlineNodes = convertInlineTokens(tokens[i], options);
      content.push(...inlineNodes);
    }
    i++;
  }

  // Check if this is a task list item by looking at content
  const isTaskItem = content.length > 0 && isTaskListContent(content);

  if (isTaskItem) {
    return {
      node: {
        type: 'paragraph',
        content: content.filter((n) => n.type !== 'taskMarker'),
      },
      nextIndex: i + 1,
    };
  }

  return {
    node: {
      type: 'paragraph',
      content: content.length > 0 ? content : undefined,
    },
    nextIndex: i + 1,
  };
}

/**
 * Check if content represents a task list item
 */
function isTaskListContent(content: ADFNode[]): boolean {
  if (content.length === 0) return false;
  const firstNode = content[0];
  if (firstNode.type === 'text' && firstNode.text) {
    return /^\[[ x]\]\s/.test(firstNode.text);
  }
  return false;
}

/**
 * Convert heading token
 */
function convertHeading(
  tokens: Token[],
  startIndex: number,
  options: MarkdownToADFOptions
): ConvertResult {
  const openToken = tokens[startIndex];
  const level = parseHeadingLevel(openToken.tag);
  let i = startIndex + 1;
  const content: ADFNode[] = [];

  while (i < tokens.length && tokens[i].type !== 'heading_close') {
    if (tokens[i].type === 'inline') {
      const inlineNodes = convertInlineTokens(tokens[i], options);
      content.push(...inlineNodes);
    }
    i++;
  }

  return {
    node: {
      type: 'heading',
      attrs: { level },
      content: content.length > 0 ? content : undefined,
    },
    nextIndex: i + 1,
  };
}

/**
 * Convert code block token
 */
function convertCodeBlock(token: Token, index: number): ConvertResult {
  const language = extractCodeLanguage(token.info || '');
  const content = token.content;

  return {
    node: {
      type: 'codeBlock',
      attrs: language ? { language } : undefined,
      content: content
        ? [
            {
              type: 'text',
              text: content.replace(/\n$/, ''), // Remove trailing newline
            },
          ]
        : undefined,
    },
    nextIndex: index + 1,
  };
}

/**
 * Convert blockquote token
 */
function convertBlockquote(
  tokens: Token[],
  startIndex: number,
  options: MarkdownToADFOptions
): ConvertResult {
  let i = startIndex + 1;
  const content: ADFNode[] = [];
  let depth = 1;

  while (i < tokens.length && depth > 0) {
    const token = tokens[i];

    if (token.type === 'blockquote_open') {
      depth++;
    } else if (token.type === 'blockquote_close') {
      depth--;
      if (depth === 0) break;
    } else if (depth === 1) {
      const result = convertToken(tokens, i, options);
      if (result.node) {
        content.push(result.node);
      }
      i = result.nextIndex - 1;
    }
    i++;
  }

  return {
    node: {
      type: 'blockquote',
      content,
    },
    nextIndex: i + 1,
  };
}

/**
 * Convert bullet list token
 */
function convertBulletList(
  tokens: Token[],
  startIndex: number,
  options: MarkdownToADFOptions
): ConvertResult {
  let i = startIndex + 1;
  const items: ADFNode[] = [];
  let isTaskList = false;

  while (i < tokens.length && tokens[i].type !== 'bullet_list_close') {
    if (tokens[i].type === 'list_item_open') {
      const result = convertListItem(tokens, i, options);
      if (result.node) {
        // Check if this is a task item
        if (result.isTask) {
          isTaskList = true;
        }
        items.push(result.node);
      }
      i = result.nextIndex;
    } else {
      i++;
    }
  }

  if (isTaskList) {
    return {
      node: {
        type: 'taskList',
        attrs: { localId: generateLocalId() },
        content: items.map((item) => convertToTaskItem(item)),
      },
      nextIndex: i + 1,
    };
  }

  return {
    node: {
      type: 'bulletList',
      content: items,
    },
    nextIndex: i + 1,
  };
}

/**
 * Convert ordered list token
 */
function convertOrderedList(
  tokens: Token[],
  startIndex: number,
  options: MarkdownToADFOptions
): ConvertResult {
  const openToken = tokens[startIndex];
  let i = startIndex + 1;
  const items: ADFNode[] = [];

  while (i < tokens.length && tokens[i].type !== 'ordered_list_close') {
    if (tokens[i].type === 'list_item_open') {
      const result = convertListItem(tokens, i, options);
      if (result.node) {
        items.push(result.node);
      }
      i = result.nextIndex;
    } else {
      i++;
    }
  }

  const order = openToken.attrGet('start');

  return {
    node: {
      type: 'orderedList',
      attrs: order && order !== '1' ? { order: parseInt(order, 10) } : undefined,
      content: items,
    },
    nextIndex: i + 1,
  };
}

/**
 * Convert list item token
 */
function convertListItem(
  tokens: Token[],
  startIndex: number,
  options: MarkdownToADFOptions
): { node: ADFNode | null; nextIndex: number; isTask: boolean } {
  let i = startIndex + 1;
  const content: ADFNode[] = [];
  let isTask = false;
  let taskState: 'TODO' | 'DONE' = 'TODO';

  while (i < tokens.length && tokens[i].type !== 'list_item_close') {
    const result = convertToken(tokens, i, options);

    if (result.node) {
      // Check if first paragraph contains task marker
      if (result.node.type === 'paragraph' && content.length === 0) {
        const taskInfo = extractTaskInfo(result.node);
        if (taskInfo.isTask) {
          isTask = true;
          taskState = taskInfo.state;
          result.node = taskInfo.cleanedNode;
        }
      }
      content.push(result.node);
    }
    i = result.nextIndex;
  }

  return {
    node: {
      type: 'listItem',
      content,
      // Store task state temporarily
      ...(isTask ? { attrs: { taskState } } : {}),
    } as ADFNode,
    nextIndex: i + 1,
    isTask,
  };
}

/**
 * Extract task info from paragraph node
 */
function extractTaskInfo(node: ADFNode): {
  isTask: boolean;
  state: 'TODO' | 'DONE';
  cleanedNode: ADFNode;
} {
  if (!node.content || node.content.length === 0) {
    return { isTask: false, state: 'TODO', cleanedNode: node };
  }

  const firstChild = node.content[0];
  if (firstChild.type !== 'text' || !firstChild.text) {
    return { isTask: false, state: 'TODO', cleanedNode: node };
  }

  const text = firstChild.text;
  const todoMatch = text.match(/^\[ \]\s*/);
  const doneMatch = text.match(/^\[x\]\s*/i);

  if (todoMatch || doneMatch) {
    const state = doneMatch ? 'DONE' : 'TODO';
    const matchLength = (todoMatch || doneMatch)![0].length;
    const remainingText = text.substring(matchLength);

    const newContent = [...node.content];
    if (remainingText) {
      newContent[0] = { ...firstChild, text: remainingText };
    } else {
      newContent.shift();
    }

    return {
      isTask: true,
      state,
      cleanedNode: {
        ...node,
        content: newContent.length > 0 ? newContent : undefined,
      },
    };
  }

  return { isTask: false, state: 'TODO', cleanedNode: node };
}

/**
 * Convert list item to task item
 */
function convertToTaskItem(listItem: ADFNode): ADFNode {
  const attrs = listItem.attrs as { taskState?: 'TODO' | 'DONE' } | undefined;
  const state = attrs?.taskState || 'TODO';

  return {
    type: 'taskItem',
    attrs: {
      localId: generateLocalId(),
      state,
    },
    content: listItem.content,
  };
}

/**
 * Convert table token
 */
function convertTable(
  tokens: Token[],
  startIndex: number,
  options: MarkdownToADFOptions
): ConvertResult {
  let i = startIndex + 1;
  const rows: ADFNode[] = [];
  let inHeader = false;

  while (i < tokens.length && tokens[i].type !== 'table_close') {
    const token = tokens[i];

    if (token.type === 'thead_open') {
      inHeader = true;
    } else if (token.type === 'thead_close') {
      inHeader = false;
    } else if (token.type === 'tr_open') {
      const result = convertTableRow(tokens, i, inHeader, options);
      if (result.node) {
        rows.push(result.node);
      }
      i = result.nextIndex - 1;
    }
    i++;
  }

  return {
    node: {
      type: 'table',
      content: rows,
    },
    nextIndex: i + 1,
  };
}

/**
 * Convert table row token
 */
function convertTableRow(
  tokens: Token[],
  startIndex: number,
  isHeader: boolean,
  options: MarkdownToADFOptions
): ConvertResult {
  let i = startIndex + 1;
  const cells: ADFNode[] = [];

  while (i < tokens.length && tokens[i].type !== 'tr_close') {
    const token = tokens[i];

    if (token.type === 'th_open' || token.type === 'td_open') {
      const result = convertTableCell(tokens, i, isHeader || token.type === 'th_open', options);
      if (result.node) {
        cells.push(result.node);
      }
      i = result.nextIndex - 1;
    }
    i++;
  }

  return {
    node: {
      type: 'tableRow',
      content: cells,
    },
    nextIndex: i + 1,
  };
}

/**
 * Convert table cell token
 */
function convertTableCell(
  tokens: Token[],
  startIndex: number,
  isHeader: boolean,
  options: MarkdownToADFOptions
): ConvertResult {
  let i = startIndex + 1;
  const content: ADFNode[] = [];

  while (i < tokens.length && tokens[i].type !== 'th_close' && tokens[i].type !== 'td_close') {
    if (tokens[i].type === 'inline') {
      const inlineNodes = convertInlineTokens(tokens[i], options);
      // Wrap inline content in paragraph for table cells
      if (inlineNodes.length > 0) {
        content.push({
          type: 'paragraph',
          content: inlineNodes,
        });
      }
    }
    i++;
  }

  return {
    node: {
      type: isHeader ? 'tableHeader' : 'tableCell',
      content: content.length > 0 ? content : [{ type: 'paragraph' }],
    },
    nextIndex: i + 1,
  };
}

/**
 * Convert inline tokens to ADF nodes
 */
function convertInlineTokens(token: Token, options: MarkdownToADFOptions): ADFNode[] {
  const nodes: ADFNode[] = [];
  const children = token.children || [];
  const markStack: ADFMark[] = [];

  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    switch (child.type) {
      case 'text':
        if (child.content) {
          const textNodes = processTextContent(child.content, markStack, options);
          nodes.push(...textNodes);
        }
        break;

      case 'code_inline':
        nodes.push({
          type: 'text',
          text: child.content,
          marks: [{ type: 'code' }],
        });
        break;

      case 'softbreak':
        nodes.push({ type: 'text', text: ' ' });
        break;

      case 'hardbreak':
        nodes.push({ type: 'hardBreak' });
        break;

      case 'strong_open':
        markStack.push({ type: 'strong' });
        break;

      case 'strong_close':
        removeMarkFromStack(markStack, 'strong');
        break;

      case 'em_open':
        markStack.push({ type: 'em' });
        break;

      case 'em_close':
        removeMarkFromStack(markStack, 'em');
        break;

      case 's_open':
        markStack.push({ type: 'strike' });
        break;

      case 's_close':
        removeMarkFromStack(markStack, 'strike');
        break;

      case 'link_open': {
        const href = child.attrGet('href') || '';
        const title = child.attrGet('title');

        // Check for smart links
        if (options.enableSmartLinks) {
          const resolver = options.smartLinkResolver || defaultSmartLinkResolver;
          const linkType = resolver(href);

          if (linkType === 'inline') {
            // Consume the link content and close token
            while (i < children.length && children[i].type !== 'link_close') {
              i++;
            }
            nodes.push({
              type: 'inlineCard',
              attrs: { url: href },
            });
            break;
          } else if (linkType === 'block') {
            // Block cards should be at block level, but for inline context, use inline
            while (i < children.length && children[i].type !== 'link_close') {
              i++;
            }
            nodes.push({
              type: 'inlineCard',
              attrs: { url: href },
            });
            break;
          }
        }

        // Regular link
        markStack.push({
          type: 'link',
          attrs: {
            href,
            ...(title ? { title } : {}),
          },
        });
        break;
      }

      case 'link_close':
        removeMarkFromStack(markStack, 'link');
        break;

      case 'image': {
        const src = child.attrGet('src') || '';
        const alt = child.attrGet('alt') || child.content || '';

        nodes.push({
          type: 'mediaSingle',
          attrs: { layout: 'center' },
          content: [
            {
              type: 'media',
              attrs: {
                type: 'external',
                url: src,
                alt: alt || undefined,
              },
            },
          ],
        });
        break;
      }
    }
  }

  return nodes;
}

/**
 * Process text content for mentions and emojis
 */
function processTextContent(
  text: string,
  marks: ADFMark[],
  options: MarkdownToADFOptions
): ADFNode[] {
  const nodes: ADFNode[] = [];
  const remaining = text;

  // Pattern to match mentions and emojis
  const pattern = /(@\w+|:[a-zA-Z0-9_+-]+:)/g;
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(remaining)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      const beforeText = remaining.substring(lastIndex, match.index);
      nodes.push(createTextNode(beforeText, marks));
    }

    const matched = match[0];

    // Check if it's a mention
    if (matched.startsWith('@')) {
      const username = matched.substring(1);
      const resolver = options.mentionResolver || defaultMentionResolver;
      const mentionInfo = resolver(username);

      if (mentionInfo) {
        nodes.push({
          type: 'mention',
          attrs: {
            id: mentionInfo.id,
            text: mentionInfo.text || `@${username}`,
          },
        });
      } else {
        // Keep as plain text if resolver returns null
        nodes.push(createTextNode(matched, marks));
      }
    }
    // Check if it's an emoji
    else if (matched.startsWith(':') && matched.endsWith(':')) {
      const shortname = matched.slice(1, -1);
      if (isValidEmoji(shortname)) {
        nodes.push({
          type: 'emoji',
          attrs: {
            shortName: `:${shortname}:`,
            text: getEmojiUnicode(shortname),
          },
        });
      } else {
        // Keep as plain text if not a valid emoji
        nodes.push(createTextNode(matched, marks));
      }
    }

    lastIndex = pattern.lastIndex;
  }

  // Add remaining text
  if (lastIndex < remaining.length) {
    nodes.push(createTextNode(remaining.substring(lastIndex), marks));
  }

  // If no matches found, just return the text
  if (nodes.length === 0 && text) {
    nodes.push(createTextNode(text, marks));
  }

  return nodes;
}

/**
 * Create a text node with marks
 */
function createTextNode(text: string, marks: ADFMark[]): ADFTextNode {
  return {
    type: 'text',
    text,
    ...(marks.length > 0 ? { marks: [...marks] } : {}),
  };
}

/**
 * Remove a mark from the stack
 */
function removeMarkFromStack(stack: ADFMark[], type: string): void {
  const index = stack.findIndex((m) => m.type === type);
  if (index !== -1) {
    stack.splice(index, 1);
  }
}

export { convertTokens, convertInlineTokens };
