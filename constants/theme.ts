export const Theme = {
  colors: {
    // Base colors
    black: '#000000',
    darkGray: '#121212',
    gray: '#1E1E1E',
    lightGray: '#282828',
    highlightGray: '#535353',
    white: '#FFFFFF',
    green: '#1DB954',
    greenHover: '#1ED760',
    blue: '#509BF5',
    lightText: '#B3B3B3',
    disabledText: '#727272',

    // Semantic colors
    primary: '#1DB954',
    primaryHover: '#1ED760',
    secondary: '#509BF5',
    success: '#1DB954',
    warning: '#FFB800',
    error: '#E91429',
    
    // UI colors
    background: {
      main: '#121212',
      light: '#1E1E1E',
      card: '#282828',
      hover: '#535353',
    },
    text: {
      primary: '#FFFFFF',
      secondary: '#B3B3B3',
      disabled: '#727272',
      light: '#FFFFFF',
    },
    border: '#282828',
    shadow: '#000000',
    overlay: 'rgba(0, 0, 0, 0.7)',
  },
  
  spacing: {
    xs: 4,
    sm: 8,  
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
  },
    
  fontSizes: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },
  
  shadows: {
    small: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 4,
    },
    large: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.2,
      shadowRadius: 16,
      elevation: 8,
    },
  },
  
  transitions: {
    fast: '0.2s ease',
    normal: '0.3s ease',
    slow: '0.5s ease',
  },
};