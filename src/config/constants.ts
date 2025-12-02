// Atlassian URL patterns for smart link detection
export const JIRA_ISSUE_PATTERN = /https:\/\/[\w.-]+\.atlassian\.net\/browse\/[A-Z]+-\d+/;
export const CONFLUENCE_PAGE_PATTERN = /https:\/\/[\w.-]+\.atlassian\.net\/wiki\//;
export const JIRA_BOARD_PATTERN = /https:\/\/[\w.-]+\.atlassian\.net\/jira\//;

// Mention pattern in markdown: @username or @[display name](id)
export const MENTION_PATTERN = /@(\w+)/g;
export const MENTION_WITH_ID_PATTERN = /@\[([^\]]+)\]\(([^)]+)\)/g;

// Emoji pattern: :shortname:
export const EMOJI_PATTERN = /:([a-zA-Z0-9_+-]+):/g;

// ADF version
export const ADF_VERSION = 1 as const;

// Supported ADF node types
export const ADF_BLOCK_NODES = [
  'paragraph',
  'heading',
  'codeBlock',
  'blockquote',
  'bulletList',
  'orderedList',
  'taskList',
  'table',
  'mediaSingle',
  'rule',
  'panel',
  'expand',
] as const;

export const ADF_INLINE_NODES = [
  'text',
  'hardBreak',
  'mention',
  'emoji',
  'inlineCard',
  'date',
  'status',
] as const;

export const ADF_MARK_TYPES = [
  'strong',
  'em',
  'code',
  'strike',
  'underline',
  'link',
  'subsup',
  'textColor',
] as const;
