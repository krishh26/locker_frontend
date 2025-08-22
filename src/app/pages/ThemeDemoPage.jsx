import React from 'react';
import { useTheme } from '@mui/material/styles';
import { styled } from '@mui/material/styles';
import { 
  useThemeColors, 
  ThemedComponents, 
  themeHelpers, 
  accessibilityHelpers 
} from '../utils/themeUtils';
import ThemeColorExamples from '../components/examples/ThemedComponentExamples';

const DemoContainer = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.default,
  minHeight: '100vh',
  color: theme.palette.text.primary,
}));

const ColorPalette = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: theme.spacing(2),
  marginBottom: theme.spacing(3),
}));

const ColorSwatch = styled('div')(({ theme, color, label }) => ({
  backgroundColor: color,
  color: theme.palette.getContrastText(color),
  padding: theme.spacing(2),
  borderRadius: theme.spacing(1),
  textAlign: 'center',
  fontWeight: 500,
  border: `1px solid ${theme.palette.divider}`,
  
  '& .color-name': {
    fontSize: '12px',
    opacity: 0.8,
    marginBottom: theme.spacing(0.5),
  },
  
  '& .color-value': {
    fontSize: '14px',
    fontWeight: 600,
  },
}));

const Section = styled('div')(({ theme }) => ({
  marginBottom: theme.spacing(4),
  padding: theme.spacing(3),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.spacing(1),
  border: `1px solid ${theme.palette.divider}`,
}));

const SectionTitle = styled('h2')(({ theme }) => ({
  color: theme.palette.primary.main,
  marginBottom: theme.spacing(2),
  fontSize: '1.5rem',
  fontWeight: 600,
}));

const ComponentGrid = styled('div')(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
  gap: theme.spacing(2),
  marginTop: theme.spacing(2),
}));

