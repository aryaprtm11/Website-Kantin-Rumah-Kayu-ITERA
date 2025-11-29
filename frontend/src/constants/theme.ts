/**
 * Theme constants for consistent styling across the application
 */

export const COLORS = {
  // Primary colors
  primary: '#667eea',
  primaryDark: '#5568d3',
  primaryGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  
  // Background colors
  bgLight: '#f5f7fa',
  bgGradient: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  bgWhite: '#ffffff',
  bgDark: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
  
  // Text colors
  textDark: '#2d3748',
  textMedium: '#4a5568',
  textLight: '#718096',
  textMuted: '#cbd5e0',
  
  // Status colors
  success: '#c6f6d5',
  successText: '#22543d',
  error: '#fed7d7',
  errorText: '#742a2a',
  errorPrimary: '#e53e3e',
  
  // Neutral colors
  white: '#ffffff',
  border: '#e2e8f0',
} as const;

export const SPACING = {
  xs: '0.5rem',
  sm: '1rem',
  md: '1.5rem',
  lg: '2rem',
  xl: '3rem',
  xxl: '5rem',
} as const;

export const FONT_SIZES = {
  xs: '0.85rem',
  sm: '0.9rem',
  base: '1rem',
  md: '1.1rem',
  lg: '1.2rem',
  xl: '1.3rem',
  '2xl': '1.8rem',
  '3xl': '2rem',
  '4xl': '2.5rem',
  '5xl': '3rem',
} as const;

export const FONT_WEIGHTS = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
} as const;

export const BORDER_RADIUS = {
  sm: '10px',
  md: '15px',
  lg: '20px',
  xl: '25px',
  full: '50%',
} as const;

export const BREAKPOINTS = {
  mobile: '768px',
  tablet: '1024px',
  desktop: '1200px',
} as const;

export const TRANSITIONS = {
  fast: '0.2s',
  normal: '0.3s',
  slow: '0.6s',
} as const;

export const SHADOWS = {
  sm: '0 2px 10px rgba(0, 0, 0, 0.1)',
  md: '0 4px 20px rgba(0, 0, 0, 0.08)',
  lg: '0 12px 30px rgba(102, 126, 234, 0.2)',
  xl: '0 20px 50px rgba(0, 0, 0, 0.1)',
} as const;

export const Z_INDEX = {
  dropdown: 10,
  modal: 50,
  navbar: 100,
  toast: 1000,
} as const;

