import type { MarkdownToADFOptions, ADFToMarkdownOptions } from '../common/types.js';

export const defaultMarkdownToADFOptions: MarkdownToADFOptions = {
  enableSmartLinks: true,
  mentionResolver: undefined,
  smartLinkResolver: undefined,
};

export const defaultADFToMarkdownOptions: ADFToMarkdownOptions = {
  mentionFormatter: (id: string, text?: string) => {
    const displayText = text || id;
    return displayText.startsWith('@') ? displayText : `@${displayText}`;
  },
};
