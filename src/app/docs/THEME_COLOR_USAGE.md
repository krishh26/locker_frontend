# Theme Color Usage Guide

This guide explains how to use the theme colors defined in `themesConfig.js` throughout your application.

## Available Themes

Your application includes several pre-configured themes:

- **default**: Light theme with blue/purple colors
- **defaultDark**: Dark theme with blue/purple colors  
- **yellowBlackContrast**: High contrast yellow and black theme
- **invertedColors**: High contrast inverted color theme
- **sepiaTheme**: Light sensitivity theme with warm brown tones
- **nightMode**: Light sensitivity theme with deep blue tones

## Quick Start

### 1. Using the `useThemeColors` Hook

The easiest way to access theme colors is using the `useThemeColors` hook:

```jsx
import { useThemeColors } from 'app/utils/themeUtils';

function MyComponent() {
  const colors = useThemeColors();
  
  return (
    <div style={{
      backgroundColor: colors.background.paper,
      color: colors.text.primary,
      border: `1px solid ${colors.divider}`
    }}>
      <h1 style={{ color: colors.primary.main }}>My Title</h1>
      <p style={{ color: colors.text.secondary }}>My content</p>
      <button style={{
        backgroundColor: colors.primary.main,
        color: colors.primary.contrastText
      }}>
        Click me
      </button>
    </div>
  );
}
```

### 2. Using Styled Components

Create styled components that automatically adapt to theme changes:

```jsx
import { styled } from '@mui/material/styles';

const ThemedCard = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  
  '& h2': {
    color: theme.palette.primary.main,
  },
  
  '& p': {
    color: theme.palette.text.secondary,
  },
}));

function MyComponent() {
  return (
    <ThemedCard>
      <h2>Title</h2>
      <p>Content</p>
    </ThemedCard>
  );
}
```

### 3. Using Pre-built Themed Components

Use the pre-built components that automatically handle theming:

```jsx
import { ThemedComponents } from 'app/utils/themeUtils';

function MyComponent() {
  const { PrimaryButton, SecondaryButton, Card, Badge, Alert } = ThemedComponents;
  
  return (
    <Card>
      <h3>My Card</h3>
      <p>Card content</p>
      <div style={{ display: 'flex', gap: '10px' }}>
        <PrimaryButton>Primary Action</PrimaryButton>
        <SecondaryButton>Secondary Action</SecondaryButton>
      </div>
      <Badge variant="primary">New</Badge>
      <Alert severity="info">Information message</Alert>
    </Card>
  );
}
```

## Available Color Properties

### Primary Colors
```jsx
const colors = useThemeColors();

// Primary color variants
colors.primary.main      // Main primary color
colors.primary.light     // Lighter variant
colors.primary.dark      // Darker variant
colors.primary.contrastText // Text color that contrasts with primary
```

### Secondary Colors
```jsx
// Secondary color variants
colors.secondary.main      // Main secondary color
colors.secondary.light     // Lighter variant
colors.secondary.dark      // Darker variant
colors.secondary.contrastText // Text color that contrasts with secondary
```

### Background Colors
```jsx
// Background colors
colors.background.paper   // Paper/surface background
colors.background.default // Default page background
```

### Text Colors
```jsx
// Text colors
colors.text.primary    // Primary text color
colors.text.secondary  // Secondary text color
colors.text.disabled   // Disabled text color
```

### Error Colors
```jsx
// Error colors
colors.error.main      // Main error color
colors.error.light     // Light error color
colors.error.dark      // Dark error color
colors.error.contrastText // Text color that contrasts with error
```

### Status Colors
```jsx
// Status colors
colors.status.danger   // Danger/warning color
```

### Common Colors
```jsx
// Common colors
colors.common.black    // Pure black
colors.common.white    // Pure white
```

### Other Properties
```jsx
// Other theme properties
colors.divider         // Divider/border color
colors.mode            // 'light' or 'dark'
colors.accessibility   // Accessibility information
```

## Theme Helpers

### Color Manipulation
```jsx
import { themeHelpers } from 'app/utils/themeUtils';

// Add opacity to a color
const semiTransparent = themeHelpers.withOpacity(colors.primary.main, 0.5);

// Get contrast text color
const contrastText = themeHelpers.getContrastText(theme, colors.primary.main);

// Get theme-aware shadow
const shadow = themeHelpers.getShadow(theme, 2); // elevation 1-4

// Get responsive spacing
const spacing = themeHelpers.getSpacing(theme, 2); // 2 * theme.spacing unit
```

