import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ParkIcon from '@mui/icons-material/Park';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export default function Home() {
  return (
    <Box sx={{ overflowX: 'hidden' }}>
      
      {/* Hero Section */}
      <Box sx={{ pt: { xs: 8, md: 12 }, pb: { xs: 8, md: 10 } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 6, alignItems: 'center' }}>
            
            {/* Левая часть: Текст */}
            <Box sx={{ flex: 1 }}>
              <Typography variant="overline" sx={{ color: 'secondary.main', fontWeight: 700, letterSpacing: '0.1em', mb: 2, display: 'block' }}>
                ДЛЯ МАСТЕРОВ И РЕМЕСЛЕННИКОВ
              </Typography>
              <Typography variant="h1" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, lineHeight: 1.1, mb: 4 }}>
                Сделано руками. <br />
                <Box component="span" sx={{ color: 'primary.main' }}>Продано по всему миру.</Box>
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary', mb: 5, maxWidth: 540 }}>
                Хватит продавать за бесценок в соцсетях. Мы поможем легко выйти на рынки США и Европы: наш умный помощник сам напишет текст на английском, красиво оформит товар и поможет продать его дороже.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button variant="contained" size="large" component={RouterLink} to="/scanner" endIcon={<ArrowForwardIcon />}>
                  Оформить товар
                </Button>
                <Button variant="outlined" size="large" component={RouterLink} to="/dashboard" sx={{ borderColor: 'divider', color: 'text.primary', '&:hover': { borderColor: 'primary.main', bgcolor: 'transparent' } }}>
                  Посмотреть как это работает
                </Button>
              </Box>
            </Box>

            {/* Правая часть: UI-блок (Исправлены черные шрифты) */}
            <Box sx={{ flex: 1, width: '100%' }}>
              <Box sx={{ bgcolor: 'primary.main', p: 4, borderRadius: 4, position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(44, 62, 53, 0.15)' }}>
                {/* Декоративный круг */}
                <Box sx={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: '50%' }} />
                
                <Typography variant="caption" sx={{ opacity: 0.7, mb: 1, display: 'block', color: 'white' }}>Описание готово</Typography>
                <Typography variant="h5" sx={{ mb: 3, color: 'white' }}>Handmade Wool Tote Bag</Typography>

                <Box sx={{ bgcolor: 'rgba(255,255,255,0.1)', p: 2, borderRadius: 2, mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography variant="body2" sx={{ color: 'white' }}>Текст на идеальном английском</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography variant="body2" sx={{ color: 'white' }}>Добавлен паспорт экологичности</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CheckCircleIcon color="success" fontSize="small" />
                    <Typography variant="body2" sx={{ color: 'white' }}>Подобраны слова для поиска</Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <Box>
                    <Typography variant="caption" sx={{ opacity: 0.7, color: 'white' }}>Рекомендуемая цена (США)</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'secondary.light' }}>$85.00</Typography>
                  </Box>
                  <Button variant="contained" sx={{ bgcolor: 'white', color: 'primary.dark', '&:hover': { bgcolor: '#f0f0f0' } }}>
                    Опубликовать
                  </Button>
                </Box>
              </Box>
            </Box>

          </Box>
        </Container>
      </Box>

      {/* Блок с конверсионными цифрами (Исправлены черные шрифты) */}
      <Box sx={{ bgcolor: 'primary.main', py: { xs: 6, md: 8 }, mb: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, 
            gap: { xs: 4, md: 3 }, 
            textAlign: 'center' 
          }}>
            <Box>
              <Typography variant="h2" sx={{ color: 'secondary.light', mb: 1 }}>+40%</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, maxWidth: 200, mx: 'auto', color: 'white' }}>Можно прибавить к цене за ручную работу</Typography>
            </Box>
            <Box>
              <Typography variant="h2" sx={{ color: 'secondary.light', mb: 1 }}>2 мин</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, maxWidth: 200, mx: 'auto', color: 'white' }}>На создание красивого описания для товара</Typography>
            </Box>
            <Box>
              <Typography variant="h2" sx={{ color: 'secondary.light', mb: 1 }}>24/7</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, maxWidth: 200, mx: 'auto', color: 'white' }}>Умный чат-бот отвечает клиентам, пока вы спите</Typography>
            </Box>
            <Box>
              <Typography variant="h2" sx={{ color: 'secondary.light', mb: 1 }}>Без</Typography>
              <Typography variant="body2" sx={{ opacity: 0.9, maxWidth: 200, mx: 'auto', color: 'white' }}>Знания английского и навыков продаж</Typography>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Инструменты */}
      <Container maxWidth="lg" sx={{ pb: { xs: 10, md: 16 } }}>
        <Box sx={{ mb: 6, maxWidth: 700 }}>
          <Typography variant="h2" sx={{ mb: 3 }}>
            Как мы упрощаем ваши продажи
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Мы сделали сложные технологии простыми, чтобы вы занимались творчеством, а не рутиной.
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 4 }}>

          <Card sx={{ p: 4, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(44, 62, 53, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <AutoFixHighIcon sx={{ color: 'primary.main' }} />
            </Box>
            <Typography variant="h5" sx={{ mb: 2 }}>Умное описание</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
              Просто загрузите фото. Система сама поймет, из чего сделана вещь, и напишет красивый продающий текст на английском для Etsy и Amazon.
            </Typography>
          </Card>

          <Card sx={{ p: 4, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(192, 107, 82, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <ParkIcon sx={{ color: 'secondary.main' }} />
            </Box>
            <Typography variant="h5" sx={{ mb: 2 }}>Наценка за экологичность</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
              Иностранцы ценят природу. Мы выделим натуральные материалы и создадим "эко-паспорт", чтобы покупатели с радостью платили вам больше.
            </Typography>
          </Card>

          <Card sx={{ p: 4, display: 'flex', flexDirection: 'column', bgcolor: 'background.paper' }}>
            <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'rgba(44, 62, 53, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
              <ChatBubbleOutlineIcon sx={{ color: 'primary.main' }} />
            </Box>
            <Typography variant="h5" sx={{ mb: 2 }}>Помощник в чате 24/7</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
              Больше не нужно терять клиентов из-за разницы во времени. Наш помощник сам ответит на вопросы по размерам на языке покупателя.
            </Typography>
          </Card>

        </Box>
      </Container>
    </Box>
  );
}