function ThemeDemoPage() {
  const theme = useTheme();
  const colors = useThemeColors();
  
  const isHighContrast = accessibilityHelpers.isHighContrast(theme);
  const isLightSensitive = accessibilityHelpers.isLightSensitive(theme);
  
  return (
    <DemoContainer>
      <h1 style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        color: colors.primary.main 
      }}>
        Theme Color Demo
      </h1>
      
      {/* Theme Information */}
      <Section>
        <SectionTitle>Current Theme Information</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div>
            <strong>Theme Name:</strong> {colors.accessibility?.name || 'Default'}
          </div>
          <div>
            <strong>Mode:</strong> {colors.mode}
          </div>
          <div>
            <strong>High Contrast:</strong> {isHighContrast ? 'Yes' : 'No'}
          </div>
          <div>
            <strong>Light Sensitive:</strong> {isLightSensitive ? 'Yes' : 'No'}
          </div>
        </div>
      </Section>
      
      {/* Primary Colors */}
      <Section>
        <SectionTitle>Primary Colors</SectionTitle>
        <ColorPalette>
          <ColorSwatch color={colors.primary.main} label="Primary Main">
            <div className="color-name">Primary Main</div>
            <div className="color-value">{colors.primary.main}</div>
          </ColorSwatch>
          <ColorSwatch color={colors.primary.light} label="Primary Light">
            <div className="color-name">Primary Light</div>
            <div className="color-value">{colors.primary.light}</div>
          </ColorSwatch>
          <ColorSwatch color={colors.primary.dark} label="Primary Dark">
            <div className="color-name">Primary Dark</div>
            <div className="color-value">{colors.primary.dark}</div>
          </ColorSwatch>
          <ColorSwatch color={colors.primary.contrastText} label="Primary Contrast">
            <div className="color-name">Primary Contrast Text</div>
            <div className="color-value">{colors.primary.contrastText}</div>
          </ColorSwatch>
        </ColorPalette>
      </Section>
      
      {/* Secondary Colors */}
      <Section>
        <SectionTitle>Secondary Colors</SectionTitle>
        <ColorPalette>
          <ColorSwatch color={colors.secondary.main} label="Secondary Main">
            <div className="color-name">Secondary Main</div>
            <div className="color-value">{colors.secondary.main}</div>
          </ColorSwatch>
          <ColorSwatch color={colors.secondary.light} label="Secondary Light">
            <div className="color-name">Secondary Light</div>
            <div className="color-value">{colors.secondary.light}</div>
          </ColorSwatch>
          <ColorSwatch color={colors.secondary.dark} label="Secondary Dark">
            <div className="color-name">Secondary Dark</div>
            <div className="color-value">{colors.secondary.dark}</div>
          </ColorSwatch>
          <ColorSwatch color={colors.secondary.contrastText} label="Secondary Contrast">
            <div className="color-name">Secondary Contrast Text</div>
            <div className="color-value">{colors.secondary.contrastText}</div>
          </ColorSwatch>
        </ColorPalette>
      </Section>
      
      {/* Background Colors */}
      <Section>
        <SectionTitle>Background Colors</SectionTitle>
        <ColorPalette>
          <ColorSwatch color={colors.background.paper} label="Background Paper">
            <div className="color-name">Background Paper</div>
            <div className="color-value">{colors.background.paper}</div>
          </ColorSwatch>
          <ColorSwatch color={colors.background.default} label="Background Default">
            <div className="color-name">Background Default</div>
            <div className="color-value">{colors.background.default}</div>
          </ColorSwatch>
        </ColorPalette>
      </Section>
      
      {/* Text Colors */}
      <Section>
        <SectionTitle>Text Colors</SectionTitle>
        <ColorPalette>
          <ColorSwatch color={colors.text.primary} label="Text Primary">
            <div className="color-name">Text Primary</div>
            <div className="color-value">{colors.text.primary}</div>
          </ColorSwatch>
          <ColorSwatch color={colors.text.secondary} label="Text Secondary">
            <div className="color-name">Text Secondary</div>
            <div className="color-value">{colors.text.secondary}</div>
          </ColorSwatch>
          <ColorSwatch color={colors.text.disabled} label="Text Disabled">
            <div className="color-name">Text Disabled</div>
            <div className="color-value">{colors.text.disabled}</div>
          </ColorSwatch>
        </ColorPalette>
      </Section>
      
      {/* Error Colors */}
      <Section>
        <SectionTitle>Error Colors</SectionTitle>
        <ColorPalette>
          <ColorSwatch color={colors.error.main} label="Error Main">
            <div className="color-name">Error Main</div>
            <div className="color-value">{colors.error.main}</div>
          </ColorSwatch>
          <ColorSwatch color={colors.error.light} label="Error Light">
            <div className="color-name">Error Light</div>
            <div className="color-value">{colors.error.light}</div>
          </ColorSwatch>
          <ColorSwatch color={colors.error.dark} label="Error Dark">
            <div className="color-name">Error Dark</div>
            <div className="color-value">{colors.error.dark}</div>
          </ColorSwatch>
        </ColorPalette>
      </Section>
      
      {/* Status Colors */}
      <Section>
        <SectionTitle>Status Colors</SectionTitle>
        <ColorPalette>
          <ColorSwatch color={colors.status.danger} label="Status Danger">
            <div className="color-name">Status Danger</div>
            <div className="color-value">{colors.status.danger}</div>
          </ColorSwatch>
        </ColorPalette>
      </Section>
      
      {/* Themed Components */}
      <Section>
        <SectionTitle>Themed Components</SectionTitle>
        <ComponentGrid>
          <div>
            <h4 style={{ marginBottom: '1rem', color: colors.text.primary }}>Buttons</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <ThemedComponents.PrimaryButton>Primary Button</ThemedComponents.PrimaryButton>
              <ThemedComponents.SecondaryButton>Secondary Button</ThemedComponents.SecondaryButton>
            </div>
          </div>
          
          <div>
            <h4 style={{ marginBottom: '1rem', color: colors.text.primary }}>Badges</h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <ThemedComponents.Badge variant="primary">Primary</ThemedComponents.Badge>
              <ThemedComponents.Badge variant="secondary">Secondary</ThemedComponents.Badge>
              <ThemedComponents.Badge variant="error">Error</ThemedComponents.Badge>
            </div>
          </div>
          
          <div>
            <h4 style={{ marginBottom: '1rem', color: colors.text.primary }}>Alerts</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <ThemedComponents.Alert severity="info">Info alert message</ThemedComponents.Alert>
              <ThemedComponents.Alert severity="error">Error alert message</ThemedComponents.Alert>
            </div>
          </div>
          
          <div>
            <h4 style={{ marginBottom: '1rem', color: colors.text.primary }}>Card</h4>
            <ThemedComponents.Card>
              <h5 style={{ margin: '0 0 0.5rem 0', color: colors.primary.main }}>Card Title</h5>
              <p style={{ margin: 0, color: colors.text.secondary }}>Card content with theme colors</p>
            </ThemedComponents.Card>
          </div>
        </ComponentGrid>
      </Section>
      
      {/* Theme Helpers Demo */}
      <Section>
        <SectionTitle>Theme Helpers Demo</SectionTitle>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          <div>
            <h4 style={{ marginBottom: '1rem', color: colors.text.primary }}>Opacity Helper</h4>
            <div style={{
              backgroundColor: themeHelpers.withOpacity(colors.primary.main, 0.1),
              padding: '1rem',
              borderRadius: '8px',
              border: `2px solid ${colors.primary.main}`,
            }}>
              <p style={{ margin: 0, color: colors.text.primary }}>
                This box uses primary color with 10% opacity
              </p>
            </div>
          </div>
          
          <div>
            <h4 style={{ marginBottom: '1rem', color: colors.text.primary }}>Shadow Helper</h4>
            <div style={{
              backgroundColor: colors.background.paper,
              padding: '1rem',
              borderRadius: '8px',
              boxShadow: themeHelpers.getShadow(theme, 3),
            }}>
              <p style={{ margin: 0, color: colors.text.primary }}>
                This box uses theme-aware shadow (elevation 3)
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Section>
        <SectionTitle>Themed Component Examples</SectionTitle>
        <ThemeColorExamples />
      </Section>
      
      {/* Instructions */}
      <Section>
        <SectionTitle>How to Test</SectionTitle>
        <div style={{ color: colors.text.secondary }}>
          <p><strong>To test theme switching:</strong></p>
          <ol style={{ marginLeft: '1.5rem' }}>
            <li>Click the color swatch icon in the top-right corner of your app</li>
            <li>Select different themes from the dropdown</li>
            <li>Watch how all the colors and components change automatically</li>
            <li>Test with high contrast themes for accessibility</li>
            <li>Test with light sensitivity themes for readability</li>
          </ol>
          <p style={{ marginTop: '1rem' }}>
            <strong>Note:</strong> All components on this page automatically adapt to theme changes 
            because they use the theme color system instead of hardcoded colors.
          </p>
        </div>
      </Section>
    </DemoContainer>
  );
}

export default ThemeDemoPage;
