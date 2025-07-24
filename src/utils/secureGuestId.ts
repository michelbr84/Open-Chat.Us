// Secure guest ID generation and management
import { v4 as uuidv4 } from 'uuid';

const GUEST_ID_KEY = 'secure_guest_id';
const GUEST_NAME_KEY = 'secure_guest_name';

// Generate cryptographically secure guest ID
export const generateSecureGuestId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = uuidv4().slice(0, 8);
  return `guest-${timestamp}-${randomPart}`;
};

// Get or create persistent guest ID
export const getOrCreateGuestId = (): string => {
  let guestId = localStorage.getItem(GUEST_ID_KEY);
  
  if (!guestId) {
    guestId = generateSecureGuestId();
    localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  
  return guestId;
};

// Get or create persistent guest name
export const getOrCreateGuestName = (): string => {
  let guestName = localStorage.getItem(GUEST_NAME_KEY);
  
  if (!guestName) {
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    guestName = `Guest${randomNumber}`;
    localStorage.setItem(GUEST_NAME_KEY, guestName);
  }
  
  return guestName;
};

// Update guest name in storage
export const updateGuestName = (newName: string): void => {
  if (newName && newName.trim().length > 0) {
    localStorage.setItem(GUEST_NAME_KEY, newName.trim());
  }
};

// Clear guest data (for when user logs in)
export const clearGuestData = (): void => {
  localStorage.removeItem(GUEST_ID_KEY);
  localStorage.removeItem(GUEST_NAME_KEY);
};

// Validate guest name format (enhanced security)
export const isValidGuestName = (name: string): boolean => {
  if (!name || typeof name !== 'string') return false;
  
  const trimmed = name.trim();
  
  // Length validation
  if (trimmed.length < 3 || trimmed.length > 20) return false;
  
  // Character validation - only alphanumeric, underscore, hyphen
  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) return false;
  
  // Prevent impersonation patterns
  const restrictedPatterns = [
    /admin/i, /moderator/i, /mod/i, /support/i, /staff/i,
    /system/i, /bot/i, /service/i, /official/i, /verified/i
  ];
  
  return !restrictedPatterns.some(pattern => pattern.test(trimmed));
};

// Enhanced guest session security
export const generateSecureSessionToken = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = crypto.getRandomValues(new Uint32Array(2))
    .reduce((acc, val) => acc + val.toString(36), '');
  return `${timestamp}-${randomPart}`;
};

// Validate guest session integrity
export const validateGuestSession = (guestId: string): boolean => {
  if (!guestId || !guestId.startsWith('guest-')) return false;
  
  const parts = guestId.split('-');
  if (parts.length !== 3) return false;
  
  // Check if timestamp is reasonable (not too old, not future)
  const timestamp = parseInt(parts[1], 36);
  const now = Date.now();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  
  return timestamp > 0 && 
         timestamp <= now && 
         timestamp > (now - oneWeek);
};