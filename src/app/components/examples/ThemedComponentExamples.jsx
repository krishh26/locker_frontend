import React from 'react';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import { 
  useThemeColors, 
  ThemedComponents, 
  themeHelpers, 
  accessibilityHelpers 
} from '../../utils/themeUtils';

/**
 * Example 1: Using the useThemeColors hook
 */
export const ExampleWithHook = () => {
  const colors = useThemeColors();
  
  return (
    <div style={{ 
      backgroundColor: colors.background.paper,
      color: colors.text.primary,
      padding: '20px',
      borderRadius: '8px',
      border: `1px solid ${colors.divider}`
    }}>
      <h2 style={{ color: colors.primary.main }}>Using useThemeColors Hook</h2>
      <p style={{ color: colors.text.secondary }}>
        This component uses the useThemeColors hook to access theme colors.
      </p>
      <button style={{
        backgroundColor: colors.primary.main,
        color: colors.primary.contrastText,
        border: 'none',
        padding: '10px 20px',
        borderRadius: '4px',
        cursor: 'pointer'
      }}>
        Primary Button
      </button>
    </div>
  );
};

/**
 * Example 2: Using styled components with theme
 */
const StyledExample = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  padding: theme.spacing(3),
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
  marginBottom: theme.spacing(2),
  
  '& h3': {
    color: theme.palette.primary.main,
    marginBottom: theme.spacing(1),
  },
  
  '& p': {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(2),
  },
  
  '& .button-group': {
    display: 'flex',
    gap: theme.spacing(1),
  },
}));

const StyledButton = styled('button')(({ theme, variant = 'primary' }) => ({
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
  fontSize: '14px',
  fontWeight: 500,
  transition: 'all 0.2s ease',
  
  '&:hover': {
    backgroundColor: variant === 'primary' 
      ? theme.palette.primary.dark 
      : theme.palette.secondary.dark,
    transform: 'translateY(-1px)',
  },
}));

export const ExampleWithStyledComponents = () => {
  return (
    <StyledExample>
      <h3>Using Styled Components</h3>
      <p>This component uses styled-components with theme integration.</p>
      <div className="button-group">
        <StyledButton variant="primary">Primary</StyledButton>
        <StyledButton variant="secondary">Secondary</StyledButton>
      </div>
    </StyledExample>
  );
};

/**
 * Example 3: Using the pre-built themed components
 */
export const ExampleWithPrebuiltComponents = () => {
  const { PrimaryButton, SecondaryButton, Card, Badge, Alert } = ThemedComponents;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Card>
        <h3>Pre-built Themed Components</h3>
        <p>These components automatically adapt to your current theme.</p>
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <PrimaryButton>Primary</PrimaryButton>
          <SecondaryButton>Secondary</SecondaryButton>
        </div>
      </Card>
      
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        <Badge variant="primary">Primary</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="error">Error</Badge>
      </div>
      
      <Alert severity="info">This is an info alert</Alert>
      <Alert severity="error">This is an error alert</Alert>
    </div>
  );
};

/**
 * Example 4: Using theme helpers and accessibility features
 */
export const ExampleWithHelpers = () => {
  const theme = useTheme();
  const colors = useThemeColors();
  
  const isHighContrast = accessibilityHelpers.isHighContrast(theme);
  const isLightSensitive = accessibilityHelpers.isLightSensitive(theme);
  const fontSize = accessibilityHelpers.getAccessibleFontSize(theme);
  const fontWeight = accessibilityHelpers.getAccessibleFontWeight(theme);
  
  return (
    <div style={{
      backgroundColor: colors.background.paper,
      color: colors.text.primary,
      padding: '20px',
      borderRadius: '8px',
      border: `1px solid ${colors.divider}`,
      fontSize: fontSize,
      fontWeight: fontWeight,
    }}>
      <h3 style={{ color: colors.primary.main }}>Theme Helpers & Accessibility</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <p><strong>Current Theme:</strong> {colors.accessibility?.name || 'Default'}</p>
        <p><strong>Mode:</strong> {colors.mode}</p>
        <p><strong>High Contrast:</strong> {isHighContrast ? 'Yes' : 'No'}</p>
        <p><strong>Light Sensitive:</strong> {isLightSensitive ? 'Yes' : 'No'}</p>
      </div>
      
      <div style={{
        backgroundColor: themeHelpers.withOpacity(colors.primary.main, 0.1),
        padding: '15px',
        borderRadius: '8px',
        border: `2px solid ${colors.primary.main}`,
      }}>
        <p>This box uses theme helpers for opacity and contrast.</p>
        <p style={{ color: colors.text.secondary }}>
          Background: {colors.primary.main} with 10% opacity
        </p>
      </div>
    </div>
  );
};

