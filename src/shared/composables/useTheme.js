import { computed } from 'vue'

export function useTheme() {
  const theme = computed(() => ({
    colors: {
      primary: '#4f8cff',
      primaryDark: '#3a3d5c',
      primaryLight: '#a7c7ff',
      accent: '#ff6bcb',
      accentDark: '#c850c0',
      secondary: '#e9effc',
      secondaryDark: '#b3b8c5',
      success: '#4caf50',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196f3',
      background: '#f4f7fa',
      backgroundSecondary: '#e9effc',
      surface: '#fff',
      surfaceDark: '#f5f7fa',
      overlay: 'rgba(79, 140, 255, 0.08)',
      glass: 'rgba(255,255,255,0.7)',
      shadow: '0 4px 24px rgba(79, 140, 255, 0.08)'
    },
    textColors: {
      primary: '#222b45',
      secondary: '#6b6b6b',
      inverted: '#fff',
      accent: '#4f8cff'
    },
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '2rem',
      xl: '3rem'
    },
    borderRadius: {
      sm: '8px',
      base: '16px',
      lg: '32px'
    },
    fontSize: {
      sm: '14px',
      base: '16px',
      lg: '18px'
    },
    fontWeight: {
      regular: '400',
      bold: '700'
    },
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    borderColor: '#e0e7ef',
    boxShadow: '0 4px 24px rgba(79, 140, 255, 0.08)'
  }))

  return {
    theme
  }
} 