import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2C3E35', // Приглушенный хвойный
      light: '#425A4E',
      dark: '#1B2620',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#C06B52', // Терракота
      light: '#D48670',
      dark: '#9A503A',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FAF8F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#111111', // Сделали текст темнее для лучшей читаемости
      secondary: '#555555',
    },
    divider: '#E5E0D8',
  },
  typography: {
    fontFamily: '"Manrope", sans-serif',
    h1: { fontWeight: 800, letterSpacing: '-0.02em', color: '#111111' },
    h2: { fontWeight: 700, letterSpacing: '-0.01em', color: '#111111' },
    h3: { fontWeight: 700, color: '#111111' },
    h4: { fontWeight: 600, color: '#111111' },
    h5: { fontWeight: 600, color: '#111111' },
    h6: { fontWeight: 600, color: '#111111' },
    body1: { fontSize: '1.125rem', lineHeight: 1.6 }, // Увеличили базовый текст
    body2: { fontSize: '1rem', lineHeight: 1.6 },
    button: {
      fontWeight: 600,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: '#FAF8F5',
          WebkitFontSmoothing: 'antialiased',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF', // Гарантирует белый фон
          boxShadow: 'none',
          border: '1px solid #E5E0D8',
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          padding: '12px 28px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
        containedPrimary: {
          backgroundColor: '#2C3E35',
          color: '#FFFFFF', // <--- ЖЕСТКО ЗАДАЕМ БЕЛЫЙ ЦВЕТ ТЕКСТА
          '&:hover': {
            backgroundColor: '#1B2620',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FAF8F5',
          borderBottom: '1px solid #E5E0D8',
          boxShadow: 'none',
          color: '#111111',
        },
      },
    },
  },
});

export default theme;