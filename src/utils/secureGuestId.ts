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

// Validate guest name format
export const isValidGuestName = (name: string): boolean => {
  return name && 
         name.trim().length >= 3 && 
         name.trim().length <= 20 &&
         /^[a-zA-Z0-9_-]+$/.test(name.trim());
};