# @faulander/markdown-adf-converter

Bidirectional converter between **Markdown** and **Atlassian Document Format (ADF)** with built-in support for mentions, emojis, and smart links.

## Features

- **Bidirectional conversion** - Convert Markdown to ADF and ADF back to Markdown
- **Mentions** - Parse `@username` syntax and convert to/from ADF mention nodes
- **Emojis** - Support for `:shortcode:` emoji syntax with Unicode mapping
- **Smart Links** - Automatic detection of Jira/Confluence URLs as inline/block cards
- **Full Markdown support** - Headings, lists, task lists, tables, code blocks, blockquotes, and more
- **ADF validation** - JSON schema validation with semantic checks
- **TypeScript** - Full type definitions included
- **Dual build** - ESM and CommonJS outputs

## Installation

```bash
npm install @faulander/markdown-adf-converter
```

## Quick Start

### Markdown to ADF

```typescript
import { markdownToAdf } from '@faulander/markdown-adf-converter';

const markdown = `
# Hello World

This is a **bold** statement with a :smile: emoji.

- Task 1
- [x] Task 2 (done)

Check out [PROJ-123](https://company.atlassian.net/browse/PROJ-123)
`;

const adf = markdownToAdf(markdown);
console.log(JSON.stringify(adf, null, 2));
```

### ADF to Markdown

```typescript
import { adfToMarkdown } from '@faulander/markdown-adf-converter';

const adf = {
  version: 1,
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: 'Hello ', marks: [{ type: 'strong' }] },
        { type: 'text', text: 'World!' }
      ]
    }
  ]
};

const markdown = adfToMarkdown(adf);
console.log(markdown); // **Hello** World!
```

## API Reference

### Core Functions

#### `markdownToAdf(markdown, options?)`

Converts a Markdown string to an ADF document.

```typescript
import { markdownToAdf } from '@faulander/markdown-adf-converter';

const adf = markdownToAdf('# Hello World', {
  enableSmartLinks: true,
  mentionResolver: (username) => ({ id: `user-${username}`, text: `@${username}` }),
  smartLinkResolver: (url) => 'inline' | 'block' | 'link'
});
```

**Options:**
- `enableSmartLinks` - Enable automatic smart link detection (default: `true`)
- `mentionResolver` - Custom function to resolve `@mentions` to user IDs
- `smartLinkResolver` - Custom function to determine link type

#### `adfToMarkdown(adf, options?)`

Converts an ADF document to a Markdown string.

```typescript
import { adfToMarkdown } from '@faulander/markdown-adf-converter';

const markdown = adfToMarkdown(adfDocument, {
  mentionFormatter: (id, text) => `@${text || id}`
});
```

**Options:**
- `mentionFormatter` - Custom function to format mentions in Markdown output

### Smart Links

Smart links automatically convert Atlassian URLs to inline or block cards.

```typescript
import {
  detectSmartLinkType,
  isAtlassianUrl,
  createSmartLinkResolver
} from '@faulander/markdown-adf-converter';

// Detect link type
detectSmartLinkType('https://company.atlassian.net/browse/PROJ-123'); // 'inline'
detectSmartLinkType('https://company.atlassian.net/wiki/spaces/DOC'); // 'block'
detectSmartLinkType('https://example.com'); // 'link'

// Create custom resolver
const resolver = createSmartLinkResolver({
  inlineDomains: ['github.com'],
  blockDomains: ['notion.so'],
  fallbackToAtlassianDetection: true
});
```

### Mentions

```typescript
import {
  createMentionResolver,
  createMentionFormatter,
  parseMention
} from '@faulander/markdown-adf-converter';

// Create resolver with user mapping
const resolver = createMentionResolver({
  'johndoe': 'user-123',
  'janedoe': 'user-456'
});

// Create custom formatter
const formatter = createMentionFormatter('linked'); // @[display](id)

// Parse mention strings
parseMention('@johndoe'); // { username: 'johndoe' }
parseMention('@[John Doe](user-123)'); // { displayName: 'John Doe', id: 'user-123' }
```

### Emojis

```typescript
import {
  getEmojiUnicode,
  getEmojiShortname,
  isValidEmoji,
  replaceEmojiShortnames
} from '@faulander/markdown-adf-converter';

getEmojiUnicode('smile'); // '😄'
getEmojiShortname('😄'); // 'smile'
isValidEmoji('thumbsup'); // true
replaceEmojiShortnames('Hello :wave:!'); // 'Hello 👋!'
```

### Validation

```typescript
import { validateADFDocument, assertValidADF } from '@faulander/markdown-adf-converter';

// Validate and get errors
const result = validateADFDocument(adf);
if (!result.valid) {
  console.error(result.errors);
}

// Assert valid (throws on invalid)
assertValidADF(adf);
```

## Supported Markdown Syntax

| Syntax | Example | ADF Node Type |
|--------|---------|---------------|
| Headings | `# H1` to `###### H6` | `heading` |
| Bold | `**bold**` | `strong` mark |
| Italic | `*italic*` | `em` mark |
| Strikethrough | `~~strike~~` | `strike` mark |
| Inline code | `` `code` `` | `code` mark |
| Links | `[text](url)` | `link` mark |
| Images | `![alt](url)` | `mediaSingle` |
| Bullet lists | `- item` | `bulletList` |
| Ordered lists | `1. item` | `orderedList` |
| Task lists | `- [ ] todo` | `taskList` |
| Blockquotes | `> quote` | `blockquote` |
| Code blocks | ` ```lang ` | `codeBlock` |
| Tables | `\| a \| b \|` | `table` |
| Horizontal rule | `---` | `rule` |
| Mentions | `@username` | `mention` |
| Emojis | `:smile:` | `emoji` |

## Types

The package exports comprehensive TypeScript types:

```typescript
import type {
  ADFDocument,
  ADFNode,
  ADFMark,
  MarkdownToADFOptions,
  ADFToMarkdownOptions,
  MentionResolver,
  SmartLinkResolver
} from '@faulander/markdown-adf-converter';
```

## Error Handling

```typescript
import {
  ConversionError,
  InvalidMarkdownError,
  InvalidADFError,
  SchemaValidationError
} from '@faulander/markdown-adf-converter';

try {
  const adf = markdownToAdf(markdown);
} catch (error) {
  if (error instanceof InvalidMarkdownError) {
    console.error('Invalid Markdown:', error.message);
  }
}
```

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Run tests
npm test

# Lint
npm run lint

# Format
npm run format
```

## License

MIT - Harald Fauland ([@faulander](https://github.com/faulander))
