/**
 * AutocleanEEG Design System
 * Centralized design tokens for consistent UI
 */

export const designSystem = {
  // Border styles
  borders: {
    card: "border border-slate-200/50 dark:border-slate-700/50",
    cardHover: "hover:border-slate-300 dark:hover:border-slate-600",
    input: "border border-slate-300 dark:border-slate-600",
    inputFocus: "focus:border-indigo-500",
    section: "border-b border-slate-200/50 dark:border-slate-700/40",
    emphasis: "border-2 border-indigo-500",
  },
  
  // Shadow hierarchy
  shadows: {
    xs: "shadow-xs",      // Minimal elevation
    sm: "shadow-sm",      // Subtle elements
    md: "shadow-md",      // Interactive hover states
    lg: "shadow-lg",      // Elevated components
    xl: "shadow-xl",      // Primary cards
    "2xl": "shadow-2xl",  // Hero sections
  },
  
  // Rounded corners system
  rounded: {
    none: "rounded-none",
    sm: "rounded-md",     // Form inputs
    md: "rounded-lg",     // Buttons
    lg: "rounded-xl",     // Small cards
    xl: "rounded-2xl",    // Primary cards
    full: "rounded-full", // Pills, badges, avatars
  },
  
  // Background opacity scale
  backgrounds: {
    solid: "bg-white dark:bg-slate-900",
    primary: "bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm",   // Main cards
    secondary: "bg-white/60 dark:bg-slate-900/40 backdrop-blur-sm", // Secondary elements
    tertiary: "bg-white/40 dark:bg-slate-900/30 backdrop-blur-sm",  // Overlays
    hover: "hover:bg-white/90 dark:hover:bg-slate-800/60",
  },
  
  // Consistent padding scale
  padding: {
    xs: "p-2",   // Compact elements
    sm: "p-4",   // Small components
    md: "p-6",   // Standard sections
    lg: "p-8",   // Card content
    xl: "p-10",  // Hero sections
  },
  
  // Card styles (composite)
  card: {
    container: "border border-slate-200/50 dark:border-slate-700/50 shadow-xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm rounded-2xl overflow-hidden",
    header: "bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 border-b border-slate-200/50 dark:border-slate-700/50 px-8 py-6",
    content: "p-8",
    title: "text-2xl font-bold text-slate-800 dark:text-slate-100",
    description: "text-slate-600 dark:text-slate-400 text-lg",
  },
  
  // Button styles
  button: {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200",
    secondary: "bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold rounded-lg border border-slate-300 dark:border-slate-600 shadow-sm hover:shadow-md transition-all duration-200",
    ghost: "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium rounded-lg transition-colors duration-200",
  },
  
  // Form element styles
  form: {
    label: "text-sm font-medium text-slate-700 dark:text-slate-200",
    input: "w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
    select: "w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
    textarea: "w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
    helper: "text-xs text-slate-500 dark:text-slate-400 mt-1",
    error: "text-xs text-red-600 mt-1",
  },
  
  // Section styles
  section: {
    container: "space-y-6",
    divider: "border-b border-slate-200/50 dark:border-slate-700/40 pb-6",
    title: "text-lg font-semibold text-slate-800 dark:text-slate-100",
    subtitle: "text-sm text-slate-600 dark:text-slate-400",
  },
  
  // Color-specific accents (for special sections)
  accents: {
    info: {
      container: "bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border border-blue-200 dark:border-slate-700 rounded-xl p-6 shadow-md",
      icon: "bg-blue-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400",
    },
    success: {
      container: "bg-gradient-to-r from-green-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 border border-green-200 dark:border-slate-700 rounded-xl p-6 shadow-md",
      icon: "bg-green-100 dark:bg-slate-800 text-green-600 dark:text-green-400",
    },
    warning: {
      container: "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 border border-amber-200 dark:border-slate-700 rounded-xl p-6 shadow-md",
      icon: "bg-amber-100 dark:bg-slate-800 text-amber-600 dark:text-amber-400",
    },
    error: {
      container: "bg-gradient-to-r from-red-50 to-pink-50 dark:from-slate-900 dark:to-slate-800 border border-red-200 dark:border-slate-700 rounded-xl p-6 shadow-md",
      icon: "bg-red-100 dark:bg-slate-800 text-red-600 dark:text-red-400",
    },
  },
} as const;

// Helper function to combine classes
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}
