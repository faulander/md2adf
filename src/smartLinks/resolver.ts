import type { SmartLinkResolver } from '../common/types.js';
import { detectSmartLinkType, isAtlassianUrl } from './detector.js';

/**
 * Default smart link resolver that uses URL pattern detection
 */
export const defaultSmartLinkResolver: SmartLinkResolver = (url: string) => {
  return detectSmartLinkType(url);
};

/**
 * Create a custom smart link resolver with specific domain rules
 */
export function createSmartLinkResolver(options: {
  inlineDomains?: string[];
  blockDomains?: string[];
  fallbackToAtlassianDetection?: boolean;
}): SmartLinkResolver {
  const { inlineDomains = [], blockDomains = [], fallbackToAtlassianDetection = true } = options;

  return (url: string) => {
    try {
      const parsed = new URL(url);
      const hostname = parsed.hostname.toLowerCase();

      // Check inline domains
      for (const domain of inlineDomains) {
        if (hostname.includes(domain.toLowerCase())) {
          return 'inline';
        }
      }

      // Check block domains
      for (const domain of blockDomains) {
        if (hostname.includes(domain.toLowerCase())) {
          return 'block';
        }
      }

      // Fall back to Atlassian detection
      if (fallbackToAtlassianDetection && isAtlassianUrl(url)) {
        return detectSmartLinkType(url);
      }

      return 'link';
    } catch {
      return 'link';
    }
  };
}

/**
 * Smart link resolver that always returns inline cards for Atlassian URLs
 */
export const atlassianInlineResolver: SmartLinkResolver = (url: string) => {
  return isAtlassianUrl(url) ? 'inline' : 'link';
};

/**
 * Smart link resolver that always returns block cards for Atlassian URLs
 */
export const atlassianBlockResolver: SmartLinkResolver = (url: string) => {
  return isAtlassianUrl(url) ? 'block' : 'link';
};

/**
 * Smart link resolver that never creates smart links (always regular links)
 */
export const noSmartLinksResolver: SmartLinkResolver = () => {
  return 'link';
};
