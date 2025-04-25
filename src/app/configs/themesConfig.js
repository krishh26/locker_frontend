
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
        light: '#64748b',
        main: '#1e293b',
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
      danger: 'orange',
    },
    typography: {
      fontSize: 14,
    },
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
        danger: 'orange',
      },
    },
    typography: {
      fontSize: 14,
    },
  },

  // 1. HIGH CONTRAST THEMES

  // Black & White High Contrast
  blackWhiteContrast: {
    palette: {
      mode: 'light',
      divider: '#000000',
      text: {
        primary: '#000000',
        secondary: '#000000',
        disabled: '#444444',
      },
      common: {
        black: '#000000',
        white: '#ffffff',
      },
      primary: {
        light: '#000000',
        main: '#000000',
        dark: '#000000',
        contrastText: '#ffffff',
      },
      secondary: {
        light: '#000000',
        main: '#000000',
        dark: '#000000',
        contrastText: '#ffffff',
      },
      background: {
        paper: '#ffffff',
        default: '#ffffff',
      },
      error: {
        light: '#000000',
        main: '#000000',
        dark: '#000000',
        contrastText: '#ffffff',
      },
    },
    status: {
      danger: '#000000',
    },
    typography: {
      fontSize: 16,
      fontWeightBold: 700,
    },
    accessibility: {
      type: 'highContrast',
      name: 'Black & White',
    },
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
        light: '#FFFF00',
        main: '#FFFF00',
        dark: '#CCCC00',
        contrastText: '#000000',
      },
      secondary: {
        light: '#FFFF00',
        main: '#FFFF00',
        dark: '#CCCC00',
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

  // 2. COLORBLIND-FRIENDLY THEMES

  // Protanopia (Red-Blind) Mode
  protanopiaMode: {
    palette: {
      mode: 'light',
      divider: '#555555',
      text: {
        primary: '#222222',
        secondary: '#444444',
        disabled: '#666666',
      },
      common: {
        black: '#000000',
        white: '#ffffff',
      },
      primary: {
        light: '#0072B2',
        main: '#0072B2', // Blue that's visible to those with protanopia
        dark: '#005380',
        contrastText: '#ffffff',
      },
      secondary: {
        light: '#E69F00',
        main: '#E69F00', // Orange/yellow that's visible to those with protanopia
        dark: '#B37F00',
        contrastText: '#000000',
      },
      background: {
        paper: '#FFFFFF',
        default: '#F5F5F5',
      },
      error: {
        light: '#E69F00',
        main: '#E69F00', // Using orange instead of red
        dark: '#B37F00',
        contrastText: '#000000',
      },
    },
    status: {
      danger: '#E69F00',
    },
    typography: {
      fontSize: 14,
    },
    accessibility: {
      type: 'colorblind',
      name: 'Protanopia (Red-Blind)',
    },
  },

  // Deuteranopia (Green-Blind) Mode
  deuteranopiaMode: {
    palette: {
      mode: 'light',
      divider: '#555555',
      text: {
        primary: '#222222',
        secondary: '#444444',
        disabled: '#666666',
      },
      common: {
        black: '#000000',
        white: '#ffffff',
      },
      primary: {
        light: '#0072B2',
        main: '#0072B2', // Blue that's visible to those with deuteranopia
        dark: '#005380',
        contrastText: '#ffffff',
      },
      secondary: {
        light: '#F0E442',
        main: '#F0E442', // Yellow that's visible to those with deuteranopia
        dark: '#C0B632',
        contrastText: '#000000',
      },
      background: {
        paper: '#FFFFFF',
        default: '#F5F5F5',
      },
      error: {
        light: '#CC79A7',
        main: '#CC79A7', // Using pink instead of red/green
        dark: '#A3608A',
        contrastText: '#ffffff',
      },
    },
    status: {
      danger: '#CC79A7',
    },
    typography: {
      fontSize: 14,
    },
    accessibility: {
      type: 'colorblind',
      name: 'Deuteranopia (Green-Blind)',
    },
  },

  // Tritanopia (Blue-Blind) Mode
  tritanopiaMode: {
    palette: {
      mode: 'light',
      divider: '#555555',
      text: {
        primary: '#222222',
        secondary: '#444444',
        disabled: '#666666',
      },
      common: {
        black: '#000000',
        white: '#ffffff',
      },
      primary: {
        light: '#D55E00',
        main: '#D55E00', // Red/orange that's visible to those with tritanopia
        dark: '#A84A00',
        contrastText: '#ffffff',
      },
      secondary: {
        light: '#000000',
        main: '#000000', // Black is safe for all color vision deficiencies
        dark: '#000000',
        contrastText: '#ffffff',
      },
      background: {
        paper: '#FFFFFF',
        default: '#F5F5F5',
      },
      error: {
        light: '#D55E00',
        main: '#D55E00', // Red/orange
        dark: '#A84A00',
        contrastText: '#ffffff',
      },
    },
    status: {
      danger: '#D55E00',
    },
    typography: {
      fontSize: 14,
    },
    accessibility: {
      type: 'colorblind',
      name: 'Tritanopia (Blue-Blind)',
    },
  },

  // 3. LIGHT SENSITIVITY THEMES

  // Dark Mode (Enhanced)
  darkMode: {
    palette: {
      mode: 'dark',
      divider: 'rgba(255,255,255,0.1)',
      text: {
        primary: 'rgba(255,255,255,0.87)',
        secondary: 'rgba(255,255,255,0.6)',
        disabled: 'rgba(255,255,255,0.38)',
      },
      common: {
        black: '#000000',
        white: '#ffffff',
      },
      primary: {
        light: '#4D4D6B',
        main: '#2D2D4D', // Muted dark blue
        dark: '#1A1A33',
        contrastText: 'rgba(255,255,255,0.87)',
      },
      secondary: {
        light: '#6B4D4D',
        main: '#4D2D2D', // Muted dark red
        dark: '#331A1A',
        contrastText: 'rgba(255,255,255,0.87)',
      },
      background: {
        paper: '#121212',
        default: '#000000',
      },
      error: {
        light: '#6B4D4D',
        main: '#4D2D2D',
        dark: '#331A1A',
        contrastText: 'rgba(255,255,255,0.87)',
      },
    },
    status: {
      danger: '#4D2D2D',
    },
    typography: {
      fontSize: 14,
    },
    accessibility: {
      type: 'lightSensitivity',
      name: 'Dark Mode',
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

  // 4. ENHANCED READABILITY THEMES

  // Large Text Mode
  largeTextMode: {
    palette: {
      mode: 'light',
      divider: '#e2e8f0',
      text: lightPaletteText,
      common: {
        black: 'rgb(17, 24, 39)',
        white: 'rgb(255, 255, 255)',
      },
      primary: {
        light: '#64748b',
        main: '#1e293b',
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
        paper: '#FFFFFF',
        default: '#F7F7F7',
      },
      error: {
        light: '#ffcdd2',
        main: '#f44336',
        dark: '#b71c1c',
      },
    },
    status: {
      danger: 'orange',
    },
    typography: {
      fontSize: 18, // Larger base font size
      h1: {
        fontSize: '2.5rem',
      },
      h2: {
        fontSize: '2.2rem',
      },
      h3: {
        fontSize: '2rem',
      },
      h4: {
        fontSize: '1.8rem',
      },
      h5: {
        fontSize: '1.6rem',
      },
      h6: {
        fontSize: '1.4rem',
      },
      body1: {
        fontSize: '1.2rem',
        lineHeight: 1.8,
      },
      body2: {
        fontSize: '1.1rem',
        lineHeight: 1.8,
      },
    },
    accessibility: {
      type: 'readability',
      name: 'Large Text',
    },
  },

  // Dyslexia-Friendly
  dyslexiaFriendly: {
    palette: {
      mode: 'light',
      divider: '#d0d0d0',
      text: {
        primary: '#333333',
        secondary: '#555555',
        disabled: '#777777',
      },
      common: {
        black: '#333333',
        white: '#FAFAFA',
      },
      primary: {
        light: '#5C7CFA',
        main: '#4263EB', // Blue
        dark: '#3B5BDB',
        contrastText: '#FFFFFF',
      },
      secondary: {
        light: '#FF8787',
        main: '#FA5252', // Red
        dark: '#E03131',
        contrastText: '#FFFFFF',
      },
      background: {
        paper: '#FAFAFA', // Off-white
        default: '#F0F0F0', // Light gray
      },
      error: {
        light: '#FF8787',
        main: '#FA5252',
        dark: '#E03131',
        contrastText: '#FFFFFF',
      },
    },
    status: {
      danger: '#FA5252',
    },
    typography: {
      fontFamily: '"Arial", "Helvetica", sans-serif', // More readable font
      fontSize: 16,
      fontWeightRegular: 400,
      fontWeightMedium: 500,
      fontWeightBold: 700,
      h1: {
        letterSpacing: '0.02em',
        lineHeight: 1.5,
      },
      h2: {
        letterSpacing: '0.02em',
        lineHeight: 1.5,
      },
      h3: {
        letterSpacing: '0.02em',
        lineHeight: 1.5,
      },
      h4: {
        letterSpacing: '0.02em',
        lineHeight: 1.5,
      },
      h5: {
        letterSpacing: '0.02em',
        lineHeight: 1.5,
      },
      h6: {
        letterSpacing: '0.02em',
        lineHeight: 1.5,
      },
      body1: {
        letterSpacing: '0.03em',
        lineHeight: 1.8,
      },
      body2: {
        letterSpacing: '0.03em',
        lineHeight: 1.8,
      },
    },
    accessibility: {
      type: 'readability',
      name: 'Dyslexia-Friendly',
    },
  },

  // Increased Spacing
  increasedSpacing: {
    palette: {
      mode: 'light',
      divider: '#e2e8f0',
      text: lightPaletteText,
      common: {
        black: 'rgb(17, 24, 39)',
        white: 'rgb(255, 255, 255)',
      },
      primary: {
        light: '#64748b',
        main: '#1e293b',
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
        paper: '#FFFFFF',
        default: '#F7F7F7',
      },
      error: {
        light: '#ffcdd2',
        main: '#f44336',
        dark: '#b71c1c',
      },
    },
    status: {
      danger: 'orange',
    },
    typography: {
      fontSize: 16,
      h1: {
        letterSpacing: '0.03em',
        lineHeight: 2,
      },
      h2: {
        letterSpacing: '0.03em',
        lineHeight: 2,
      },
      h3: {
        letterSpacing: '0.03em',
        lineHeight: 2,
      },
      h4: {
        letterSpacing: '0.03em',
        lineHeight: 2,
      },
      h5: {
        letterSpacing: '0.03em',
        lineHeight: 2,
      },
      h6: {
        letterSpacing: '0.03em',
        lineHeight: 2,
      },
      body1: {
        letterSpacing: '0.05em',
        lineHeight: 2,
        wordSpacing: '0.1em',
      },
      body2: {
        letterSpacing: '0.05em',
        lineHeight: 2,
        wordSpacing: '0.1em',
      },
    },
    accessibility: {
      type: 'readability',
      name: 'Increased Spacing',
    },
  }
};

export default themesConfig;