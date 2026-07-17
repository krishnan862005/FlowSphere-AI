import { createCipheriv, createDecipheriv, randomBytes, scryptSync, createHash } from 'crypto';

const ENCRYPTION_KEY = process.env['ENCRYPTION_KEY'] ?? 'fallback-32-char-key-for-dev-only';
const ALGORITHM = 'aes-256-gcm';

function deriveKey(secret: string): Buffer {
  return scryptSync(secret, 'flowsphere-salt', 32);
}

export function encrypt(text: string): string {
  const key = deriveKey(ENCRYPTION_KEY);
  const iv = randomBytes(16);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

export function decrypt(encryptedText: string): string {
  const [ivHex, authTagHex, encryptedHex] = encryptedText.split(':');
  if (!ivHex || !authTagHex || !encryptedHex) throw new Error('Invalid encrypted text format');
  const key = deriveKey(ENCRYPTION_KEY);
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  const encrypted = Buffer.from(encryptedHex, 'hex');
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return decrypted.toString('utf8');
}

export function hashString(input: string): string {
  return createHash('sha256').update(input).digest('hex');
}

export function generateSecureToken(length = 32): string {
  return randomBytes(length).toString('hex');
}

export function generateApiKey(): { key: string; prefix: string; hash: string } {
  const key = `fs_${randomBytes(32).toString('hex')}`;
  const prefix = key.substring(0, 10);
  const hash = hashString(key);
  return { key, prefix, hash };
}
