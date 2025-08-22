import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';

/**
 * Theme Color Usage Guide
 * 
 * Your themesConfig.js contains multiple color schemes:
 * - default (light theme)
 * - defaultDark (dark theme) 
 * - yellowBlackContrast (high contrast)
 * - invertedColors (high contrast)
 * - sepiaTheme (light sensitivity)
 * - nightMode (light sensitivity)
 * 
 * Each theme has these color categories:
 * - primary: main, light, dark, contrastText
 * - secondary: main, light, dark, contrastText
 * - background: paper, default
 * - text: primary, secondary, disabled
 * - error: main, light, dark, contrastText
 * - status: danger
 * - common: black, white
 * - divider
 */

/**
 * Helper function to validate and normalize color values
 */
const normalizeColor = (color) => {
  if (!color) return '#ff9800'; // Default fallback
  
  // If it's already a valid format, return as is
  if (color.startsWith('#') || color.startsWith('rgb') || color.startsWith('hsl')) {
    return color;
  }
  
  // Convert common CSS color names to hex
  const colorMap = {
    'orange': '#ff9800',
    'red': '#f44336',
    'blue': '#2196f3',
    'green': '#4caf50',
    'yellow': '#ffeb3b',
    'purple': '#9c27b0',
    'pink': '#e91e63',
    'brown': '#795548',
    'gray': '#9e9e9e',
    'grey': '#9e9e9e',
    'black': '#000000',
    'white': '#ffffff',
  };
  
  return colorMap[color.toLowerCase()] || '#ff9800';
};

/**
 * Hook to get theme colors with proper TypeScript support
 */
export const useThemeColors = () => {
  const theme = useTheme();
  
  return {
    // Primary colors
    primary: {
      main: theme.palette.primary.main,
      light: theme.palette.primary.light,
      dark: theme.palette.primary.dark,
      contrastText: theme.palette.primary.contrastText,
    },
    
    // Secondary colors
    secondary: {
      main: theme.palette.secondary.main,
      light: theme.palette.secondary.light,
      dark: theme.palette.secondary.dark,
      contrastText: theme.palette.secondary.contrastText,
    },
    
    // Background colors
    background: {
      paper: theme.palette.background.paper,
      default: theme.palette.background.default,
    },
    
    // Text colors
    text: {
      primary: theme.palette.text.primary,
      secondary: theme.palette.text.secondary,
      disabled: theme.palette.text.disabled,
    },
    
    // Error colors
    error: {
      main: theme.palette.error.main,
      light: theme.palette.error.light,
      dark: theme.palette.error.dark,
      contrastText: theme.palette.error.contrastText,
    },
    
    // Status colors
    status: {
      danger: normalizeColor(theme.palette.status?.danger),
    },
    
    // Common colors
    common: {
      black: theme.palette.common.black,
      white: theme.palette.common.white,
    },
    
    // Other
    divider: theme.palette.divider,
    mode: theme.palette.mode,
    
    // Accessibility info
    accessibility: theme.accessibility,
  };
};

/**
 * Styled component examples using theme colors
 */
