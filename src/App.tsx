import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import theme from './theme';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Scanner from './pages/Scanner';
import Dashboard from './pages/Dashboard';
import Auth from './pages/Auth';
import Tutorial from './pages/Tutorial';
import Design from './pages/Design';
import ESG from './pages/ESG';
import { AuthProvider } from './contexts/AuthContext';
import { initWeeklyTrends } from './lib/weeklyScheduler';

function Layout() {
  const location = useLocation();
  const isAuthPage = location.pathname === '/auth';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {!isAuthPage && <Navigation />}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/tutorial" element={<Tutorial />} />
          <Route path="/design" element={<Design />} />
          <Route path="/esg" element={<ESG />} />
        </Routes>
      </Box>
    </Box>
  );
}

function App() {
  useEffect(() => {
    // Запускаем еженедельные тренды при старте приложения
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY as string || '';
    initWeeklyTrends(geminiKey);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Layout />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;