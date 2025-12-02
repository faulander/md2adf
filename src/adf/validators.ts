import Ajv from 'ajv';
import type { ADFDocument, ADFNode } from '../common/types.js';
import { SchemaValidationError } from '../common/errors.js';

// Simplified ADF schema for validation
const adfSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  definitions: {
    mark: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        attrs: { type: 'object' },
      },
      required: ['type'],
    },
    node: {
      type: 'object',
      properties: {
        type: { type: 'string' },
        attrs: { type: 'object' },
        content: {
          type: 'array',
          items: { $ref: '#/definitions/node' },
        },
        marks: {
          type: 'array',
          items: { $ref: '#/definitions/mark' },
        },
        text: { type: 'string' },
      },
      required: ['type'],
    },
  },
  type: 'object',
  properties: {
    version: { const: 1 },
    type: { const: 'doc' },
    content: {
      type: 'array',
      items: { $ref: '#/definitions/node' },
    },
  },
  required: ['version', 'type', 'content'],
};

// Valid ADF node types
const validBlockNodeTypes = new Set([
  'paragraph',
  'heading',
  'codeBlock',
  'blockquote',
  'bulletList',
  'orderedList',
  'listItem',
  'taskList',
  'taskItem',
  'table',
  'tableRow',
  'tableHeader',
  'tableCell',
  'mediaSingle',
  'media',
  'rule',
  'panel',
  'expand',
  'blockCard',
  'embedCard',
  'decisionList',
  'decisionItem',
  'layoutSection',
  'layoutColumn',
]);

const validInlineNodeTypes = new Set([
  'text',
  'hardBreak',
  'mention',
  'emoji',
  'inlineCard',
  'date',
  'status',
  'placeholder',
  'inlineExtension',
]);

const validMarkTypes = new Set([
  'strong',
  'em',
  'code',
  'strike',
  'underline',
  'link',
  'subsup',
  'textColor',
  'backgroundColor',
  'annotation',
]);

let ajv: Ajv | null = null;

/**
 * Get or create the AJV validator instance
 */
function getValidator(): Ajv {
  if (!ajv) {
    ajv = new Ajv({ allErrors: true });
  }
  return ajv;
}

/**
 * Validate an ADF document against the schema
 */
export function validateADFDocument(doc: unknown): {
  valid: boolean;
  errors: string[];
} {
  const validator = getValidator();
  const validate = validator.compile(adfSchema);
  const valid = validate(doc);

  if (!valid) {
    const errors = (validate.errors || []).map((err) => {
      const path = err.instancePath || '';
      return `${path}: ${err.message}`;
    });
    return { valid: false, errors };
  }

  // Additional semantic validation
  const semanticErrors = validateSemantics(doc as unknown as ADFDocument);

  return {
    valid: semanticErrors.length === 0,
    errors: semanticErrors,
  };
}

/**
 * Validate ADF document semantics
 */
function validateSemantics(doc: ADFDocument): string[] {
  const errors: string[] = [];

  if (!doc.content) {
    return errors;
  }

  for (let i = 0; i < doc.content.length; i++) {
    const node = doc.content[i];
    validateNode(node, `content[${i}]`, errors, true);
  }

  return errors;
}

/**
 * Validate a single node
 */
function validateNode(
  node: ADFNode,
  path: string,
  errors: string[],
  isBlockLevel: boolean
): void {
  // Check node type is valid
  const isValidType = isBlockLevel
    ? validBlockNodeTypes.has(node.type) || validInlineNodeTypes.has(node.type)
    : validInlineNodeTypes.has(node.type);

  if (!isValidType) {
    errors.push(`${path}: Unknown node type "${node.type}"`);
  }

  // Validate marks on text nodes
  if (node.type === 'text' && node.marks) {
    for (let i = 0; i < node.marks.length; i++) {
      const mark = node.marks[i];
      if (!validMarkTypes.has(mark.type)) {
        errors.push(`${path}.marks[${i}]: Unknown mark type "${mark.type}"`);
      }
    }
  }

  // Validate specific node types
  switch (node.type) {
    case 'heading': {
      const level = node.attrs?.level as number | undefined;
      if (!level || level < 1 || level > 6) {
        errors.push(`${path}: Heading must have level attribute between 1 and 6`);
      }
      break;
    }

    case 'taskItem':
      if (!node.attrs?.localId) {
        errors.push(`${path}: taskItem must have localId attribute`);
      }
      if (!node.attrs?.state || !['TODO', 'DONE'].includes(node.attrs.state as string)) {
        errors.push(`${path}: taskItem must have state attribute (TODO or DONE)`);
      }
      break;

    case 'mention':
      if (!node.attrs?.id) {
        errors.push(`${path}: mention must have id attribute`);
      }
      break;

    case 'emoji':
      if (!node.attrs?.shortName) {
        errors.push(`${path}: emoji must have shortName attribute`);
      }
      break;

    case 'inlineCard':
    case 'blockCard':
      if (!node.attrs?.url) {
        errors.push(`${path}: ${node.type} must have url attribute`);
      }
      break;

    case 'link':
      if (node.type === 'link' && !(node.attrs as { href?: string })?.href) {
        errors.push(`${path}: link must have href attribute`);
      }
      break;
  }

  // Recursively validate children
  if (node.content) {
    const childrenAreInline =
      node.type === 'paragraph' ||
      node.type === 'heading' ||
      node.type === 'tableHeader' ||
      node.type === 'tableCell';

    for (let i = 0; i < node.content.length; i++) {
      validateNode(node.content[i], `${path}.content[${i}]`, errors, !childrenAreInline);
    }
  }
}

/**
 * Assert that an ADF document is valid, throwing if not
 */
export function assertValidADF(doc: unknown): asserts doc is ADFDocument {
  const result = validateADFDocument(doc);
  if (!result.valid) {
    throw new SchemaValidationError('Invalid ADF document', result.errors);
  }
}

/**
 * Check if a node type is a valid block-level node
 */
export function isValidBlockNode(type: string): boolean {
  return validBlockNodeTypes.has(type);
}

/**
 * Check if a node type is a valid inline node
 */
export function isValidInlineNode(type: string): boolean {
  return validInlineNodeTypes.has(type);
}

/**
 * Check if a mark type is valid
 */
export function isValidMark(type: string): boolean {
  return validMarkTypes.has(type);
}
