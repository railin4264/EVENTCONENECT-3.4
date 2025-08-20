import { createGlobalStyle } from 'styled-components';

export const theme = {
  colors: {
    primary: '#6366f1',
    primaryDark: '#4f46e5',
    secondary: '#f59e0b',
    secondaryDark: '#d97706',
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    dark: '#1f2937',
    light: '#f9fafb',
    white: '#ffffff',
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827',
    },
  },
  fonts: {
    primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif",
    secondary: "'Poppins', sans-serif",
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
  fontWeights: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  spacing: {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
    56: '14rem',
    64: '16rem',
  },
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  },
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },
};

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    font-size: 16px;
    scroll-behavior: smooth;
  }

  body {
    font-family: ${theme.fonts.primary};
    font-size: ${theme.fontSizes.base};
    line-height: 1.6;
    color: ${theme.colors.dark};
    background-color: ${theme.colors.light};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: ${theme.fonts.secondary};
    font-weight: ${theme.fontWeights.bold};
    line-height: 1.2;
    margin-bottom: ${theme.spacing[4]};
  }

  h1 {
    font-size: ${theme.fontSizes['4xl']};
  }

  h2 {
    font-size: ${theme.fontSizes['3xl']};
  }

  h3 {
    font-size: ${theme.fontSizes['2xl']};
  }

  h4 {
    font-size: ${theme.fontSizes.xl};
  }

  h5 {
    font-size: ${theme.fontSizes.lg};
  }

  h6 {
    font-size: ${theme.fontSizes.base};
  }

  p {
    margin-bottom: ${theme.spacing[4]};
  }

  a {
    color: ${theme.colors.primary};
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: ${theme.colors.primaryDark};
    }
  }

  button {
    font-family: inherit;
    cursor: pointer;
    border: none;
    outline: none;
    transition: all 0.2s ease;
  }

  input, textarea, select {
    font-family: inherit;
    border: 1px solid ${theme.colors.gray[300]};
    border-radius: ${theme.borderRadius.md};
    padding: ${theme.spacing[3]} ${theme.spacing[4]};
    font-size: ${theme.fontSizes.base};
    transition: border-color 0.2s ease, box-shadow 0.2s ease;

    &:focus {
      outline: none;
      border-color: ${theme.colors.primary};
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }
  }

  img {
    max-width: 100%;
    height: auto;
  }

  ul, ol {
    list-style: none;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 ${theme.spacing[4]};
  }

  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing[3]} ${theme.spacing[6]};
    border-radius: ${theme.borderRadius.lg};
    font-weight: ${theme.fontWeights.medium};
    font-size: ${theme.fontSizes.base};
    transition: all 0.2s ease;
    cursor: pointer;
    border: none;
    outline: none;

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &.btn-primary {
      background-color: ${theme.colors.primary};
      color: ${theme.colors.white};

      &:hover:not(:disabled) {
        background-color: ${theme.colors.primaryDark};
      }
    }

    &.btn-secondary {
      background-color: ${theme.colors.secondary};
      color: ${theme.colors.white};

      &:hover:not(:disabled) {
        background-color: ${theme.colors.secondaryDark};
      }
    }

    &.btn-outline {
      background-color: transparent;
      color: ${theme.colors.primary};
      border: 2px solid ${theme.colors.primary};

      &:hover:not(:disabled) {
        background-color: ${theme.colors.primary};
        color: ${theme.colors.white};
      }
    }

    &.btn-ghost {
      background-color: transparent;
      color: ${theme.colors.primary};

      &:hover:not(:disabled) {
        background-color: ${theme.colors.gray[100]};
      }
    }
  }

  .card {
    background-color: ${theme.colors.white};
    border-radius: ${theme.borderRadius.xl};
    box-shadow: ${theme.shadows.md};
    padding: ${theme.spacing[6]};
    transition: box-shadow 0.2s ease;

    &:hover {
      box-shadow: ${theme.shadows.lg};
    }
  }

  .loading {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: ${theme.spacing[8]};
  }

  .error {
    color: ${theme.colors.error};
    background-color: rgba(239, 68, 68, 0.1);
    border: 1px solid ${theme.colors.error};
    border-radius: ${theme.borderRadius.md};
    padding: ${theme.spacing[4]};
    margin: ${theme.spacing[4]} 0;
  }

  .success {
    color: ${theme.colors.success};
    background-color: rgba(16, 185, 129, 0.1);
    border: 1px solid ${theme.colors.success};
    border-radius: ${theme.borderRadius.md};
    padding: ${theme.spacing[4]};
    margin: ${theme.spacing[4]} 0;
  }

  @media (max-width: ${theme.breakpoints.md}) {
    .container {
      padding: 0 ${theme.spacing[3]};
    }

    h1 {
      font-size: ${theme.fontSizes['3xl']};
    }

    h2 {
      font-size: ${theme.fontSizes['2xl']};
    }

    h3 {
      font-size: ${theme.fontSizes.xl};
    }
  }
`; 