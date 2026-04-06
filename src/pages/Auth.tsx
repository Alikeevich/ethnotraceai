import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { useAuth } from '../contexts/AuthContext';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, isLogin ? 'Мастер' : name);
      navigate('/dashboard'); // После входа кидаем сразу в дашборд
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#FAF8F5' }}>
      {/* Левая часть: Брендинг (скрыта на мобилках) */}
      <Box sx={{ flex: 1, display: { xs: 'none', md: 'flex' }, flexDirection: 'column', justifyContent: 'center', p: 8, bgcolor: 'primary.main', color: 'white', position: 'relative', overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', top: '-10%', left: '-10%', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(192, 107, 82, 0.15) 0%, rgba(255,255,255,0) 70%)', borderRadius: '50%' }} />
        
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 480 }}>
          <AutoAwesomeIcon sx={{ fontSize: 48, color: 'secondary.light', mb: 4 }} />
          <Typography variant="h2" sx={{ color: 'white', mb: 3 }}>
            Добро пожаловать в EthnoTrace.
          </Typography>
          <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.8)', fontSize: '1.1rem', mb: 4 }}>
            Присоединяйтесь к тысячам локальных мастеров, которые уже вывели свои уникальные изделия на глобальные рынки с помощью нейросетей.
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, backdropFilter: 'blur(10px)' }}>
            <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'secondary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <Typography variant="h6" color="white">A</Typography>
            </Box>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'white' }}>"С первой недели я продала сумку в США."</Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.6)' }}>Айгерим, ремесленница из Алматы</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Правая часть: Форма */}
      <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 4 }}>
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Typography variant="h3" sx={{ mb: 1, fontWeight: 800 }}>
            {isLogin ? 'С возвращением' : 'Создать магазин'}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {isLogin ? 'Войдите, чтобы управлять листингами.' : 'Откройте двери на глобальный рынок за пару кликов.'}
          </Typography>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <TextField fullWidth label="Имя / Название бренда" variant="outlined" sx={{ mb: 3 }} required value={name} onChange={(e) => setName(e.target.value)} />
            )}
            
            <TextField fullWidth label="Email адрес" type="email" variant="outlined" sx={{ mb: 3 }} required value={email} onChange={(e) => setEmail(e.target.value)} />
            
            <TextField fullWidth label="Пароль" type="password" variant="outlined" sx={{ mb: 4 }} required />

            <Button fullWidth type="submit" variant="contained" size="large" disabled={loading} sx={{ py: 1.5, mb: 3, fontSize: '1.1rem' }}>
              {loading ? <CircularProgress size={24} color="inherit" /> : (isLogin ? 'Войти в кабинет' : 'Зарегистрироваться')}
            </Button>
          </form>

          <Typography variant="body2" align="center" color="text.secondary">
            {isLogin ? 'Нет аккаунта? ' : 'Уже есть магазин? '}
            <Button variant="text" onClick={() => setIsLogin(!isLogin)} sx={{ p: 0, minWidth: 'auto', color: 'primary.main', fontWeight: 700, '&:hover': { bgcolor: 'transparent', textDecoration: 'underline' } }}>
              {isLogin ? 'Создать' : 'Войти'}
            </Button>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}