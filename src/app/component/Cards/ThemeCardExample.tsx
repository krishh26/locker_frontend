import React from 'react';
import { Card, PortfolioCard } from './index';
import { useThemeColors } from '../../utils/themeUtils';

/**
 * Example component demonstrating how to use the theme-friendly Cards
 */
export const ThemeCardExample = () => {
  const colors = useThemeColors();

  // Example data for portfolio cards
  const portfolioData = [
    { id: 1, name: "Evidence Library", color: colors.primary.main },
    { id: 2, name: "Progress", color: colors.secondary.main },
    { id: 3, name: "CPD", color: colors.error.main },
    { id: 4, name: "Resources", color: colors.status.danger },
  ];

  return (
    <div style={{ padding: '20px', backgroundColor: colors.background.default }}>
      <h2 style={{ color: colors.text.primary, marginBottom: '20px' }}>
        Theme-Friendly Cards Example
      </h2>
      
      {/* Regular Cards */}
      <div style={{ marginBottom: '40px' }}>
        <h3 style={{ color: colors.text.secondary, marginBottom: '15px' }}>
          Regular Cards
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
          <Card
            isIcon={true}
            name="📚"
            title="Learning Resources"
            color="primary"
          />
          
          <Card
            isIcon={false}
            name="A"
            title="Assessment"
            color="secondary"
          />
          
          <Card
            isIcon={true}
            name="📊"
            title="Progress Tracking"
            color="error"
          />
          
          <Card
            isIcon={false}
            name="S"
            title="Skills"
            color="text.secondary"
          />
        </div>
      </div>

      {/* Portfolio Cards */}
      <div>
        <h3 style={{ color: colors.text.secondary, marginBottom: '15px' }}>
          Portfolio Cards
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
          {portfolioData.map((item, index) => (
            <PortfolioCard
              key={item.id}
              data={item}
              index={index}
              handleClickData={(id, user_id) => {
                console.log('Clicked:', id, user_id);
              }}
            />
          ))}
        </div>
      </div>

      {/* Theme Information */}
      <div style={{ 
        marginTop: '40px', 
        padding: '20px', 
        backgroundColor: colors.background.paper,
        borderRadius: '8px',
        border: `1px solid ${colors.divider}`
      }}>
        <h4 style={{ color: colors.primary.main, marginBottom: '10px' }}>
          Current Theme Information
        </h4>
        <p style={{ color: colors.text.secondary, margin: '5px 0' }}>
          <strong>Theme:</strong> {colors.accessibility?.name || 'Default'}
        </p>
        <p style={{ color: colors.text.secondary, margin: '5px 0' }}>
          <strong>Mode:</strong> {colors.mode}
        </p>
        <p style={{ color: colors.text.secondary, margin: '5px 0' }}>
          <strong>Primary Color:</strong> {colors.primary.main}
        </p>
        <p style={{ color: colors.text.secondary, margin: '5px 0' }}>
          <strong>Secondary Color:</strong> {colors.secondary.main}
        </p>
      </div>
    </div>
  );
};

export default ThemeCardExample;