### Accessibility Helpers
```jsx
import { accessibilityHelpers } from 'app/utils/themeUtils';

// Check theme type
const isHighContrast = accessibilityHelpers.isHighContrast(theme);
const isLightSensitive = accessibilityHelpers.isLightSensitive(theme);

// Get accessible typography
const fontSize = accessibilityHelpers.getAccessibleFontSize(theme);
const fontWeight = accessibilityHelpers.getAccessibleFontWeight(theme);
```

## Best Practices

### 1. Always Use Theme Colors
Never hardcode colors. Always use theme colors to ensure consistency and accessibility:

```jsx
// ❌ Bad - hardcoded colors
<div style={{ backgroundColor: '#ffffff', color: '#000000' }}>

// ✅ Good - theme colors
<div style={{ backgroundColor: colors.background.paper, color: colors.text.primary }}>
```

### 2. Use Semantic Color Names
Use semantic color names rather than specific color values:

```jsx
// ❌ Bad - specific color
color: '#1e293b'

// ✅ Good - semantic
color: colors.primary.main
```

### 3. Consider Accessibility
Use the accessibility helpers to ensure your components work with all themes:

```jsx
const fontSize = accessibilityHelpers.getAccessibleFontSize(theme);
const fontWeight = accessibilityHelpers.getAccessibleFontWeight(theme);

return (
  <div style={{ fontSize, fontWeight }}>
    Accessible content
  </div>
);
```

### 4. Use Contrast Text Colors
Always use the appropriate contrast text color for backgrounds:

```jsx
// ❌ Bad - might not have enough contrast
<button style={{ backgroundColor: colors.primary.main, color: 'white' }}>

// ✅ Good - uses theme-defined contrast text
<button style={{ backgroundColor: colors.primary.main, color: colors.primary.contrastText }}>
```

### 5. Handle Theme Changes
Your components will automatically adapt to theme changes, but you can also listen for changes:

```jsx
import { useTheme } from '@mui/material/styles';

function MyComponent() {
  const theme = useTheme();
  const colors = useThemeColors();
  
  // This component will automatically re-render when theme changes
  return (
    <div style={{ backgroundColor: colors.background.paper }}>
      Current theme: {colors.accessibility?.name || 'Default'}
    </div>
  );
}
```

## Common Patterns

### Button Components
```jsx
const ThemedButton = styled('button')(({ theme, variant = 'primary' }) => ({
  backgroundColor: variant === 'primary' 
    ? theme.palette.primary.main 
    : theme.palette.secondary.main,
  color: variant === 'primary' 
    ? theme.palette.primary.contrastText 
    : theme.palette.secondary.contrastText,
  border: 'none',
  padding: theme.spacing(1, 2),
  borderRadius: theme.spacing(0.5),
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  
  '&:hover': {
    backgroundColor: variant === 'primary' 
      ? theme.palette.primary.dark 
      : theme.palette.secondary.dark,
  },
}));
```

### Card Components
```jsx
const ThemedCard = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  padding: theme.spacing(2),
  boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
}));
```

### Input Components
```jsx
const ThemedInput = styled('input')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  border: `2px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(0.5),
  padding: theme.spacing(1),
  
  '&:focus': {
    outline: 'none',
    borderColor: theme.palette.primary.main,
  },
  
  '&::placeholder': {
    color: theme.palette.text.disabled,
  },
}));
```

## Testing Theme Changes

To test how your components look with different themes:

1. Use the theme switcher in the settings panel (the color swatch icon)
2. Switch between different themes to see how your components adapt
3. Test with high contrast themes to ensure accessibility
4. Test with light sensitivity themes to ensure readability

## Troubleshooting

### Colors Not Updating
If colors aren't updating when you change themes:
- Make sure you're using `useThemeColors()` or `useTheme()` hooks
- Check that your component is wrapped in the theme provider
- Ensure you're not hardcoding colors

### Poor Contrast
If text is hard to read:
- Use `colors.primary.contrastText` instead of hardcoded colors
- Test with high contrast themes
- Use the accessibility helpers for appropriate font sizes and weights

### Inconsistent Styling
If styling is inconsistent:
- Use the pre-built themed components when possible
- Follow the patterns shown in the examples
- Use semantic color names instead of specific values

## Examples

See `src/app/components/examples/ThemedComponentExamples.jsx` for comprehensive examples of how to use theme colors in different scenarios.
