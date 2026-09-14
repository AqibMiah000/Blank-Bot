import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const DEFAULT_SALT = 'blank-bot-enterprise-v1-salt';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const TAG_LENGTH = 16;
const ITERATIONS = 100000;

function deriveKey(passphrase?: string): Buffer {
  const secret = passphrase || process.env.BLANK_MASTER_ENCRYPTION_KEY || 'blank-bot-master-safe-key-2026';
  return crypto.pbkdf2Sync(secret, DEFAULT_SALT, ITERATIONS, KEY_LENGTH, 'sha256');
}

/**
 * Encrypt plaintext using AES-256-GCM
 * Returns formatted string: "iv:authTag:ciphertext" (all hex encoded)
 */
export function encryptData(plaintext: string, passphrase?: string): string {
  if (!plaintext) return '';
  const key = deriveKey(passphrase);
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt AES-256-GCM encrypted payload
 * Expects formatted string: "iv:authTag:ciphertext"
 */
export function decryptData(encryptedPayload: string, passphrase?: string): string {
  if (!encryptedPayload) return '';
  try {
    const parts = encryptedPayload.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted payload format. Expected iv:authTag:ciphertext');
    }

    const [ivHex, tagHex, ciphertextHex] = parts;
    const key = deriveKey(passphrase);
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(tagHex, 'hex');

    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(ciphertextHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err: any) {
    console.error('Decryption failed:', err.message);
    throw new Error('Decryption failed. Authentication tag mismatch or corrupted data.');
  }
}

/**
 * Algorithmic Address Jigging Utility
 * Generates variations of shipping lines (Unit, Apt, Suite, Room, Box permutations + randomized characters)
 * to bypass "Limit 1 Per Household" retail restrictions.
 */
export function jigAddressLine1(addressLine1: string): string {
  const cleanAddress = addressLine1.trim();
  const prefixes = ['Apt', 'Suite', 'Unit', 'Ste', 'Rm', '#', 'Fl', 'Dept'];
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomChar = String.fromCharCode(65 + Math.floor(Math.random() * 26)); // A-Z
  const randomNumber = Math.floor(Math.random() * 899) + 100; // 100-999

  // Variation 1: Add Unit to line 1
  // Variation 2: Add random 3-letter jig tag
  const jigTag = Math.random() > 0.5 
    ? `${randomPrefix} ${randomChar}${randomNumber}`
    : `${randomPrefix} ${randomNumber}`;

  return `${cleanAddress} ${jigTag}`;
}

export function jigAddressLine2(): string {
  const prefixes = ['Apt', 'Suite', 'Unit', 'Ste', 'Room', 'Box', 'Building', 'Floor'];
  const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const randomLetter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const randomNumber = Math.floor(Math.random() * 900) + 100;

  return `${randomPrefix} ${randomLetter}-${randomNumber}`;
}

export function generateJigBatch(
  baseAddress: { addressLine1: string; addressLine2?: string; city: string; state: string; zipCode: string; country: string },
  count: number = 5
): Array<{ addressLine1: string; addressLine2: string; city: string; state: string; zipCode: string; country: string }> {
  const results = [];
  for (let i = 0; i < count; i++) {
    results.push({
      ...baseAddress,
      addressLine1: jigAddressLine1(baseAddress.addressLine1),
      addressLine2: jigAddressLine2(),
    });
  }
  return results;
}
