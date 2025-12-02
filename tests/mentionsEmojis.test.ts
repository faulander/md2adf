import {
  defaultMentionResolver,
  defaultMentionFormatter,
  parseMention,
  createMentionResolver,
  createMentionFormatter,
} from '../src/mentions/resolver.js';
import {
  getEmojiUnicode,
  getEmojiShortname,
  isValidEmoji,
  getAllEmojiShortnames,
  replaceEmojiShortnames,
  replaceUnicodeEmojis,
} from '../src/emojis/dictionary.js';

describe('Mentions', () => {
  describe('defaultMentionResolver', () => {
    it('should create mention info from username', () => {
      const result = defaultMentionResolver('johndoe');
      expect(result).toEqual({ id: 'johndoe', text: '@johndoe' });
    });
  });

  describe('defaultMentionFormatter', () => {
    it('should format mention with text', () => {
      expect(defaultMentionFormatter('user123', '@johndoe')).toBe('@johndoe');
    });

    it('should format mention without text', () => {
      expect(defaultMentionFormatter('user123')).toBe('@user123');
    });

    it('should not double the @ symbol', () => {
      expect(defaultMentionFormatter('user123', '@johndoe')).toBe('@johndoe');
    });
  });

  describe('parseMention', () => {
    it('should parse simple @username format', () => {
      const result = parseMention('@johndoe');
      expect(result?.username).toBe('johndoe');
    });

    it('should parse @[display name](id) format', () => {
      const result = parseMention('@[John Doe](user123)');
      expect(result?.displayName).toBe('John Doe');
      expect(result?.id).toBe('user123');
    });

    it('should return null for invalid format', () => {
      expect(parseMention('not a mention')).toBeNull();
    });
  });

  describe('createMentionResolver', () => {
    it('should create resolver with user mapping', () => {
      const resolver = createMentionResolver({
        johndoe: 'user-123',
        janedoe: 'user-456',
      });

      const result = resolver('johndoe');
      expect(result?.id).toBe('user-123');
    });

    it('should return null for unknown users', () => {
      const resolver = createMentionResolver({});
      expect(resolver('unknown')).toBeNull();
    });

    it('should be case insensitive', () => {
      const resolver = createMentionResolver({
        johndoe: 'user-123',
      });
      expect(resolver('JohnDoe')?.id).toBe('user-123');
    });
  });

  describe('createMentionFormatter', () => {
    it('should create simple formatter', () => {
      const formatter = createMentionFormatter('simple');
      expect(formatter('user123', 'John Doe')).toBe('@John Doe');
    });

    it('should create linked formatter', () => {
      const formatter = createMentionFormatter('linked');
      expect(formatter('user123', 'John Doe')).toBe('@[John Doe](user123)');
    });

    it('should create display formatter', () => {
      const formatter = createMentionFormatter('display');
      expect(formatter('user123', 'John Doe')).toBe('John Doe');
      expect(formatter('user123')).toBe('@unknown');
    });
  });
});

describe('Emojis', () => {
  describe('getEmojiUnicode', () => {
    it('should return unicode for valid shortname', () => {
      expect(getEmojiUnicode('smile')).toBe('\u{1F604}');
      expect(getEmojiUnicode(':smile:')).toBe('\u{1F604}');
    });

    it('should return undefined for invalid shortname', () => {
      expect(getEmojiUnicode('notanemoji')).toBeUndefined();
    });

    it('should be case insensitive', () => {
      expect(getEmojiUnicode('SMILE')).toBe('\u{1F604}');
    });
  });

  describe('getEmojiShortname', () => {
    it('should return shortname for unicode', () => {
      expect(getEmojiShortname('\u{1F604}')).toBe('smile');
    });

    it('should return undefined for unknown unicode', () => {
      expect(getEmojiShortname('X')).toBeUndefined();
    });
  });

  describe('isValidEmoji', () => {
    it('should return true for valid emojis', () => {
      expect(isValidEmoji('smile')).toBe(true);
      expect(isValidEmoji(':heart:')).toBe(true);
      expect(isValidEmoji('thumbsup')).toBe(true);
    });

    it('should return false for invalid emojis', () => {
      expect(isValidEmoji('notanemoji')).toBe(false);
      expect(isValidEmoji('')).toBe(false);
    });
  });

  describe('getAllEmojiShortnames', () => {
    it('should return array of shortnames', () => {
      const shortnames = getAllEmojiShortnames();
      expect(Array.isArray(shortnames)).toBe(true);
      expect(shortnames).toContain('smile');
      expect(shortnames).toContain('heart');
    });
  });

  describe('replaceEmojiShortnames', () => {
    it('should replace shortnames with unicode', () => {
      expect(replaceEmojiShortnames('Hello :smile:')).toContain('\u{1F604}');
    });

    it('should replace multiple emojis', () => {
      const result = replaceEmojiShortnames(':smile: :heart:');
      expect(result).toContain('\u{1F604}');
      expect(result).toContain('\u{2764}');
    });

    it('should leave invalid shortnames unchanged', () => {
      expect(replaceEmojiShortnames(':notanemoji:')).toBe(':notanemoji:');
    });
  });

  describe('replaceUnicodeEmojis', () => {
    it('should replace unicode with shortnames', () => {
      expect(replaceUnicodeEmojis('Hello \u{1F604}')).toContain(':smile:');
    });

    it('should handle multiple emojis', () => {
      const result = replaceUnicodeEmojis('\u{1F604} \u{2764}');
      expect(result).toContain(':smile:');
      expect(result).toContain(':heart:');
    });
  });

  describe('common emojis', () => {
    it('should have common status emojis', () => {
      expect(isValidEmoji('rocket')).toBe(true);
      expect(isValidEmoji('fire')).toBe(true);
      expect(isValidEmoji('warning')).toBe(true);
      expect(isValidEmoji('white_check_mark')).toBe(true);
    });

    it('should have thumbs up/down', () => {
      expect(isValidEmoji('thumbsup')).toBe(true);
      expect(isValidEmoji('+1')).toBe(true);
      expect(isValidEmoji('thumbsdown')).toBe(true);
      expect(isValidEmoji('-1')).toBe(true);
    });
  });
});