/**
 * Example 5: Responsive theme-aware component
 */
const ResponsiveCard = styled('div')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: themeHelpers.getShadow(theme, 2),
  transition: 'all 0.3s ease',
  
  '&:hover': {
    boxShadow: themeHelpers.getShadow(theme, 4),
    transform: 'translateY(-4px)',
  },
  
  [theme.breakpoints.up('md')]: {
    padding: theme.spacing(4),
  },
  
  [theme.breakpoints.up('lg')]: {
    padding: theme.spacing(5),
  },
}));

export const ExampleResponsiveComponent = () => {
  const colors = useThemeColors();
  
  return (
    <ResponsiveCard>
      <h3 style={{ color: colors.primary.main }}>Responsive Theme Component</h3>
      <p style={{ color: colors.text.secondary }}>
        This component adapts to both theme changes and screen size changes.
      </p>
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginTop: '15px'
      }}>
        <span style={{
          backgroundColor: colors.secondary.main,
          color: colors.secondary.contrastText,
          padding: '5px 10px',
          borderRadius: '15px',
          fontSize: '12px'
        }}>
          Responsive
        </span>
        <span style={{
          backgroundColor: colors.error.main,
          color: colors.error.contrastText,
          padding: '5px 10px',
          borderRadius: '15px',
          fontSize: '12px'
        }}>
          Theme-aware
        </span>
      </div>
    </ResponsiveCard>
  );
};

/**
 * Example 6: Form components with theme colors
 */
const ThemedForm = styled('form')(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(3),
  borderRadius: theme.spacing(2),
  border: `1px solid ${theme.palette.divider}`,
}));

const ThemedInput = styled('input')(({ theme }) => ({
  width: '100%',
  padding: theme.spacing(1.5),
  border: `2px solid ${theme.palette.divider}`,
  borderRadius: theme.spacing(1),
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  fontSize: '14px',
  transition: 'all 0.2s ease',
  
  '&:focus': {
    outline: 'none',
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 3px ${themeHelpers.withOpacity(theme.palette.primary.main, 0.2)}`,
  },
  
  '&::placeholder': {
    color: theme.palette.text.disabled,
  },
}));

const ThemedLabel = styled('label')(({ theme }) => ({
  display: 'block',
  marginBottom: theme.spacing(0.5),
  color: theme.palette.text.primary,
  fontWeight: 500,
  fontSize: '14px',
}));

export const ExampleFormComponent = () => {
  const colors = useThemeColors();
  
  return (
    <ThemedForm>
      <h3 style={{ color: colors.primary.main, marginBottom: '20px' }}>
        Themed Form Example
      </h3>
      
      <div style={{ marginBottom: '15px' }}>
        <ThemedLabel>Name</ThemedLabel>
        <ThemedInput placeholder="Enter your name" />
      </div>
      
      <div style={{ marginBottom: '15px' }}>
        <ThemedLabel>Email</ThemedLabel>
        <ThemedInput type="email" placeholder="Enter your email" />
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <ThemedComponents.PrimaryButton type="submit">
          Submit
        </ThemedComponents.PrimaryButton>
        <ThemedComponents.SecondaryButton type="button">
          Cancel
        </ThemedComponents.SecondaryButton>
      </div>
    </ThemedForm>
  );
};

/**
 * Main example component that showcases all examples
 */
export const ThemeColorExamples = () => {
  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        Theme Color Usage Examples
      </h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        <ExampleWithHook />
        <ExampleWithStyledComponents />
        <ExampleWithPrebuiltComponents />
        <ExampleWithHelpers />
        <ExampleResponsiveComponent />
        <ExampleFormComponent />
      </div>
    </div>
  );
};

export default ThemeColorExamples;
