import { markdownToAdf } from '../src/markdown/toAdf.js';
import type { ADFDocument } from '../src/common/types.js';

describe('markdownToAdf', () => {
  describe('paragraphs', () => {
    it('should convert simple paragraph', () => {
      const result = markdownToAdf('Hello, world!');
      expect(result.type).toBe('doc');
      expect(result.version).toBe(1);
      expect(result.content).toHaveLength(1);
      expect(result.content[0].type).toBe('paragraph');
      expect(result.content[0].content?.[0].text).toBe('Hello, world!');
    });

    it('should convert multiple paragraphs', () => {
      const result = markdownToAdf('First paragraph.\n\nSecond paragraph.');
      expect(result.content).toHaveLength(2);
      expect(result.content[0].content?.[0].text).toBe('First paragraph.');
      expect(result.content[1].content?.[0].text).toBe('Second paragraph.');
    });
  });

  describe('headings', () => {
    it('should convert h1 heading', () => {
      const result = markdownToAdf('# Heading 1');
      expect(result.content[0].type).toBe('heading');
      expect(result.content[0].attrs?.level).toBe(1);
      expect(result.content[0].content?.[0].text).toBe('Heading 1');
    });

    it('should convert h2-h6 headings', () => {
      for (let level = 2; level <= 6; level++) {
        const result = markdownToAdf(`${'#'.repeat(level)} Heading ${level}`);
        expect(result.content[0].attrs?.level).toBe(level);
      }
    });
  });

  describe('formatting', () => {
    it('should convert bold text', () => {
      const result = markdownToAdf('**bold text**');
      const textNode = result.content[0].content?.[0];
      expect(textNode?.text).toBe('bold text');
      expect(textNode?.marks).toContainEqual({ type: 'strong' });
    });

    it('should convert italic text', () => {
      const result = markdownToAdf('*italic text*');
      const textNode = result.content[0].content?.[0];
      expect(textNode?.text).toBe('italic text');
      expect(textNode?.marks).toContainEqual({ type: 'em' });
    });

    it('should convert inline code', () => {
      const result = markdownToAdf('`code`');
      const textNode = result.content[0].content?.[0];
      expect(textNode?.text).toBe('code');
      expect(textNode?.marks).toContainEqual({ type: 'code' });
    });

    it('should convert strikethrough text', () => {
      const result = markdownToAdf('~~strikethrough~~');
      const textNode = result.content[0].content?.[0];
      expect(textNode?.text).toBe('strikethrough');
      expect(textNode?.marks).toContainEqual({ type: 'strike' });
    });
  });

  describe('links', () => {
    it('should convert regular links', () => {
      const result = markdownToAdf('[Example](https://example.com)');
      const textNode = result.content[0].content?.[0];
      expect(textNode?.text).toBe('Example');
      expect(textNode?.marks?.[0].type).toBe('link');
      expect((textNode?.marks?.[0].attrs as { href: string })?.href).toBe('https://example.com');
    });

    it('should convert Jira links to smart links', () => {
      const result = markdownToAdf('[PROJ-123](https://company.atlassian.net/browse/PROJ-123)');
      expect(result.content[0].type).toBe('paragraph');
      const inlineCard = result.content[0].content?.[0];
      expect(inlineCard?.type).toBe('inlineCard');
      expect((inlineCard?.attrs as { url: string })?.url).toBe(
        'https://company.atlassian.net/browse/PROJ-123'
      );
    });

    it('should not convert non-Atlassian links to smart links', () => {
      const result = markdownToAdf('[Example](https://example.com)', { enableSmartLinks: true });
      const textNode = result.content[0].content?.[0];
      expect(textNode?.marks?.[0].type).toBe('link');
    });
  });

  describe('code blocks', () => {
    it('should convert fenced code block', () => {
      const result = markdownToAdf('```javascript\nconst x = 1;\n```');
      expect(result.content[0].type).toBe('codeBlock');
      expect(result.content[0].attrs?.language).toBe('javascript');
      expect(result.content[0].content?.[0].text).toBe('const x = 1;');
    });

    it('should convert code block without language', () => {
      const result = markdownToAdf('```\ncode here\n```');
      expect(result.content[0].type).toBe('codeBlock');
      expect(result.content[0].attrs?.language).toBeUndefined();
    });
  });

  describe('lists', () => {
    it('should convert bullet list', () => {
      const result = markdownToAdf('- Item 1\n- Item 2\n- Item 3');
      expect(result.content[0].type).toBe('bulletList');
      expect(result.content[0].content).toHaveLength(3);
    });

    it('should convert ordered list', () => {
      const result = markdownToAdf('1. First\n2. Second\n3. Third');
      expect(result.content[0].type).toBe('orderedList');
      expect(result.content[0].content).toHaveLength(3);
    });

    it('should convert task list', () => {
      const result = markdownToAdf('- [ ] Todo\n- [x] Done');
      expect(result.content[0].type).toBe('taskList');
      expect(result.content[0].content?.[0].attrs?.state).toBe('TODO');
      expect(result.content[0].content?.[1].attrs?.state).toBe('DONE');
    });
  });

  describe('blockquotes', () => {
    it('should convert blockquote', () => {
      const result = markdownToAdf('> This is a quote');
      expect(result.content[0].type).toBe('blockquote');
    });
  });

  describe('horizontal rule', () => {
    it('should convert horizontal rule', () => {
      const result = markdownToAdf('---');
      expect(result.content[0].type).toBe('rule');
    });
  });

  describe('tables', () => {
    it('should convert table', () => {
      const markdown = `| Header 1 | Header 2 |
| --- | --- |
| Cell 1 | Cell 2 |`;
      const result = markdownToAdf(markdown);
      expect(result.content[0].type).toBe('table');
      expect(result.content[0].content).toHaveLength(2); // header row + data row
    });
  });

  describe('mentions', () => {
    it('should convert mentions with default resolver', () => {
      const result = markdownToAdf('Hello @johndoe');
      const mention = result.content[0].content?.find((n) => n.type === 'mention');
      expect(mention?.type).toBe('mention');
      expect((mention?.attrs as { id: string })?.id).toBe('johndoe');
    });

    it('should use custom mention resolver', () => {
      const result = markdownToAdf('Hello @johndoe', {
        mentionResolver: (username) => ({ id: `user-${username}`, text: `@${username}` }),
      });
      const mention = result.content[0].content?.find((n) => n.type === 'mention');
      expect((mention?.attrs as { id: string })?.id).toBe('user-johndoe');
    });
  });

  describe('emojis', () => {
    it('should convert emoji shortcodes', () => {
      const result = markdownToAdf('Hello :smile:');
      const emoji = result.content[0].content?.find((n) => n.type === 'emoji');
      expect(emoji?.type).toBe('emoji');
      expect((emoji?.attrs as { shortName: string })?.shortName).toBe(':smile:');
    });

    it('should keep invalid emoji as text', () => {
      const result = markdownToAdf('Hello :notanemoji:');
      const hasEmoji = result.content[0].content?.some((n) => n.type === 'emoji');
      expect(hasEmoji).toBeFalsy();
    });
  });
});
