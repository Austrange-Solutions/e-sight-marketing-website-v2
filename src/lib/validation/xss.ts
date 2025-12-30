/**
 * XSS Prevention Utilities
 * Combines regex validation with DOMPurify sanitization
 */

import DOMPurify from 'isomorphic-dompurify';
import { containsXSS, extractXSSPatterns } from './xss-regex';

/**
 * Sanitize input string to prevent XSS attacks
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Use DOMPurify with strict config
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: [], // Strip all attributes
    KEEP_CONTENT: true, // Keep text content
  });
}

/**
 * Sanitize HTML content (allows safe HTML tags)
 * Use for rich text editors or user bios
 * @param html - HTML string to sanitize
 * @returns Sanitized HTML
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
}

/**
 * Validate and sanitize user input
 * First checks for XSS patterns, then sanitizes
 * @param input - String to validate and sanitize
 * @param options - Validation options
 * @returns Sanitized string or throws error
 */
export function validateAndSanitize(
  input: string,
  options: {
    fieldName?: string;
    maxLength?: number;
    allowHtml?: boolean;
    strict?: boolean;
  } = {}
): string {
  const { fieldName = 'input', maxLength, allowHtml = false, strict = false } = options;

  // Check if input exists
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Check length
  if (maxLength && input.length > maxLength) {
    throw new Error(`${fieldName} exceeds maximum length of ${maxLength} characters`);
  }

  // Check for XSS patterns
  if (containsXSS(input, strict)) {
    const patterns = extractXSSPatterns(input);
    console.warn(`XSS attempt detected in ${fieldName}:`, patterns);
    throw new Error(`Invalid characters detected in ${fieldName}`);
  }

  // Sanitize based on context
  return allowHtml ? sanitizeHtml(input) : sanitizeInput(input);
}

/**
 * Sanitize an object with multiple fields
 * @param data - Object to sanitize
 * @param fieldConfigs - Configuration for each field
 * @returns Sanitized object
 */
export function sanitizeObject<T extends Record<string, unknown>>(
  data: T,
  fieldConfigs: Record<
    keyof T,
    {
      maxLength?: number;
      allowHtml?: boolean;
      strict?: boolean;
      optional?: boolean;
    }
  >
): T {
  const sanitized = {} as T;

  for (const [key, config] of Object.entries(fieldConfigs)) {
    const value = data[key as keyof T];

    // Skip if optional and not provided
    if (config.optional && (!value || value === '')) {
      continue;
    }

    // Validate and sanitize
    try {
      sanitized[key as keyof T] = validateAndSanitize(value as string, {
        fieldName: key,
        ...config,
      }) as T[keyof T];
    } catch (error) {
      throw new Error(`Validation failed for ${key}: ${(error as Error).message}`);
    }
  }

  return sanitized;
}

/**
 * Check if input is safe (no XSS patterns detected)
 * @param input - String to check
 * @param strict - Use strict mode
 * @returns true if safe, false if potentially malicious
 */
export function isSafeInput(input: string, strict: boolean = false): boolean {
  if (!input || typeof input !== 'string') {
    return true;
  }

  return !containsXSS(input, strict);
}

/**
 * Sanitize URL to prevent javascript: and data: protocols
 * @param url - URL to sanitize
 * @returns Safe URL or empty string
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  // Remove any XSS attempts
  const cleaned = sanitizeInput(url);

  // Check for dangerous protocols
  const dangerousProtocols = /^(javascript|data|vbscript|file|about):/i;
  if (dangerousProtocols.test(cleaned)) {
    return '';
  }

  // Ensure URL starts with http:// or https:// or is relative
  if (!/^(https?:\/\/|\/)/i.test(cleaned)) {
    return '';
  }

  return cleaned;
}

/**
 * Sanitize email address
 * @param email - Email to sanitize
 * @returns Sanitized email
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  // Basic sanitization
  const cleaned = sanitizeInput(email).toLowerCase().trim();

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleaned)) {
    throw new Error('Invalid email format');
  }

  return cleaned;
}

/**
 * Sanitize phone number (Indian format: exactly 10 digits)
 * @param phone - Phone number to sanitize
 * @returns Sanitized phone number
 * @throws Error if phone number is not exactly 10 digits
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    throw new Error('Phone number is required');
  }

  // Remove all non-numeric characters
  const cleaned = sanitizeInput(phone).replace(/\D/g, '');

  // Validate exactly 10 digits
  if (cleaned.length !== 10) {
    throw new Error('Phone number must be exactly 10 digits');
  }

  // Validate starts with valid Indian mobile prefix (6-9)
  if (!/^[6-9]/.test(cleaned)) {
    throw new Error('Phone number must start with 6, 7, 8, or 9');
  }

  return cleaned;
}

/**
 * Count words in a string
 * @param text - Text to count words from
 * @returns Number of words
 */
export function countWords(text: string): number {
  if (!text || typeof text !== 'string') {
    return 0;
  }
  return text.trim().split(/\s+/).filter(word => word.length > 0).length;
}

/**
 * Validate and sanitize text with word limit
 * @param input - String to validate
 * @param options - Validation options including maxWords
 * @returns Sanitized string or throws error
 */
export function validateAndSanitizeWithWordLimit(
  input: string,
  options: {
    fieldName?: string;
    maxWords?: number;
    strict?: boolean;
  } = {}
): string {
  const { fieldName = 'input', maxWords, strict = false } = options;

  // Check if input exists
  if (!input || typeof input !== 'string') {
    return '';
  }

  // Trim the input
  const trimmed = input.trim();

  // Check word count
  if (maxWords) {
    const wordCount = countWords(trimmed);
    if (wordCount > maxWords) {
      throw new Error(`${fieldName} exceeds maximum of ${maxWords} words (current: ${wordCount} words)`);
    }
  }

  // Check for XSS patterns
  if (containsXSS(trimmed, strict)) {
    const patterns = extractXSSPatterns(trimmed);
    console.warn(`XSS attempt detected in ${fieldName}:`, patterns);
    throw new Error(`Invalid characters detected in ${fieldName}`);
  }

  // Sanitize
  return sanitizeInput(trimmed);
}

/**
 * Create a Zod transform for automatic sanitization
 * @param options - Sanitization options
 */
export function createSanitizationTransform(options: {
  maxLength?: number;
  allowHtml?: boolean;
  strict?: boolean;
} = {}) {
  return (value: string) => {
    try {
      return validateAndSanitize(value, options);
    } catch (error) {
      throw new Error((error as Error).message);
    }
  };
}

const xssSanitizer = {
  sanitizeInput,
  sanitizeHtml,
  validateAndSanitize,
  sanitizeObject,
  isSafeInput,
  sanitizeUrl,
  sanitizeEmail,
  sanitizePhone,
  countWords,
  validateAndSanitizeWithWordLimit,
  createSanitizationTransform,
};

export default xssSanitizer;
