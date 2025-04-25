import { ThemeProvider } from '@mui/material/styles';
import { memo, useEffect, useLayoutEffect, useMemo } from 'react';

const useEnhancedEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect;

function FuseTheme(props) {
  const { direction, theme } = props;
  const { mode } = theme.palette;

  // Use layout effect for direction to avoid flicker
  useEnhancedEffect(() => {
    if (document.body.dir !== direction) {
      document.body.dir = direction;
    }
  }, [direction]);

  // Use a regular effect for theme mode class
  useEffect(() => {
    // Only update classes if needed
    const shouldBeLight = mode === 'light';
    const hasLightClass = document.body.classList.contains('light');

    if (shouldBeLight && !hasLightClass) {
      document.body.classList.add('light');
      document.body.classList.remove('dark');
    } else if (!shouldBeLight && hasLightClass) {
      document.body.classList.add('dark');
      document.body.classList.remove('light');
    }
  }, [mode]);

  // Memoize the ThemeProvider to prevent unnecessary re-renders
  const memoizedThemeProvider = useMemo(() => {
    return <ThemeProvider theme={theme}>{props.children}</ThemeProvider>;
  }, [theme, props.children]);

  return memoizedThemeProvider;
}

// Use React.memo to prevent unnecessary re-renders
export default memo(FuseTheme);
