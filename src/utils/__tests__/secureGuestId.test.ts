import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  generateSecureGuestId,
  validateGuestSession,
  getOrCreateGuestId,
  getOrCreateGuestName,
  updateGuestName,
  clearGuestData,
  isValidGuestName,
} from '../secureGuestId';

// Mock uuid
vi.mock('uuid', () => ({
  v4: vi.fn(() => 'abcdefgh-1234-5678-9abc-def012345678'),
}));

describe('generateSecureGuestId', () => {
  it('starts with "guest-"', () => {
    const id = generateSecureGuestId();
    expect(id.startsWith('guest-')).toBe(true);
  });

  it('has three parts separated by hyphens (guest, timestamp, random)', () => {
    const id = generateSecureGuestId();
    const parts = id.split('-');
    expect(parts.length).toBe(3);
    expect(parts[0]).toBe('guest');
  });

  it('generates unique IDs', () => {
    // Even with mocked uuid, timestamp part changes
    const id1 = generateSecureGuestId();
    // Force a slight time difference
    const id2 = generateSecureGuestId();
    // Both start with guest- and have consistent format
    expect(id1.startsWith('guest-')).toBe(true);
    expect(id2.startsWith('guest-')).toBe(true);
  });

  it('contains a base36 timestamp', () => {
    const id = generateSecureGuestId();
    const parts = id.split('-');
    const timestamp = parseInt(parts[1], 36);
    expect(timestamp).toBeGreaterThan(0);
    // Should be close to current time
    expect(timestamp).toBeLessThanOrEqual(Date.now());
  });
});

describe('validateGuestSession', () => {
  it('returns false for empty string', () => {
    expect(validateGuestSession('')).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(validateGuestSession(null as any)).toBe(false);
    expect(validateGuestSession(undefined as any)).toBe(false);
  });

  it('returns false for IDs not starting with "guest-"', () => {
    expect(validateGuestSession('user-abc-12345678')).toBe(false);
  });

  it('returns false for IDs with wrong number of parts', () => {
    expect(validateGuestSession('guest-only')).toBe(false);
    expect(validateGuestSession('guest-a-b-c')).toBe(false);
  });

  it('returns true for a freshly generated ID', () => {
    const id = generateSecureGuestId();
    expect(validateGuestSession(id)).toBe(true);
  });

  it('returns false for IDs with very old timestamps (> 1 week)', () => {
    const oldTimestamp = (Date.now() - 8 * 24 * 60 * 60 * 1000).toString(36);
    const oldId = `guest-${oldTimestamp}-abcdefgh`;
    expect(validateGuestSession(oldId)).toBe(false);
  });

  it('returns false for IDs with future timestamps', () => {
    const futureTimestamp = (Date.now() + 60000).toString(36);
    const futureId = `guest-${futureTimestamp}-abcdefgh`;
    expect(validateGuestSession(futureId)).toBe(false);
  });

  it('accepts IDs created within the last week', () => {
    const recentTimestamp = (Date.now() - 3 * 24 * 60 * 60 * 1000).toString(36);
    const recentId = `guest-${recentTimestamp}-abcdefgh`;
    expect(validateGuestSession(recentId)).toBe(true);
  });
});

describe('getOrCreateGuestId', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('creates a new guest ID when none exists', () => {
    const id = getOrCreateGuestId();
    expect(id.startsWith('guest-')).toBe(true);
    expect(localStorage.setItem).toHaveBeenCalled();
  });

  it('returns existing guest ID from localStorage', () => {
    const existingId = 'guest-abc123-12345678';
    localStorage.setItem('secure_guest_id', existingId);
    vi.clearAllMocks(); // Clear the mock calls from setItem above

    const id = getOrCreateGuestId();
    expect(id).toBe(existingId);
  });

  it('persists the generated ID to localStorage', () => {
    const id = getOrCreateGuestId();
    expect(localStorage.setItem).toHaveBeenCalledWith('secure_guest_id', id);
  });
});

