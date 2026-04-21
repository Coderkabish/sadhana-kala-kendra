import crypto from 'crypto';

/**
 * Password complexity validator
 * Requirements: 12+ chars, uppercase, lowercase, number, special char
 */
export const validatePasswordComplexity = (password) => {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
  return regex.test(password);
};

export const getPasswordComplexityErrors = (password) => {
  const errors = [];
  
  if (!password || password.length < 12) {
    errors.push('Password must be at least 12 characters');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one digit');
  }
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character (@$!%*?&)');
  }
  
  return errors;
};

/**
 * Field-level encryption for PII (Personally Identifiable Information)
 * Uses AES-256-CBC encryption
 */
export const encryptField = (plaintext) => {
  try {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length < 32) {
      throw new Error('ENCRYPTION_KEY must be at least 32 characters');
    }
    
    // Generate random IV for each encryption
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key.slice(0, 32)), iv);
    
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Return IV + encrypted data (IV needed for decryption)
    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
};

export const decryptField = (encryptedData) => {
  try {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length < 32) {
      throw new Error('ENCRYPTION_KEY must be at least 32 characters');
    }
    
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key.slice(0, 32)), iv);
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
};

/**
 * Sanitize/escape HTML to prevent XSS
 */
export const sanitizeHtml = (str) => {
  if (!str) return str;
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

/**
 * Validate file upload
 */
export const validateFileUpload = (file, maxSizeMB = 50) => {
  const MAX_SIZE = maxSizeMB * 1024 * 1024; // Convert to bytes
  const ALLOWED_TYPES = (process.env.ALLOWED_FILE_TYPES || '').split(',').map((type) => type.trim()).filter(Boolean);

  if (ALLOWED_TYPES.length === 0) {
    throw new Error('ALLOWED_FILE_TYPES must be configured in the environment');
  }
  
  if (!file) {
    return { valid: false, error: 'No file provided' };
  }
  
  if (file.size > MAX_SIZE) {
    return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }
  
  const fileExtension = file.originalname.split('.').pop().toLowerCase();
  if (!ALLOWED_TYPES.includes(fileExtension)) {
    return {
      valid: false,
      error: `File type not allowed. Allowed: ${ALLOWED_TYPES.join(', ')}`,
    };
  }
  
  return { valid: true };
};
