// Green Minimalist Theme Colors
export const THEME_COLORS = {
  primary: '#22c55e',
  primaryDark: '#16a34a',
  primaryLight: '#86efac',
  primaryLighter: '#dcfce7',
  
  // Gradients
  primaryGradient: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
  primaryGradient90: 'linear-gradient(90deg, #22c55e 0%, #16a34a 100%)',
  
  // Status colors
  success: '#22c55e',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  
  // Neutral colors
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
} as const;

export type ThemeColor = keyof typeof THEME_COLORS;
