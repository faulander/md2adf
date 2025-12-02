import type { MentionResolver, MentionFormatter } from '../common/types.js';

/**
 * Default mention resolver that creates a simple ID from the username
 */
export const defaultMentionResolver: MentionResolver = (username: string) => {
  return {
    id: username,
    text: `@${username}`,
  };
};

/**
 * Default mention formatter that outputs @username format
 */
export const defaultMentionFormatter: MentionFormatter = (id: string, text?: string) => {
  if (text) {
    // If text already starts with @, don't add another
    if (text.startsWith('@')) {
      return text;
    }
    return `@${text}`;
  }
  return `@${id}`;
};

/**
 * Parse a mention string in the format @username or @[display name](id)
 */
export function parseMention(
  mentionString: string
): { username?: string; displayName?: string; id?: string } | null {
  // Match @[display name](id) format
  const complexMatch = mentionString.match(/@\[([^\]]+)\]\(([^)]+)\)/);
  if (complexMatch) {
    return {
      displayName: complexMatch[1],
      id: complexMatch[2],
    };
  }

  // Match simple @username format
  const simpleMatch = mentionString.match(/@(\w+)/);
  if (simpleMatch) {
    return {
      username: simpleMatch[1],
    };
  }

  return null;
}

/**
 * Create a custom mention resolver that maps usernames to Atlassian account IDs
 */
export function createMentionResolver(userMapping: Record<string, string>): MentionResolver {
  return (username: string) => {
    const id = userMapping[username.toLowerCase()];
    if (id) {
      return { id, text: `@${username}` };
    }
    // Return null if user not found, letting the converter handle it
    return null;
  };
}

/**
 * Create a custom mention formatter with a specific format
 */
export function createMentionFormatter(
  format: 'simple' | 'linked' | 'display' = 'simple'
): MentionFormatter {
  switch (format) {
    case 'linked':
      return (id: string, text?: string) => `@[${text || id}](${id})`;
    case 'display':
      return (_id: string, text?: string) => text || `@unknown`;
    case 'simple':
    default:
      return defaultMentionFormatter;
  }
}
