import {
  detectSmartLinkType,
  isAtlassianUrl,
  extractJiraIssueKey,
  extractConfluencePageInfo,
} from '../src/smartLinks/detector.js';
import {
  defaultSmartLinkResolver,
  createSmartLinkResolver,
  atlassianInlineResolver,
  atlassianBlockResolver,
  noSmartLinksResolver,
} from '../src/smartLinks/resolver.js';

describe('Smart Links', () => {
  describe('detectSmartLinkType', () => {
    it('should detect Jira issue links as inline', () => {
      expect(detectSmartLinkType('https://company.atlassian.net/browse/PROJ-123')).toBe('inline');
      expect(detectSmartLinkType('https://myteam.atlassian.net/browse/TEST-1')).toBe('inline');
    });

    it('should detect Confluence links as block', () => {
      expect(detectSmartLinkType('https://company.atlassian.net/wiki/spaces/DOC/pages/123')).toBe(
        'block'
      );
    });

    it('should return link for non-Atlassian URLs', () => {
      expect(detectSmartLinkType('https://example.com')).toBe('link');
      expect(detectSmartLinkType('https://github.com/user/repo')).toBe('link');
    });
  });

  describe('isAtlassianUrl', () => {
    it('should return true for Atlassian URLs', () => {
      expect(isAtlassianUrl('https://company.atlassian.net/browse/PROJ-123')).toBe(true);
      expect(isAtlassianUrl('https://company.atlassian.com/wiki')).toBe(true);
    });

    it('should return false for non-Atlassian URLs', () => {
      expect(isAtlassianUrl('https://example.com')).toBe(false);
      expect(isAtlassianUrl('https://atlassian.fake.com')).toBe(false);
    });

    it('should handle invalid URLs gracefully', () => {
      expect(isAtlassianUrl('not-a-url')).toBe(false);
      expect(isAtlassianUrl('')).toBe(false);
    });
  });

  describe('extractJiraIssueKey', () => {
    it('should extract Jira issue key from URL', () => {
      expect(extractJiraIssueKey('https://company.atlassian.net/browse/PROJ-123')).toBe('PROJ-123');
      expect(extractJiraIssueKey('https://company.atlassian.net/browse/TEST-1')).toBe('TEST-1');
    });

    it('should return null for non-Jira URLs', () => {
      expect(extractJiraIssueKey('https://example.com')).toBeNull();
      expect(extractJiraIssueKey('https://company.atlassian.net/wiki')).toBeNull();
    });
  });

  describe('extractConfluencePageInfo', () => {
    it('should extract space key and page ID', () => {
      const result = extractConfluencePageInfo(
        'https://company.atlassian.net/wiki/spaces/DOC/pages/123456'
      );
      expect(result?.spaceKey).toBe('DOC');
      expect(result?.pageId).toBe('123456');
    });

    it('should return null for non-Confluence URLs', () => {
      expect(extractConfluencePageInfo('https://example.com')).toBeNull();
    });
  });

  describe('defaultSmartLinkResolver', () => {
    it('should use detectSmartLinkType', () => {
      expect(defaultSmartLinkResolver('https://company.atlassian.net/browse/PROJ-123')).toBe(
        'inline'
      );
      expect(defaultSmartLinkResolver('https://example.com')).toBe('link');
    });
  });

  describe('createSmartLinkResolver', () => {
    it('should use custom inline domains', () => {
      const resolver = createSmartLinkResolver({
        inlineDomains: ['github.com'],
      });
      expect(resolver('https://github.com/user/repo')).toBe('inline');
    });

    it('should use custom block domains', () => {
      const resolver = createSmartLinkResolver({
        blockDomains: ['notion.so'],
      });
      expect(resolver('https://notion.so/page')).toBe('block');
    });

    it('should fallback to Atlassian detection by default', () => {
      const resolver = createSmartLinkResolver({});
      expect(resolver('https://company.atlassian.net/browse/PROJ-123')).toBe('inline');
    });

    it('should disable Atlassian fallback when configured', () => {
      const resolver = createSmartLinkResolver({
        fallbackToAtlassianDetection: false,
      });
      expect(resolver('https://company.atlassian.net/browse/PROJ-123')).toBe('link');
    });
  });

  describe('atlassianInlineResolver', () => {
    it('should return inline for all Atlassian URLs', () => {
      expect(atlassianInlineResolver('https://company.atlassian.net/wiki/spaces/DOC')).toBe(
        'inline'
      );
      expect(atlassianInlineResolver('https://company.atlassian.net/browse/PROJ-123')).toBe(
        'inline'
      );
    });

    it('should return link for non-Atlassian URLs', () => {
      expect(atlassianInlineResolver('https://example.com')).toBe('link');
    });
  });

  describe('atlassianBlockResolver', () => {
    it('should return block for all Atlassian URLs', () => {
      expect(atlassianBlockResolver('https://company.atlassian.net/wiki/spaces/DOC')).toBe('block');
      expect(atlassianBlockResolver('https://company.atlassian.net/browse/PROJ-123')).toBe('block');
    });

    it('should return link for non-Atlassian URLs', () => {
      expect(atlassianBlockResolver('https://example.com')).toBe('link');
    });
  });

  describe('noSmartLinksResolver', () => {
    it('should always return link', () => {
      expect(noSmartLinksResolver('https://company.atlassian.net/browse/PROJ-123')).toBe('link');
      expect(noSmartLinksResolver('https://example.com')).toBe('link');
    });
  });
});
