import {
  JIRA_ISSUE_PATTERN,
  CONFLUENCE_PAGE_PATTERN,
  JIRA_BOARD_PATTERN,
} from '../config/constants.js';

export type SmartLinkType = 'inline' | 'block' | 'link';

/**
 * Detect if a URL should be rendered as a smart link
 */
export function detectSmartLinkType(url: string): SmartLinkType {
  // Jira issue links -> inline card
  if (JIRA_ISSUE_PATTERN.test(url)) {
    return 'inline';
  }

  // Confluence pages -> block card
  if (CONFLUENCE_PAGE_PATTERN.test(url)) {
    return 'block';
  }

  // Jira boards/projects -> inline card
  if (JIRA_BOARD_PATTERN.test(url)) {
    return 'inline';
  }

  // Default to regular link
  return 'link';
}

/**
 * Check if URL is from an Atlassian domain
 */
export function isAtlassianUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      parsed.hostname.endsWith('.atlassian.net') ||
      parsed.hostname.endsWith('.atlassian.com') ||
      parsed.hostname.endsWith('.jira.com')
    );
  } catch {
    return false;
  }
}

/**
 * Extract Jira issue key from URL
 */
export function extractJiraIssueKey(url: string): string | null {
  const match = url.match(/\/browse\/([A-Z]+-\d+)/);
  return match ? match[1] : null;
}

/**
 * Extract Confluence page info from URL
 */
export function extractConfluencePageInfo(
  url: string
): { spaceKey?: string; pageId?: string } | null {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split('/');

    // Look for /wiki/spaces/{spaceKey}/pages/{pageId}
    const spacesIndex = pathParts.indexOf('spaces');
    const pagesIndex = pathParts.indexOf('pages');

    const result: { spaceKey?: string; pageId?: string } = {};

    if (spacesIndex !== -1 && pathParts[spacesIndex + 1]) {
      result.spaceKey = pathParts[spacesIndex + 1];
    }

    if (pagesIndex !== -1 && pathParts[pagesIndex + 1]) {
      result.pageId = pathParts[pagesIndex + 1];
    }

    return Object.keys(result).length > 0 ? result : null;
  } catch {
    return null;
  }
}
