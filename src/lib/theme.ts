// MACEAZY Brand Color Utilities
// These utilities provide easy access to brand colors and helper functions

export const maceazyColors = {
  // Primary brand colors
  primary: {
    light: 'oklch(0.65 0.14 230)', // #1B9BD8
    main: 'oklch(0.65 0.14 230)',
    dark: 'oklch(0.55 0.14 230)',
    darker: 'oklch(0.50 0.14 230)',
  },
  
  // Secondary brand colors
  secondary: {
    light: 'oklch(0.88 0.01 230)',
    main: 'oklch(0.35 0.08 230)', // #0C5277
    dark: 'oklch(0.30 0.08 230)',
  },
  
  // Semantic colors
  success: {
    light: 'oklch(0.75 0.15 160)',
    main: 'oklch(0.70 0.15 160)', // #10B981
    dark: 'oklch(0.65 0.15 160)',
  },
  
  warning: {
    light: 'oklch(0.80 0.15 70)',
    main: 'oklch(0.75 0.15 70)', // #F59E0B
    dark: 'oklch(0.70 0.15 70)',
  },
  
  error: {
    light: 'oklch(0.70 0.22 25)',
    main: 'oklch(0.65 0.22 25)', // #EF4444
    dark: 'oklch(0.60 0.22 25)',
  },
} as const;

// Helper function to get CSS variable
export const getCSSVariable = (variable: string) => {
  if (typeof window === 'undefined') return '';
  return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
};

// Helper to check if dark mode is active
export const isDarkMode = () => {
  if (typeof window === 'undefined') return false;
  return document.documentElement.classList.contains('dark');
};

// Color opacity helper for Tailwind classes
export const withOpacity = (color: string, opacity: number) => {
  return `${color}/${opacity}`;
};

// Common gradient combinations for MACEAZY brand
export const maceazyGradients = {
  primary: 'bg-gradient-to-r from-primary to-primary/80',
  hero: 'bg-gradient-to-br from-primary via-primary/90 to-secondary',
  subtle: 'bg-gradient-to-b from-background to-accent',
  card: 'bg-gradient-to-br from-card to-accent/50',
} as const;

// Section background patterns (alternating white/blue)
export const sectionBackgrounds = {
  white: 'bg-background',
  lightBlue: 'bg-accent',
  card: 'bg-card',
  muted: 'bg-muted',
} as const;

// Common component styles for consistency
export const componentStyles = {
  // Button variants
  button: {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90 transition-colors',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors',
    outline: 'border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors',
    ghost: 'hover:bg-accent hover:text-accent-foreground transition-colors',
    success: 'bg-[oklch(0.70_0.15_160)] text-white hover:bg-[oklch(0.65_0.15_160)] transition-colors',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors',
  },
  
  // Card variants
  card: {
    default: 'bg-card text-card-foreground border-border rounded-lg shadow-sm',
    elevated: 'bg-card text-card-foreground border-border rounded-lg shadow-md hover:shadow-lg transition-shadow',
    interactive: 'bg-card text-card-foreground border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary transition-all cursor-pointer',
  },
  
  // Input styles
  input: {
    default: 'bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-ring focus:border-ring',
  },
  
  // Badge/Chip variants
  badge: {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    success: 'bg-[oklch(0.70_0.15_160)] text-white',
    warning: 'bg-[oklch(0.75_0.15_70)] text-foreground',
    error: 'bg-destructive text-destructive-foreground',
  },
} as const;

export default maceazyColors;
