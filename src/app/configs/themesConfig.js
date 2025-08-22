
export const lightPaletteText = {
  primary: 'rgb(17, 24, 39)',
  secondary: 'rgb(107, 114, 128)',
  disabled: 'rgb(149, 156, 169)',
};

export const darkPaletteText = {
  primary: 'rgb(255,255,255)',
  secondary: 'rgb(148, 163, 184)',
  disabled: 'rgb(156, 163, 175)',
};

const themesConfig = {
  default: {
    palette: {
      mode: 'light',
      divider: '#e2e8f0',
      text: lightPaletteText,
      common: {
        black: 'rgb(17, 24, 39)',
        white: 'rgb(255, 255, 255)',
      },
      primary: {
        light: '#f1f5f9', // Much lighter for better contrast
        main: '#1e293b',
        dark: '#0f172a',
        contrastText: darkPaletteText.primary,
      },
      secondary: {
        light: '#f1f5f9', // Much lighter for better contrast
        main: '#4f46e5',
        dark: '#3730a3',
        contrastText: darkPaletteText.primary,
      },
      background: {
        paper: '#FFFFFF',
        default: '#FFFFFF',
      },
      error: {
        light: '#ffcdd2',
        main: '#f44336',
        dark: '#b71c1c',
      },
    },
    status: {
      danger: '#ff9800',
    },
    typography: {
      fontSize: 14,
    },
    accessibility: {
      name: 'Default',
    }
  },
  defaultDark: {
    palette: {
      mode: 'dark',
      divider: 'rgba(241,245,249,.12)',
      text: darkPaletteText,
      common: {
        black: 'rgb(17, 24, 39)',
        white: 'rgb(255, 255, 255)',
      },
      primary: {
        light: '#64748b',
        main: '#334155',
        dark: '#0f172a',
        contrastText: darkPaletteText.primary,
      },
      secondary: {
        light: '#818cf8',
        main: '#4f46e5',
        dark: '#3730a3',
        contrastText: darkPaletteText.primary,
      },
      background: {
        paper: '#1e293b',
        default: '#111827',
      },
      error: {
        light: '#ffcdd2',
        main: '#f44336',
        dark: '#b71c1c',
      },
      status: {
        danger: '#ff9800',
      },
    },
    typography: {
      fontSize: 14,
    },
    accessibility: {
      name: 'Dark Mode',
    }
  },
  // Yellow & Black
  yellowBlackContrast: {
    palette: {
      mode: 'dark',
      divider: '#FFFF00',
      text: {
        primary: '#FFFF00',
        secondary: '#FFFF00',
        disabled: '#AAAA00',
      },
      common: {
        black: '#000000',
        white: '#FFFF00',
      },
      primary: {
        light: '#CCCC00', // Darker yellow for better contrast
        main: '#FFFF00',
        dark: '#999900',  // Even darker for hover states
        contrastText: '#000000',
      },
      secondary: {
        light: '#CCCC00', // Darker yellow for better contrast
        main: '#FFFF00',
        dark: '#999900',  // Even darker for hover states
        contrastText: '#000000',
      },
      background: {
        paper: '#000000',
        default: '#000000',
      },
      error: {
        light: '#FFFF00',
        main: '#FFFF00',
        dark: '#CCCC00',
        contrastText: '#000000',
      },
    },
    status: {
      danger: '#FFFF00',
    },
    typography: {
      fontSize: 16,
      fontWeightBold: 700,
    },
    accessibility: {
      type: 'highContrast',
      name: 'Yellow & Black',
    },
  },
  // Inverted Colors
  invertedColors: {
    palette: {
      mode: 'dark',
      divider: '#FFFFFF',
      text: {
        primary: '#FFFFFF',
        secondary: '#DDDDDD',
        disabled: '#999999',
      },
      common: {
        black: '#FFFFFF',
        white: '#000000',
      },
      primary: {
        light: '#E1E1FF',
        main: '#BBBBFF',
        dark: '#9999FF',
        contrastText: '#000000',
      },
      secondary: {
        light: '#FFE1E1',
        main: '#FFBBBB',
        dark: '#FF9999',
        contrastText: '#000000',
      },
      background: {
        paper: '#000000',
        default: '#222222',
      },
      error: {
        light: '#00BBBB',
        main: '#00CCCC',
        dark: '#00EEEE',
        contrastText: '#000000',
      },
    },
    status: {
      danger: '#00FFFF',
    },
    typography: {
      fontSize: 16,
    },
    accessibility: {
      type: 'highContrast',
      name: 'Inverted Colors',
    },
  },
  // Sepia Theme
  sepiaTheme: {
    palette: {
      mode: 'light',
      divider: '#D0C8C0',
      text: {
        primary: '#5F4B32',
        secondary: '#7D6748',
        disabled: '#9F8C70',
      },
      common: {
        black: '#5F4B32',
        white: '#F5F2E9',
      },
      primary: {
        light: '#A67C52',
        main: '#8A6642', // Warm brown
        dark: '#6F5035',
        contrastText: '#F5F2E9',
      },
      secondary: {
        light: '#7D6748',
        main: '#5F4B32', // Darker brown
        dark: '#483A27',
        contrastText: '#F5F2E9',
      },
      background: {
        paper: '#F5F2E9', // Light sepia
        default: '#EFE6D9', // Slightly darker sepia
      },
      error: {
        light: '#B5624C',
        main: '#9A4E3A', // Muted reddish brown
        dark: '#7A3E2E',
        contrastText: '#F5F2E9',
      },
    },
    status: {
      danger: '#9A4E3A',
    },
    typography: {
      fontSize: 14,
    },
    accessibility: {
      type: 'lightSensitivity',
      name: 'Sepia',
    },
  },
  // Night Mode
  nightMode: {
    palette: {
      mode: 'dark',
      divider: 'rgba(62,81,120,0.2)',
      text: {
        primary: 'rgba(170,190,220,0.87)',
        secondary: 'rgba(170,190,220,0.6)',
        disabled: 'rgba(170,190,220,0.38)',
      },
      common: {
        black: '#0A1020',
        white: '#AAC0DC',
      },
      primary: {
        light: '#3E5178',
        main: '#2A3A5A', // Deep blue
        dark: '#1A2A45',
        contrastText: '#AAC0DC',
      },
      secondary: {
        light: '#4A5A7A',
        main: '#3A4A6A', // Slightly lighter blue
        dark: '#2A3A5A',
        contrastText: '#AAC0DC',
      },
      background: {
        paper: '#0F1A30',
        default: '#0A1020',
      },
      error: {
        light: '#614A5A',
        main: '#513A4A', // Muted purple
        dark: '#412A3A',
        contrastText: '#AAC0DC',
      },
    },
    status: {
      danger: '#513A4A',
    },
    typography: {
      fontSize: 14,
    },
    accessibility: {
      type: 'lightSensitivity',
      name: 'Night Mode',
    },
  },
};

export default themesConfig;