import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

export default function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };

  return (
    <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#FAF8F5', borderBottom: '1px solid #E5E0D8', zIndex: 10 }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ minHeight: '70px !important' }}>
          
          <Box component={RouterLink} to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'primary.main', mr: 6 }}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.5px' }}>
              EthnoTrace
            </Typography>
          </Box>

          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3, flexGrow: 1 }}>
            <Box component={RouterLink} to="/" sx={{ color: 'text.secondary', textDecoration: 'none', fontWeight: 600, '&:hover': { color: 'primary.main' } }}>Главная</Box>
            <Box component={RouterLink} to="/scanner" sx={{ color: 'text.secondary', textDecoration: 'none', fontWeight: 600, '&:hover': { color: 'primary.main' } }}>Добавить товар</Box>
            <Box component={RouterLink} to="/esg" sx={{ color: 'text.secondary', textDecoration: 'none', fontWeight: 600, '&:hover': { color: 'primary.main' } }}>Эко-паспорт</Box>
            <Box component={RouterLink} to="/tutorial" sx={{ color: 'text.secondary', textDecoration: 'none', fontWeight: 600, '&:hover': { color: 'primary.main' } }}>Как это работает</Box>

            {user && (
              <Box component={RouterLink} to="/dashboard" sx={{ color: 'text.secondary', textDecoration: 'none', fontWeight: 600, '&:hover': { color: 'primary.main' } }}>Мой магазин</Box>
            )}
          </Box>

          <Box>
            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Button onClick={handleMenu} sx={{ color: 'text.primary', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AccountCircleIcon color="primary" />
                  {user.name}
                </Button>
                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose} PaperProps={{ sx: { mt: 1, borderRadius: 2, border: '1px solid #E5E0D8', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' } }}>
                  <MenuItem component={RouterLink} to="/dashboard" onClick={handleClose}>Кабинет селлера</MenuItem>
                  <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>Выйти</MenuItem>
                </Menu>
              </Box>
            ) : (
              <Button variant="contained" color="primary" component={RouterLink} to="/auth">
                Войти в систему
              </Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}