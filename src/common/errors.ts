export class ConversionError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ConversionError';
  }
}

export class InvalidMarkdownError extends ConversionError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'INVALID_MARKDOWN', details);
    this.name = 'InvalidMarkdownError';
  }
}

export class InvalidADFError extends ConversionError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'INVALID_ADF', details);
    this.name = 'InvalidADFError';
  }
}

export class SchemaValidationError extends ConversionError {
  constructor(
    message: string,
    public readonly validationErrors: string[]
  ) {
    super(message, 'SCHEMA_VALIDATION_ERROR', { validationErrors });
    this.name = 'SchemaValidationError';
  }
}

export class UnsupportedNodeError extends ConversionError {
  constructor(nodeType: string) {
    super(`Unsupported node type: ${nodeType}`, 'UNSUPPORTED_NODE', { nodeType });
    this.name = 'UnsupportedNodeError';
  }
}
