import { adfToMarkdown } from '../src/adf/toMarkdown.js';
import type { ADFDocument } from '../src/common/types.js';

describe('adfToMarkdown', () => {
  describe('paragraphs', () => {
    it('should convert simple paragraph', () => {
      const adf: ADFDocument = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Hello, world!' }],
          },
        ],
      };
      const result = adfToMarkdown(adf);
      expect(result).toBe('Hello, world!');
    });

    it('should convert multiple paragraphs', () => {
      const adf: ADFDocument = {
        version: 1,
        type: 'doc',
        content: [
          { type: 'paragraph', content: [{ type: 'text', text: 'First' }] },
          { type: 'paragraph', content: [{ type: 'text', text: 'Second' }] },
        ],
      };
      const result = adfToMarkdown(adf);
      expect(result).toBe('First\n\nSecond');
    });
  });

  describe('headings', () => {
    it('should convert headings', () => {
      const adf: ADFDocument = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: 'Title' }],
          },
        ],
      };
      const result = adfToMarkdown(adf);
      expect(result).toBe('# Title');
    });

    it('should convert all heading levels', () => {
      for (let level = 1; level <= 6; level++) {
        const adf: ADFDocument = {
          version: 1,
          type: 'doc',
          content: [
            {
              type: 'heading',
              attrs: { level: level as 1 | 2 | 3 | 4 | 5 | 6 },
              content: [{ type: 'text', text: 'Heading' }],
            },
          ],
        };
        const result = adfToMarkdown(adf);
        expect(result).toBe(`${'#'.repeat(level)} Heading`);
      }
    });
  });

  describe('formatting marks', () => {
    it('should convert bold text', () => {
      const adf: ADFDocument = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'bold', marks: [{ type: 'strong' }] },
            ],
          },
        ],
      };
      const result = adfToMarkdown(adf);
      expect(result).toBe('**bold**');
    });

    it('should convert italic text', () => {
      const adf: ADFDocument = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'italic', marks: [{ type: 'em' }] }],
          },
        ],
      };
      const result = adfToMarkdown(adf);
      expect(result).toBe('*italic*');
    });

    it('should convert inline code', () => {
      const adf: ADFDocument = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'code', marks: [{ type: 'code' }] }],
          },
        ],
      };
      const result = adfToMarkdown(adf);
      expect(result).toBe('`code`');
    });

    it('should convert strikethrough', () => {
      const adf: ADFDocument = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'strikethrough', marks: [{ type: 'strike' }] },
            ],
          },
        ],
      };
      const result = adfToMarkdown(adf);
      expect(result).toBe('~~strikethrough~~');
    });

    it('should convert links', () => {
      const adf: ADFDocument = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text: 'Example',
                marks: [{ type: 'link', attrs: { href: 'https://example.com' } }],
              },
            ],
          },
        ],
      };
      const result = adfToMarkdown(adf);
      expect(result).toBe('[Example](https://example.com)');
    });
  });

  describe('code blocks', () => {
    it('should convert code block with language', () => {
      const adf: ADFDocument = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'codeBlock',
            attrs: { language: 'javascript' },
            content: [{ type: 'text', text: 'const x = 1;' }],
          },
        ],
      };
      const result = adfToMarkdown(adf);
      expect(result).toBe('```javascript\nconst x = 1;\n```');
    });

    it('should convert code block without language', () => {
      const adf: ADFDocument = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'codeBlock',
            content: [{ type: 'text', text: 'code here' }],
          },
        ],
      };
      const result = adfToMarkdown(adf);
      expect(result).toBe('```\ncode here\n```');
    });
  });

  describe('lists', () => {
    it('should convert bullet list', () => {
      const adf: ADFDocument = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: 'Item 1' }] },
                ],
              },
              {
                type: 'listItem',
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: 'Item 2' }] },
                ],
              },
            ],
          },
        ],
      };
      const result = adfToMarkdown(adf);
      expect(result).toBe('- Item 1\n- Item 2');
    });

    it('should convert ordered list', () => {
      const adf: ADFDocument = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'orderedList',
            content: [
              {
                type: 'listItem',
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: 'First' }] },
                ],
              },
              {
                type: 'listItem',
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: 'Second' }] },
                ],
              },
            ],
          },
        ],
      };
      const result = adfToMarkdown(adf);
      expect(result).toBe('1. First\n2. Second');
    });

    it('should convert task list', () => {
      const adf: ADFDocument = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'taskList',
            attrs: { localId: 'test-id' },
            content: [
              {
                type: 'taskItem',
                attrs: { localId: 'task-1', state: 'TODO' },
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: 'Todo item' }] },
                ],
              },
              {
                type: 'taskItem',
                attrs: { localId: 'task-2', state: 'DONE' },
                content: [
                  { type: 'paragraph', content: [{ type: 'text', text: 'Done item' }] },
                ],
              },
            ],
          },
        ],
      };
      const result = adfToMarkdown(adf);
      expect(result).toBe('- [ ] Todo item\n- [x] Done item');
    });
  });

  describe('blockquotes', () => {
    it('should convert blockquote', () => {
      const adf: ADFDocument = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'blockquote',
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: 'Quoted text' }] },
            ],
          },
        ],
      };
      const result = adfToMarkdown(adf);
      expect(result).toBe('> Quoted text');
    });
  });

  describe('horizontal rule', () => {
    it('should convert rule', () => {
      const adf: ADFDocument = {
        version: 1,
        type: 'doc',
        content: [{ type: 'rule' }],
      };
      const result = adfToMarkdown(adf);
      expect(result).toBe('---');
    });
  });

  describe('tables', () => {
    it('should convert table', () => {
      const adf: ADFDocument = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'table',
            content: [
              {
                type: 'tableRow',
                content: [
                  {
                    type: 'tableHeader',
                    content: [
                      { type: 'paragraph', content: [{ type: 'text', text: 'Header 1' }] },
                    ],
                  },
                  {
                    type: 'tableHeader',
                    content: [
                      { type: 'paragraph', content: [{ type: 'text', text: 'Header 2' }] },
                    ],
                  },
                ],
              },
              {
                type: 'tableRow',
                content: [
                  {
                    type: 'tableCell',
                    content: [
                      { type: 'paragraph', content: [{ type: 'text', text: 'Cell 1' }] },
                    ],
                  },
                  {
                    type: 'tableCell',
                    content: [
                      { type: 'paragraph', content: [{ type: 'text', text: 'Cell 2' }] },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      };
      const result = adfToMarkdown(adf);
      expect(result).toContain('| Header 1 | Header 2 |');
      expect(result).toContain('| --- | --- |');
      expect(result).toContain('| Cell 1 | Cell 2 |');
    });
  });

  describe('mentions', () => {
    it('should convert mentions', () => {
      const adf: ADFDocument = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Hello ' },
              { type: 'mention', attrs: { id: 'user123', text: '@johndoe' } },
            ],
          },
        ],
      };
      const result = adfToMarkdown(adf);
      expect(result).toBe('Hello @johndoe');
    });

    it('should use custom mention formatter', () => {
      const adf: ADFDocument = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'mention', attrs: { id: 'user123', text: 'John Doe' } },
            ],
          },
        ],
      };
      const result = adfToMarkdown(adf, {
        mentionFormatter: (id, text) => `@[${text}](${id})`,
      });
      expect(result).toBe('@[John Doe](user123)');
    });
  });

  describe('emojis', () => {
    it('should convert emojis with text', () => {
      const adf: ADFDocument = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'emoji', attrs: { shortName: ':smile:', text: '😄' } },
            ],
          },
        ],
      };
      const result = adfToMarkdown(adf);
      expect(result).toBe('😄');
    });

    it('should fallback to shortname if no text', () => {
      const adf: ADFDocument = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'emoji', attrs: { shortName: ':smile:' } }],
          },
        ],
      };
      const result = adfToMarkdown(adf);
      expect(result).toBe(':smile:');
    });
  });

  describe('smart links', () => {
    it('should convert inlineCard', () => {
      const adf: ADFDocument = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'inlineCard', attrs: { url: 'https://jira.atlassian.net/browse/PROJ-123' } },
            ],
          },
        ],
      };
      const result = adfToMarkdown(adf);
      expect(result).toContain('[https://jira.atlassian.net/browse/PROJ-123]');
    });

    it('should convert blockCard', () => {
      const adf: ADFDocument = {
        version: 1,
        type: 'doc',
        content: [
          {
            type: 'blockCard',
            attrs: { url: 'https://confluence.atlassian.net/wiki/spaces/TEST/pages/123' },
          },
        ],
      };
      const result = adfToMarkdown(adf);
      expect(result).toContain('https://confluence.atlassian.net/wiki/spaces/TEST/pages/123');
    });
  });

  describe('error handling', () => {
    it('should throw for invalid ADF document', () => {
      expect(() => {
        adfToMarkdown({ type: 'invalid' } as unknown as ADFDocument);
      }).toThrow();
    });
  });
});
