/**
 * Utility functions for handling dynamic domain names in different environments
 */

/**
 * Gets the current hostname from the browser
 * Works in client-side only
 */
export function getCurrentHostname(): string {
  if (typeof window === 'undefined') {
    return ''; // Server-side
  }
  return window.location.hostname;
}

/**
 * Gets the current origin (protocol + hostname + port)
 * Works in client-side only
 */
export function getCurrentOrigin(): string {
  if (typeof window === 'undefined') {
    return ''; // Server-side
  }
  return window.location.origin;
}

/**
 * Constructs the donate subdomain URL based on current environment
 * Handles development, PR previews, and production
 * 
 * @returns The full URL to the donate subdomain
 */
export function getDonateUrl(): string {
  if (typeof window === 'undefined') {
    // Server-side: return a fallback
    return 'https://donate.maceazy.com';
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;

  // Development environment
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//donate.${hostname}${port ? `:${port}` : ''}`;
  }

  // Production or PR preview environment
  // If hostname is 'maceazy.com' or 'pr-123.maceazy.com'
  // We want 'donate.maceazy.com' or 'donate-pr-123.maceazy.com'
  
  // Check if it's a PR preview (contains 'pr-' or similar pattern)
  if (hostname.includes('pr-') || hostname.includes('preview-')) {
    // For PR previews, you have options:
    // Option 1: Use the same PR domain (assuming donate is deployed with main app)
    // return `${protocol}//${hostname}/donate`; // Uses path instead of subdomain
    
    // Option 2: Use a subdomain with PR identifier
    // Example: pr-123.maceazy.com -> donate-pr-123.maceazy.com
    const prIdentifier = hostname.split('.')[0]; // Gets 'pr-123'
    const baseDomain = hostname.split('.').slice(1).join('.'); // Gets 'maceazy.com'
    return `${protocol}//donate-${prIdentifier}.${baseDomain}`;
  }

  // Standard production: maceazy.com -> donate.maceazy.com
  return `${protocol}//donate.${hostname}`;
}

/**
 * Gets the main domain URL (without donate subdomain)
 * Used for navigation from donate subdomain back to main site
 * 
 * @returns The full URL to the main domain
 */
export function getMainDomainUrl(): string {
  if (typeof window === 'undefined') {
    return 'https://maceazy.com';
  }

  const hostname = window.location.hostname;
  const protocol = window.location.protocol;
  const port = window.location.port;

  // Development environment
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  }

  // If on donate subdomain, strip it
  if (hostname.startsWith('donate.') || hostname.startsWith('donate-')) {
    const mainHostname = hostname.replace(/^donate[-.]/, '');
    return `${protocol}//${mainHostname}`;
  }

  // Already on main domain
  return `${protocol}//${hostname}`;
}

/**
 * Checks if we're currently on the donate subdomain
 */
export function isDonateDomain(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const hostname = window.location.hostname;
  return hostname.startsWith('donate.') || hostname.startsWith('donate-');
}
