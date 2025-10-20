/**
 * EduMatch Design System
 * Centralized style definitions for consistent UI across the application
 */

export const COLORS = {
  // Primary Colors
  primary: '#257180',        // Teal - Main brand color
  accent: '#FD8B51',         // Orange - Hover, highlights, borders
  secondary: '#F2E5BF',      // Cream - Badge backgrounds, highlights
  background: '#F9FAFB',     // Light gray - Page backgrounds
  
  // Text Colors
  text: {
    primary: '#000000',      // Black - Main text
    secondary: '#6B7280',    // Gray-500 - Secondary text
    muted: '#9CA3AF',        // Gray-400 - Muted text
  },
  
  // Status Colors
  success: '#10B981',        // Emerald-500
  warning: '#F59E0B',        // Amber-500
  error: '#EF4444',          // Red-500
  info: '#3B82F6',           // Blue-500
  
  // Border Colors
  border: {
    default: '#D1D5DB',      // Gray-300 - Input borders
    focus: '#257180',        // Teal - Focus borders
    card: '#FD8B51',         // Orange - Card borders
    separator: '#000000',    // Black - Main separators
    separatorSecondary: '#E5E7EB', // Gray-200 - Secondary separators
  }
} as const;

export const COMPONENT_STYLES = {
  // Card Styles
  card: {
    default: 'bg-white border border-[#FD8B51] rounded-lg shadow-sm',
    pricing: 'bg-white border border-[#257180]/20 rounded-lg shadow-sm',
  },
  
  // Button Styles
  button: {
    primary: 'bg-[#257180] text-white hover:bg-[#257180]/90',
    outline: 'border border-[#257180] text-[#257180] bg-transparent hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]',
    ghost: 'text-[#257180] bg-transparent hover:bg-[#FD8B51] hover:text-white',
    secondary: 'bg-[#F2E5BF] text-[#257180] hover:bg-[#F2E5BF]/80',
  },
  
  // Input Styles
  input: {
    default: 'border-gray-300 focus:border-[#257180] focus:ring-[#257180]',
  },
  
  // Select Styles
  select: {
    trigger: 'border-gray-300 focus:border-[#257180] focus:ring-[#257180]',
    item: 'hover:bg-[#FD8B51] hover:text-white data-[highlighted]:bg-[#FD8B51] data-[highlighted]:text-white',
  },
  
  // Badge Styles
  badge: {
    default: 'bg-[#F2E5BF] text-[#257180]',
    subject: 'bg-[#F2E5BF] text-[#257180] hover:bg-[#F2E5BF]/80',
  },
  
  // Tab Styles
  tabs: {
    list: 'bg-[#F2E5BF]',
    trigger: {
      active: 'bg-white text-[#257180]',
      inactive: 'bg-transparent text-gray-500',
    },
  },
  
  // Avatar Styles
  avatar: {
    fallback: 'bg-[#F2E5BF] text-[#257180]',
  },
  
  // Modal Styles
  modal: {
    overlay: 'bg-black/80',
    content: 'bg-white border border-[#FD8B51] rounded-lg shadow-lg',
  },
  
  // Toast Styles
  toast: {
    success: 'bg-white text-black border-l-4 border-[#10B981]',
    error: 'bg-white text-black border-l-4 border-[#EF4444]',
    warning: 'bg-white text-black border-l-4 border-[#F59E0B]',
    info: 'bg-white text-black border-l-4 border-[#3B82F6]',
  },
} as const;

export const LAYOUT_STYLES = {
  // Backgrounds
  page: 'bg-[#F9FAFB]',
  card: 'bg-white',
  
  // Borders
  radius: {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
  },
  
  // Shadows
  shadow: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  },
  
  // Spacing
  padding: {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
  },
} as const;

export const HOVER_EFFECTS = {
  card: 'hover:border-[#257180]/40',
  button: {
    primary: 'hover:bg-[#257180]/90',
    outline: 'hover:bg-[#FD8B51] hover:text-white hover:border-[#FD8B51]',
    ghost: 'hover:bg-[#FD8B51] hover:text-white',
  },
  select: 'hover:bg-[#FD8B51] hover:text-white',
} as const;

// Utility function to combine styles
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Style validation function
export const validateStyle = (component: string, style: string): boolean => {
  const validStyles = {
    card: ['default', 'pricing'],
    button: ['primary', 'outline', 'ghost', 'secondary'],
    input: ['default'],
    select: ['trigger', 'item'],
    badge: ['default', 'subject'],
    tabs: ['list', 'trigger'],
    avatar: ['fallback'],
    modal: ['overlay', 'content'],
    toast: ['success', 'error', 'warning', 'info'],
  };
  
  return validStyles[component as keyof typeof validStyles]?.includes(style) ?? false;
};

