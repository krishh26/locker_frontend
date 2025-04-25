import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';
import { memo, useMemo, useCallback } from 'react';
import clsx from 'clsx';

// Memoized SchemePreview component to prevent unnecessary re-renders
const SchemePreview = memo(({ theme, className, id, onSelect }) => {
  const _theme = useTheme();

  // Use useMemo for expensive calculations
  const colors = useMemo(() => {
    const primaryColor = theme.palette.primary[500]
      ? theme.palette.primary[500]
      : theme.palette.primary.main;
    const primaryColorContrast =
      theme.palette.primary.contrastText || _theme.palette.getContrastText(primaryColor);
    const secondaryColor = theme.palette.secondary[500]
      ? theme.palette.secondary[500]
      : theme.palette.secondary.main;
    const secondaryColorContrast =
      theme.palette.secondary.contrastText || _theme.palette.getContrastText(secondaryColor);
    const backgroundColor = theme.palette.background.default;
    const backgroundColorContrast = _theme.palette.getContrastText(theme.palette.background.default);
    const paperColor = theme.palette.background.paper;
    const paperColorContrast = _theme.palette.getContrastText(theme.palette.background.paper);

    return {
      primaryColor,
      primaryColorContrast,
      secondaryColor,
      secondaryColorContrast,
      backgroundColor,
      backgroundColorContrast,
      paperColor,
      paperColorContrast
    };
  }, [theme.palette, _theme]);

  // Check if this is an accessibility-focused theme
  const isAccessibilityTheme = theme.accessibility && theme.accessibility.type;

  // Get accessibility type and badge properties - memoized
  const accessibilityInfo = useMemo(() => {
    if (!theme.accessibility) {
      return {
        type: '',
        badgeColor: colors.secondaryColor,
        badgeTextColor: colors.secondaryColorContrast
      };
    }

    let type = '';
    let badgeColor = colors.secondaryColor;
    let badgeTextColor = '#FFFFFF';

    switch(theme.accessibility.type) {
      case 'highContrast':
        type = 'High Contrast';
        badgeColor = '#FF5722'; // Deep Orange
        break;
      case 'colorblind':
        type = 'Color Blind Friendly';
        badgeColor = '#2196F3'; // Blue
        break;
      case 'lightSensitivity':
        type = 'Light Sensitivity';
        badgeColor = '#9C27B0'; // Purple
        break;
      case 'readability':
        type = 'Enhanced Readability';
        badgeColor = '#4CAF50'; // Green
        break;
      default:
        type = '';
        badgeTextColor = colors.secondaryColorContrast;
    }

    return { type, badgeColor, badgeTextColor };
  }, [theme.accessibility, colors.secondaryColor, colors.secondaryColorContrast]);

  // Handle click with useCallback to prevent unnecessary function recreation
  const handleClick = useCallback(() => {
    onSelect(theme);
  }, [onSelect, theme]);

  return (
    <div className={clsx(className, 'mb-8')}>
      <button
        className={clsx(
          'w-full text-left rounded-6 relative font-500 shadow hover:shadow-md transition-shadow cursor-pointer overflow-hidden',
          isAccessibilityTheme && 'ring-2 ring-offset-2 ring-blue-500'
        )}
        style={{
          backgroundColor: colors.backgroundColor,
          color: colors.backgroundColorContrast,
        }}
        onClick={handleClick}
        type="button"
      >
        <div
          className="w-full h-56 px-8 pt-8 relative"
          style={{
            backgroundColor: colors.primaryColor,
            color: colors.primaryColorContrast,
          }}
        >
          <span className="text-12 opacity-75">Header (Primary)</span>

          <div
            className="flex items-center justify-center w-20 h-20 rounded-full absolute bottom-0 right-0 -mb-10 shadow text-10 mr-4"
            style={{
              backgroundColor: colors.secondaryColor,
              color: colors.secondaryColorContrast,
            }}
          >
            <span className="opacity-75">S</span>
          </div>
        </div>
        <div className="pl-8 pr-28 -mt-24 w-full">
          <div
            className="w-full h-96 rounded-4 relative shadow p-8"
            style={{
              backgroundColor: colors.paperColor,
              color: colors.paperColorContrast,
            }}
          >
            <span className="text-12 opacity-75">Paper</span>
          </div>
        </div>

        <div className="px-8 py-8 w-full">
          <span className="text-12 opacity-75">Background</span>
        </div>

        {isAccessibilityTheme && (
          <div
            className="absolute top-0 right-0 px-4 py-1 text-xs font-bold"
            style={{
              backgroundColor: accessibilityInfo.badgeColor,
              color: accessibilityInfo.badgeTextColor,
              borderBottomLeftRadius: '6px',
            }}
          >
            {accessibilityInfo.type}
          </div>
        )}
      </button>
      <Typography className="font-semibold w-full text-center mt-12">
        {theme.accessibility ? theme.accessibility.name : id}
        {isAccessibilityTheme && (
          <Typography component="span" className="block text-xs mt-1 text-center" color="text.secondary">
            {id}
          </Typography>
        )}
      </Typography>
    </div>
  );
});

// Memoized Theme Section component
const ThemeSection = memo(({ title, themes: sectionThemes, onSelect }) => {
  if (sectionThemes.length === 0) return null;

  return (
    <div className="w-full mb-32">
      <Typography className="font-medium mb-16 px-8" variant="subtitle1">
        {title}
      </Typography>
      <div className="flex flex-wrap w-full">
        {sectionThemes.map(({ key, theme }) => (
          <div key={key} className="w-1/2 p-8">
            <SchemePreview id={key} theme={theme} onSelect={() => onSelect(theme)} />
          </div>
        ))}
      </div>
    </div>
  );
});

function FuseThemeSchemes(props) {
  const { themes, onSelect } = props;

  // Use useMemo to avoid recalculating on every render
  const groupedThemes = useMemo(() => {
    const groups = {
      standard: [],
      highContrast: [],
      colorblind: [],
      lightSensitivity: [],
      readability: []
    };

    // Categorize themes
    Object.entries(themes)
      .filter(([key]) => !(key === 'mainThemeDark' || key === 'mainThemeLight'))
      .forEach(([key, theme]) => {
        if (!theme.accessibility) {
          groups.standard.push({ key, theme });
        } else {
          const type = theme.accessibility.type;
          if (groups[type]) {
            groups[type].push({ key, theme });
          } else {
            groups.standard.push({ key, theme });
          }
        }
      });

    return groups;
  }, [themes]); // Only recalculate when themes change

  // Use lazy loading with React.lazy and Suspense for better performance
  return (
    <div>
      <ThemeSection title="Standard Themes" themes={groupedThemes.standard} onSelect={onSelect} />
      <ThemeSection title="High Contrast Themes" themes={groupedThemes.highContrast} onSelect={onSelect} />
      <ThemeSection title="Color Blind Friendly Themes" themes={groupedThemes.colorblind} onSelect={onSelect} />
      <ThemeSection title="Light Sensitivity Themes" themes={groupedThemes.lightSensitivity} onSelect={onSelect} />
      <ThemeSection title="Enhanced Readability Themes" themes={groupedThemes.readability} onSelect={onSelect} />
    </div>
  );
}

export default memo(FuseThemeSchemes);
