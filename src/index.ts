// Main entry point for @faulander/markdown-adf-converter

// Core conversion functions
export { markdownToAdf } from './markdown/toAdf.js';
export { adfToMarkdown } from './adf/toMarkdown.js';

// Validation
export {
  validateADFDocument,
  assertValidADF,
  isValidBlockNode,
  isValidInlineNode,
  isValidMark,
} from './adf/validators.js';

// Smart links
export {
  detectSmartLinkType,
  isAtlassianUrl,
  extractJiraIssueKey,
  extractConfluencePageInfo,
} from './smartLinks/detector.js';
export {
  defaultSmartLinkResolver,
  createSmartLinkResolver,
  atlassianInlineResolver,
  atlassianBlockResolver,
  noSmartLinksResolver,
} from './smartLinks/resolver.js';

// Mentions
export {
  defaultMentionResolver,
  defaultMentionFormatter,
  parseMention,
  createMentionResolver,
  createMentionFormatter,
} from './mentions/resolver.js';

// Emojis
export {
  getEmojiUnicode,
  getEmojiShortname,
  isValidEmoji,
  getAllEmojiShortnames,
  replaceEmojiShortnames,
  replaceUnicodeEmojis,
} from './emojis/dictionary.js';

// Types
export type {
  // ADF Node types
  ADFDocument,
  ADFNode,
  ADFMark,
  ADFTextNode,
  ADFParagraphNode,
  ADFHeadingNode,
  ADFCodeBlockNode,
  ADFBlockquoteNode,
  ADFBulletListNode,
  ADFOrderedListNode,
  ADFListItemNode,
  ADFTaskListNode,
  ADFTaskItemNode,
  ADFTableNode,
  ADFTableRowNode,
  ADFTableHeaderNode,
  ADFTableCellNode,
  ADFMediaSingleNode,
  ADFMediaNode,
  ADFMentionNode,
  ADFEmojiNode,
  ADFHardBreakNode,
  ADFRuleNode,
  ADFInlineCardNode,
  ADFBlockCardNode,
  // Mark types
  ADFLinkMark,
  ADFStrongMark,
  ADFEmMark,
  ADFCodeMark,
  ADFStrikeMark,
  ADFUnderlineMark,
  ADFSubSupMark,
  // Options
  MarkdownToADFOptions,
  ADFToMarkdownOptions,
  // Resolvers
  MentionResolver,
  MentionFormatter,
  SmartLinkResolver,
  ConversionResult,
} from './common/types.js';

// Errors
export {
  ConversionError,
  InvalidMarkdownError,
  InvalidADFError,
  SchemaValidationError,
  UnsupportedNodeError,
} from './common/errors.js';

// Utilities
export { generateLocalId } from './markdown/utils.js';
