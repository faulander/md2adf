// ADF Node Types
export interface ADFNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: ADFNode[];
  marks?: ADFMark[];
  text?: string;
}

export interface ADFMark {
  type: string;
  attrs?: Record<string, unknown>;
}

export interface ADFDocument {
  version: 1;
  type: 'doc';
  content: ADFNode[];
}

// Text node
export interface ADFTextNode extends ADFNode {
  type: 'text';
  text: string;
  marks?: ADFMark[];
}

// Paragraph node
export interface ADFParagraphNode extends ADFNode {
  type: 'paragraph';
  content?: ADFNode[];
}

// Heading node
export interface ADFHeadingNode extends ADFNode {
  type: 'heading';
  attrs: {
    level: 1 | 2 | 3 | 4 | 5 | 6;
  };
  content?: ADFNode[];
}

// Code block node
export interface ADFCodeBlockNode extends ADFNode {
  type: 'codeBlock';
  attrs?: {
    language?: string;
  };
  content?: ADFTextNode[];
}

// Blockquote node
export interface ADFBlockquoteNode extends ADFNode {
  type: 'blockquote';
  content: ADFNode[];
}

// List nodes
export interface ADFBulletListNode extends ADFNode {
  type: 'bulletList';
  content: ADFListItemNode[];
}

export interface ADFOrderedListNode extends ADFNode {
  type: 'orderedList';
  attrs?: {
    order?: number;
  };
  content: ADFListItemNode[];
}

export interface ADFListItemNode extends ADFNode {
  type: 'listItem';
  content: ADFNode[];
}

// Task list nodes
export interface ADFTaskListNode extends ADFNode {
  type: 'taskList';
  attrs: {
    localId: string;
  };
  content: ADFTaskItemNode[];
}

export interface ADFTaskItemNode extends ADFNode {
  type: 'taskItem';
  attrs: {
    localId: string;
    state: 'TODO' | 'DONE';
  };
  content?: ADFNode[];
}

// Table nodes
export interface ADFTableNode extends ADFNode {
  type: 'table';
  attrs?: {
    isNumberColumnEnabled?: boolean;
    layout?: 'default' | 'wide' | 'full-width';
  };
  content: ADFTableRowNode[];
}

export interface ADFTableRowNode extends ADFNode {
  type: 'tableRow';
  content: (ADFTableHeaderNode | ADFTableCellNode)[];
}

export interface ADFTableHeaderNode extends ADFNode {
  type: 'tableHeader';
  attrs?: {
    colspan?: number;
    rowspan?: number;
    colwidth?: number[];
  };
  content: ADFNode[];
}

export interface ADFTableCellNode extends ADFNode {
  type: 'tableCell';
  attrs?: {
    colspan?: number;
    rowspan?: number;
    colwidth?: number[];
  };
  content: ADFNode[];
}

// Media nodes
export interface ADFMediaSingleNode extends ADFNode {
  type: 'mediaSingle';
  attrs?: {
    layout?: 'wrap-left' | 'center' | 'wrap-right' | 'wide' | 'full-width';
  };
  content: ADFMediaNode[];
}

export interface ADFMediaNode extends ADFNode {
  type: 'media';
  attrs: {
    type: 'file' | 'link' | 'external';
    id?: string;
    collection?: string;
    url?: string;
    width?: number;
    height?: number;
    alt?: string;
  };
}

// Inline nodes
export interface ADFMentionNode extends ADFNode {
  type: 'mention';
  attrs: {
    id: string;
    text?: string;
    accessLevel?: string;
  };
}

export interface ADFEmojiNode extends ADFNode {
  type: 'emoji';
  attrs: {
    shortName: string;
    id?: string;
    text?: string;
  };
}

export interface ADFHardBreakNode extends ADFNode {
  type: 'hardBreak';
}

export interface ADFRuleNode extends ADFNode {
  type: 'rule';
}

// Smart link nodes
export interface ADFInlineCardNode extends ADFNode {
  type: 'inlineCard';
  attrs: {
    url: string;
  };
}

export interface ADFBlockCardNode extends ADFNode {
  type: 'blockCard';
  attrs: {
    url: string;
  };
}

// Mark types
export interface ADFLinkMark extends ADFMark {
  type: 'link';
  attrs: {
    href: string;
    title?: string;
  };
}

export interface ADFStrongMark extends ADFMark {
  type: 'strong';
}

export interface ADFEmMark extends ADFMark {
  type: 'em';
}

export interface ADFCodeMark extends ADFMark {
  type: 'code';
}

export interface ADFStrikeMark extends ADFMark {
  type: 'strike';
}

export interface ADFUnderlineMark extends ADFMark {
  type: 'underline';
}

export interface ADFSubSupMark extends ADFMark {
  type: 'subsup';
  attrs: {
    type: 'sub' | 'sup';
  };
}

// Converter Options
export interface MarkdownToADFOptions {
  mentionResolver?: MentionResolver;
  smartLinkResolver?: SmartLinkResolver;
  enableSmartLinks?: boolean;
}

export interface ADFToMarkdownOptions {
  mentionFormatter?: MentionFormatter;
}

// Resolvers and Formatters
export type MentionResolver = (username: string) => { id: string; text?: string } | null;
export type MentionFormatter = (id: string, text?: string) => string;
export type SmartLinkResolver = (url: string) => 'inline' | 'block' | 'link';

// Conversion Result
export interface ConversionResult<T> {
  success: boolean;
  data?: T;
  errors?: string[];
}
