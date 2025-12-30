/**
 * XSS Detection Regex Pattern
 * Based on OWASP XSS Prevention and common attack vectors
 * Author: Ismail Tasdelen's XSS Payload List
 * 
 * This regex detects common XSS attack patterns for input validation
 * Should be used in combination with HTML sanitization libraries like DOMPurify
 */

/**
 * Comprehensive XSS Detection Regex
 * Detects most common XSS attack vectors including:
 * - Script tags (with obfuscation)
 * - JavaScript protocol handlers
 * - Event handlers (onerror, onclick, onload, etc.)
 * - Encoded attacks (HTML entities, Unicode, hex)
 * - Data URIs with JavaScript
 * - Style-based attacks (expression, behavior, binding)
 * - Dangerous HTML attributes
 */
export const XSS_DETECTION_REGEX = new RegExp(
  [
    // Script tags (case-insensitive, with/without space, obfuscated)
    /<\s*script[\s\S]*?>/i,
    /<\/\s*script\s*>/i,
    /&lt;\s*script/i,
    /&#60;\s*script/i,
    
    // JavaScript protocol (various encodings)
    /javascript\s*:/i,
    /jav\s*ascript\s*:/i,
    /jav&#x0[A-D];ascript:/i,
    /&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;/i,
    /\\x6A\\x61\\x76\\x61\\x73\\x63\\x72\\x69\\x70\\x74/i,
    /\\u006A\\u0061\\u0076\\u0061/i,
    
    // Dangerous event handlers
    /\bon\w+\s*=/i,
    /onerror\s*=/i,
    /onload\s*=/i,
    /onclick\s*=/i,
    /onmouseover\s*=/i,
    /onfocus\s*=/i,
    /onblur\s*=/i,
    /onchange\s*=/i,
    /onsubmit\s*=/i,
    /onkeyup\s*=/i,
    /onkeydown\s*=/i,
    /onmouseenter\s*=/i,
    /onmouseleave\s*=/i,
    /onreadystatechange\s*=/i,
    /onbeforeunload\s*=/i,
    /onunload\s*=/i,
    /onpageshow\s*=/i,
    /onpagehide\s*=/i,
    
    // Data URIs with JavaScript
    /data:text\/html/i,
    /data:text\/javascript/i,
    /data:application\/x-javascript/i,
    /data:\s*image\/svg\+xml/i,
    /data:.*base64.*script/i,
    
    // VBScript (IE legacy)
    /vbscript\s*:/i,
    /livescript\s*:/i,
    /mocha\s*:/i,
    
    // Dangerous HTML tags
    /<\s*iframe[\s\S]*?>/i,
    /<\s*embed[\s\S]*?>/i,
    /<\s*object[\s\S]*?>/i,
    /<\s*applet[\s\S]*?>/i,
    /<\s*meta[\s\S]*?>/i,
    /<\s*link[\s\S]*?>/i,
    /<\s*style[\s\S]*?>/i,
    /<\s*base[\s\S]*?>/i,
    /<\s*form[\s\S]*?>/i,
    /<\s*input[\s\S]*?>/i,
    /<\s*button[\s\S]*?>/i,
    /<\s*svg[\s\S]*?>/i,
    /<\s*xml[\s\S]*?>/i,
    /<\s*math[\s\S]*?>/i,
    /<\s*marquee[\s\S]*?>/i,
    /<\s*bgsound[\s\S]*?>/i,
    /<\s*layer[\s\S]*?>/i,
    
    // CSS expression/behavior attacks (IE legacy)
    /expression\s*\(/i,
    /behavior\s*:/i,
    /binding\s*:/i,
    /-moz-binding/i,
    /\.htc/i,
    /xss\.css/i,
    
    // Import attacks
    /@import/i,
    /import\s+stylesheet/i,
    
    // Alert/prompt/confirm (common XSS testing)
    /alert\s*\(/i,
    /prompt\s*\(/i,
    /confirm\s*\(/i,
    
    // String.fromCharCode obfuscation
    /String\.fromCharCode/i,
    /fromCharCode/i,
    
    // Document/window object manipulation
    /document\s*\.\s*write/i,
    /document\s*\.\s*cookie/i,
    /document\s*\.\s*location/i,
    /window\s*\.\s*location/i,
    /document\s*\.\s*domain/i,
    
    // Eval and similar dangerous functions
    /eval\s*\(/i,
    /setTimeout\s*\(/i,
    /setInterval\s*\(/i,
    /execScript/i,
    /Function\s*\(/i,
    
    // HTML entity encoded script
    /&#60;script/i,
    /&lt;script/i,
    /\\x3cscript/i,
    /\\u003cscript/i,
    
    // Hex/Unicode encoded attacks
    /\\x[0-9a-f]{2}/i,
    /\\u[0-9a-f]{4}/i,
    /&#x[0-9a-f]+;/i,
    /&#[0-9]+;/i,
    
    // Null byte attacks
    /\\0/,
    /\x00/,
    /%00/,
    
    // CDATA attacks
    /<!\[CDATA\[/i,
    
    // XML attacks
    /<!ENTITY/i,
    /<!DOCTYPE/i,
    
    // Meta refresh redirect
    /http-equiv\s*=\s*["']refresh/i,
    
    // FSCommand (Flash)
    /fscommand/i,
    
    // Dangerous attributes
    /formaction\s*=/i,
    /dynsrc\s*=/i,
    /lowsrc\s*=/i,
    /background\s*=.*javascript/i,
    /poster\s*=.*javascript/i,
    /href\s*=.*javascript/i,
    /src\s*=.*javascript/i,
    /action\s*=.*javascript/i,
    
    // Style attribute attacks
    /style\s*=.*expression/i,
    /style\s*=.*javascript/i,
    /style\s*=.*@import/i,
    
    // HTML breaking attempts
    /<!--.*-->/,
    /<\?.*\?>/,
    /<%.*%>/,
  ].map(r => r.source).join('|'),
  'gi'
);

/**
 * Simple XSS Regex (Less strict, faster)
 * Use for basic validation
 */
export const XSS_SIMPLE_REGEX = /<script|javascript:|onerror\s*=|onload\s*=|eval\(|expression\(|<iframe|<object|<embed/gi;

/**
 * Aggressive XSS Regex (Very strict)
 * May cause false positives but catches edge cases
 */
export const XSS_AGGRESSIVE_REGEX = /<[^>]*script|javascript:|on\w+\s*=|<\s*iframe|<\s*object|<\s*embed|data:text\/html|vbscript:|eval\(|expression\(|document\.|window\.|String\.fromCharCode/gi;

/**
 * Check if input contains potential XSS
 * @param input - String to validate
 * @param strict - Use aggressive regex (default: false)
 * @returns true if XSS detected, false otherwise
 */
export function containsXSS(input: string, strict: boolean = false): boolean {
  if (!input || typeof input !== 'string') {
    return false;
  }

  const regex = strict ? XSS_AGGRESSIVE_REGEX : XSS_DETECTION_REGEX;
  return regex.test(input);
}

/**
 * Sanitize input by removing XSS patterns (NOT RECOMMENDED)
 * Use DOMPurify or similar library instead
 * This is only for demonstration purposes
 * 
 * @param input - String to sanitize
 * @returns Sanitized string
 * @deprecated Use DOMPurify instead
 */
export function basicXSSRemoval(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<iframe/gi, '')
    .replace(/<object/gi, '')
    .replace(/<embed/gi, '')
    .replace(/eval\(/gi, '')
    .replace(/expression\(/gi, '');
}

/**
 * Extract all potential XSS patterns from input
 * Useful for logging/debugging
 * 
 * @param input - String to analyze
 * @returns Array of detected XSS patterns
 */
export function extractXSSPatterns(input: string): string[] {
  if (!input || typeof input !== 'string') {
    return [];
  }

  const matches = input.match(XSS_DETECTION_REGEX);
  return matches ? [...new Set(matches)] : [];
}

/**
 * Common dangerous HTML tags to block
 */
export const DANGEROUS_TAGS = [
  'script',
  'iframe',
  'object',
  'embed',
  'applet',
  'meta',
  'link',
  'style',
  'base',
  'form',
  'input',
  'button',
  'svg',
  'xml',
  'math',
  'marquee',
  'bgsound',
  'layer',
];

/**
 * Common dangerous event handlers
 */
export const DANGEROUS_EVENT_HANDLERS = [
  'onerror',
  'onload',
  'onclick',
  'onmouseover',
  'onfocus',
  'onblur',
  'onchange',
  'onsubmit',
  'onkeyup',
  'onkeydown',
  'onmouseenter',
  'onmouseleave',
  'onreadystatechange',
  'onbeforeunload',
  'onunload',
  'onpageshow',
  'onpagehide',
];

/**
 * Test cases for XSS detection
 */
export const XSS_TEST_CASES = [
  '<script>alert(1)</script>',
  'javascript:alert(1)',
  '<img src=x onerror=alert(1)>',
  '<svg/onload=alert(1)>',
  '<iframe src=javascript:alert(1)>',
  'data:text/html,<script>alert(1)</script>',
  '<marquee onstart=alert(1)>',
  '<body onload=alert(1)>',
  '<img src=x:alert(1)>',
  '<style>*{x:expression(alert(1))}</style>',
];

export default {
  XSS_DETECTION_REGEX,
  XSS_SIMPLE_REGEX,
  XSS_AGGRESSIVE_REGEX,
  containsXSS,
  basicXSSRemoval,
  extractXSSPatterns,
  DANGEROUS_TAGS,
  DANGEROUS_EVENT_HANDLERS,
  XSS_TEST_CASES,
};