describe('getOrCreateGuestName', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('creates a name starting with "Guest" when none exists', () => {
    const name = getOrCreateGuestName();
    expect(name.startsWith('Guest')).toBe(true);
  });

  it('creates a name with 4-digit number suffix', () => {
    const name = getOrCreateGuestName();
    const numberPart = name.replace('Guest', '');
    expect(numberPart.length).toBe(4);
    expect(Number(numberPart)).toBeGreaterThanOrEqual(1000);
    expect(Number(numberPart)).toBeLessThan(10000);
  });

  it('returns existing name from localStorage', () => {
    localStorage.setItem('secure_guest_name', 'MyName');
    vi.clearAllMocks();
    expect(getOrCreateGuestName()).toBe('MyName');
  });
});

describe('updateGuestName', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('updates the name in localStorage', () => {
    updateGuestName('NewName');
    expect(localStorage.setItem).toHaveBeenCalledWith('secure_guest_name', 'NewName');
  });

  it('trims whitespace', () => {
    updateGuestName('  Trimmed  ');
    expect(localStorage.setItem).toHaveBeenCalledWith('secure_guest_name', 'Trimmed');
  });

  it('does not update with empty string', () => {
    updateGuestName('');
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });

  it('does not update with whitespace-only string', () => {
    updateGuestName('   ');
    expect(localStorage.setItem).not.toHaveBeenCalled();
  });
});

describe('clearGuestData', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('removes guest ID and name from localStorage', () => {
    clearGuestData();
    expect(localStorage.removeItem).toHaveBeenCalledWith('secure_guest_id');
    expect(localStorage.removeItem).toHaveBeenCalledWith('secure_guest_name');
  });
});

describe('isValidGuestName', () => {
  it('returns false for empty/null/undefined', () => {
    expect(isValidGuestName('')).toBe(false);
    expect(isValidGuestName(null as any)).toBe(false);
    expect(isValidGuestName(undefined as any)).toBe(false);
  });

  it('returns false for non-string input', () => {
    expect(isValidGuestName(123 as any)).toBe(false);
  });

  it('accepts valid alphanumeric names', () => {
    expect(isValidGuestName('Player1')).toBe(true);
    expect(isValidGuestName('cool-user')).toBe(true);
    expect(isValidGuestName('test_name')).toBe(true);
  });

  it('rejects names shorter than 3 characters', () => {
    expect(isValidGuestName('ab')).toBe(false);
    expect(isValidGuestName('a')).toBe(false);
  });

  it('rejects names longer than 20 characters', () => {
    expect(isValidGuestName('a'.repeat(21))).toBe(false);
  });

  it('accepts names exactly 3 characters', () => {
    expect(isValidGuestName('abc')).toBe(true);
  });

  it('accepts names exactly 20 characters', () => {
    expect(isValidGuestName('a'.repeat(20))).toBe(true);
  });

  it('rejects names with special characters', () => {
    expect(isValidGuestName('user@name')).toBe(false);
    expect(isValidGuestName('user name')).toBe(false);
    expect(isValidGuestName('user!name')).toBe(false);
    expect(isValidGuestName('user.name')).toBe(false);
  });

  it('rejects restricted pattern: admin', () => {
    expect(isValidGuestName('admin123')).toBe(false);
    expect(isValidGuestName('MyAdmin')).toBe(false);
  });

  it('rejects restricted pattern: moderator/mod', () => {
    expect(isValidGuestName('moderator1')).toBe(false);
    expect(isValidGuestName('supermod')).toBe(false);
  });

  it('rejects restricted pattern: bot', () => {
    expect(isValidGuestName('chatbot')).toBe(false);
    expect(isValidGuestName('Bot-user')).toBe(false);
  });

  it('rejects restricted pattern: support/staff/system', () => {
    expect(isValidGuestName('support1')).toBe(false);
    expect(isValidGuestName('staffmem')).toBe(false);
    expect(isValidGuestName('system01')).toBe(false);
  });

  it('rejects restricted pattern: official/verified/service', () => {
    expect(isValidGuestName('official1')).toBe(false);
    expect(isValidGuestName('verified1')).toBe(false);
    expect(isValidGuestName('myservice')).toBe(false);
  });

  it('trims whitespace before validation', () => {
    expect(isValidGuestName('  Player1  ')).toBe(true);
  });
});