export const ThemedComponents = {
  // Primary button with theme colors
  PrimaryButton: styled('button')(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    border: 'none',
    padding: '12px 24px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
      transform: 'translateY(-1px)',
      boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    },
    
    '&:active': {
      backgroundColor: theme.palette.primary.dark,
      transform: 'translateY(0)',
    },
    
    '&:disabled': {
      backgroundColor: theme.palette.action.disabled,
      color: theme.palette.text.disabled,
      cursor: 'not-allowed',
      transform: 'none',
      boxShadow: 'none',
    },
  })),
  
  // Secondary button
  SecondaryButton: styled('button')(({ theme }) => ({
    backgroundColor: 'transparent',
    color: theme.palette.secondary.main,
    border: `2px solid ${theme.palette.secondary.main}`,
    padding: '10px 22px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 500,
    transition: 'all 0.2s ease',
    
    '&:hover': {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
      transform: 'translateY(-1px)',
    },
  })),
  
  // Card component
  Card: styled('div')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    transition: 'all 0.2s ease',
    
    '&:hover': {
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      transform: 'translateY(-2px)',
    },
  })),
  
  // Input field
  Input: styled('input')(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    border: `2px solid ${theme.palette.divider}`,
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
    transition: 'all 0.2s ease',
    
    '&:focus': {
      outline: 'none',
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 3px ${theme.palette.primary.light}40`,
    },
    
    '&::placeholder': {
      color: theme.palette.text.disabled,
    },
  })),
  
  // Badge component
  Badge: styled('span')(({ theme, variant = 'primary' }) => ({
    backgroundColor: variant === 'primary' 
      ? theme.palette.primary.main 
      : variant === 'secondary'
      ? theme.palette.secondary.main
      : variant === 'error'
      ? theme.palette.error.main
      : normalizeColor(theme.palette.status?.danger),
    color: variant === 'primary' 
      ? theme.palette.primary.contrastText 
      : variant === 'secondary'
      ? theme.palette.secondary.contrastText
      : variant === 'error'
      ? theme.palette.error.contrastText
      : theme.palette.common.white,
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 500,
    display: 'inline-block',
  })),
  
  // Alert component
  Alert: styled('div')(({ theme, severity = 'info' }) => ({
    backgroundColor: severity === 'error' 
      ? theme.palette.error.light 
      : severity === 'warning'
      ? theme.palette.warning?.light || '#fff3cd'
      : severity === 'success'
      ? theme.palette.success?.light || '#d4edda'
      : theme.palette.info?.light || '#d1ecf1',
    color: severity === 'error' 
      ? theme.palette.error.dark 
      : severity === 'warning'
      ? theme.palette.warning?.dark || '#856404'
      : severity === 'success'
      ? theme.palette.success?.dark || '#155724'
      : theme.palette.info?.dark || '#0c5460',
    border: `1px solid ${severity === 'error' 
      ? theme.palette.error.main 
      : severity === 'warning'
      ? theme.palette.warning?.main || '#ffeaa7'
      : severity === 'success'
      ? theme.palette.success?.main || '#c3e6cb'
      : theme.palette.info?.main || '#bee5eb'}`,
    borderRadius: '8px',
    padding: '12px 16px',
    fontSize: '14px',
  })),
};

/**
 * CSS-in-JS helper functions
 */
export const themeHelpers = {
  // Get color with opacity
  withOpacity: (color, opacity) => {
    // Convert hex to rgba
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${opacity})`;
    }
    return color;
  },
  
  // Get contrast color (light or dark)
  getContrastText: (theme, backgroundColor) => {
    return theme.palette.getContrastText(backgroundColor);
  },
  
  // Get theme-aware shadow
  getShadow: (theme, elevation = 1) => {
    const shadows = {
      1: '0 2px 4px rgba(0,0,0,0.1)',
      2: '0 4px 8px rgba(0,0,0,0.15)',
      3: '0 8px 16px rgba(0,0,0,0.2)',
      4: '0 12px 24px rgba(0,0,0,0.25)',
    };
    return shadows[elevation] || shadows[1];
  },
  
  // Get responsive spacing
  getSpacing: (theme, multiplier = 1) => {
    return theme.spacing(multiplier);
  },
  
  // Get appropriate hover color based on theme type
  getHoverColor: (theme, colorType = 'primary') => {
    const palette = theme.palette[colorType];
    const accessibility = theme.accessibility;
    
    if (accessibility?.type === 'highContrast') {
      // For high contrast themes, use darker variants to maintain contrast
      return palette.dark;
    } else if (theme.palette.mode === 'dark') {
      // For dark themes, use lighter variants
      return palette.light;
    } else {
      // For light themes, use a very light background that maintains text contrast
      // This ensures dark text remains visible on light backgrounds
      return theme.palette.mode === 'light' 
        ? theme.palette.grey?.[50] || '#f8fafc'  // Very light gray
        : palette.dark;
    }
  },
  
  // Get hover text color that ensures proper contrast
  getHoverTextColor: (theme, colorType = 'primary') => {
    const palette = theme.palette[colorType];
    console.log("🚀 ~ palette:", palette)
    const accessibility = theme.accessibility;
    
    if (accessibility?.type === 'highContrast') {
      // For high contrast themes, always use contrast text
      return palette.contrastText;
    } else if (theme.palette.mode === 'dark') {
      // For dark themes, use contrast text or fallback to primary text
      return palette.contrastText || theme.palette.text.primary;
    } else {
      // For light themes, use dark text for good contrast
      return theme.palette.text.primary;
    }
  },
};

/**
 * Accessibility helpers
 */
export const accessibilityHelpers = {
  // Check if current theme is high contrast
  isHighContrast: (theme) => {
    return theme.accessibility?.type === 'highContrast';
  },
  
  // Check if current theme is for light sensitivity
  isLightSensitive: (theme) => {
    return theme.accessibility?.type === 'lightSensitivity';
  },
  
  // Get appropriate font size for accessibility
  getAccessibleFontSize: (theme) => {
    if (theme.accessibility?.type === 'highContrast') {
      return '16px';
    }
    return theme.typography?.fontSize || '14px';
  },
  
  // Get appropriate font weight for accessibility
  getAccessibleFontWeight: (theme) => {
    if (theme.accessibility?.type === 'highContrast') {
      return 700;
    }
    return theme.typography?.fontWeightBold || 600;
  },
};

export default {
  useThemeColors,
  ThemedComponents,
  themeHelpers,
  accessibilityHelpers,
};
