import { markdownToAdf } from '../src/markdown/toAdf.js';
import { adfToMarkdown } from '../src/adf/toMarkdown.js';

describe('Round Trip Conversion', () => {
  describe('basic content', () => {
    it('should round-trip simple paragraph', () => {
      const original = 'Hello, world!';
      const adf = markdownToAdf(original);
      const result = adfToMarkdown(adf);
      expect(result).toBe(original);
    });

    it('should round-trip headings', () => {
      const original = '# Heading 1';
      const adf = markdownToAdf(original);
      const result = adfToMarkdown(adf);
      expect(result).toBe(original);
    });

    it('should round-trip horizontal rule', () => {
      const original = '---';
      const adf = markdownToAdf(original);
      const result = adfToMarkdown(adf);
      expect(result).toBe(original);
    });
  });

  describe('formatting', () => {
    it('should round-trip bold text', () => {
      const original = '**bold text**';
      const adf = markdownToAdf(original);
      const result = adfToMarkdown(adf);
      expect(result).toBe(original);
    });

    it('should round-trip italic text', () => {
      const original = '*italic text*';
      const adf = markdownToAdf(original);
      const result = adfToMarkdown(adf);
      expect(result).toBe(original);
    });

    it('should round-trip inline code', () => {
      const original = '`code`';
      const adf = markdownToAdf(original);
      const result = adfToMarkdown(adf);
      expect(result).toBe(original);
    });

    it('should round-trip strikethrough', () => {
      const original = '~~strikethrough~~';
      const adf = markdownToAdf(original);
      const result = adfToMarkdown(adf);
      expect(result).toBe(original);
    });
  });

  describe('code blocks', () => {
    it('should round-trip code block with language', () => {
      const original = '```javascript\nconst x = 1;\n```';
      const adf = markdownToAdf(original);
      const result = adfToMarkdown(adf);
      expect(result).toBe(original);
    });
  });

  describe('lists', () => {
    it('should round-trip bullet list', () => {
      const original = '- Item 1\n- Item 2';
      const adf = markdownToAdf(original);
      const result = adfToMarkdown(adf);
      expect(result).toBe(original);
    });

    it('should round-trip ordered list', () => {
      const original = '1. First\n2. Second';
      const adf = markdownToAdf(original);
      const result = adfToMarkdown(adf);
      expect(result).toBe(original);
    });

    it('should round-trip task list', () => {
      const original = '- [ ] Todo\n- [x] Done';
      const adf = markdownToAdf(original);
      const result = adfToMarkdown(adf);
      expect(result).toBe(original);
    });
  });

  describe('blockquotes', () => {
    it('should round-trip simple blockquote', () => {
      const original = '> Quoted text';
      const adf = markdownToAdf(original);
      const result = adfToMarkdown(adf);
      expect(result).toBe(original);
    });
  });

  describe('links', () => {
    it('should round-trip regular links', () => {
      const original = '[Example](https://example.com)';
      const adf = markdownToAdf(original, { enableSmartLinks: false });
      const result = adfToMarkdown(adf);
      expect(result).toBe(original);
    });
  });

  describe('complex documents', () => {
    it('should handle mixed content', () => {
      const original = `# Main Title

This is a paragraph with **bold** and *italic* text.

## Section

- First item
- Second item

\`\`\`javascript
const code = true;
\`\`\``;

      const adf = markdownToAdf(original);
      const result = adfToMarkdown(adf);

      // Verify key elements are preserved
      expect(result).toContain('# Main Title');
      expect(result).toContain('**bold**');
      expect(result).toContain('*italic*');
      expect(result).toContain('## Section');
      expect(result).toContain('- First item');
      expect(result).toContain('```javascript');
    });
  });
});
