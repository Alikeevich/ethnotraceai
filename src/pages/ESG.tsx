import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import LinearProgress from '@mui/material/LinearProgress';
import NatureIcon from '@mui/icons-material/Nature';
import CloudIcon from '@mui/icons-material/Cloud';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import RecyclingIcon from '@mui/icons-material/Recycling';
import VerifiedIcon from '@mui/icons-material/Verified';

const metrics =[
  {
    icon: CloudIcon,
    label: 'Углеродный след',
    value: '2.4 кг CO₂',
    status: 'Низкое воздействие',
    progress: 25,
    color: 'success',
  },
  {
    icon: WaterDropIcon,
    label: 'Использование воды',
    value: '18 литров',
    status: 'Отлично',
    progress: 15,
    color: 'info',
  },
  {
    icon: RecyclingIcon,
    label: 'Снижение отходов',
    value: '92%',
    status: 'Выдающийся',
    progress: 92,
    color: 'success',
  },
  {
    icon: NatureIcon,
    label: 'Индекс эко-устойчивости',
    value: '94/100',
    status: 'Премиум',
    progress: 94,
    color: 'success',
  },
];

export default function ESG() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800, fontSize: { xs: '2rem', md: '2.75rem' } }}>
          ESG Трекинг и Сертификация
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ fontSize: '1.125rem', maxWidth: 700, mx: 'auto' }}>
          Автоматически отслеживайте воздействие на экологию, генерируйте отчеты об устойчивом развитии и получайте верифицированные ESG сертификаты для продажи товаров с премиальной наценкой.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 4, mb: 6 }}>
        {metrics.map((metric, index) => (
          <Box key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: `${metric.color}.main`, color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                  <metric.icon sx={{ fontSize: 28 }} />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>{metric.label}</Typography>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>{metric.value}</Typography>
                <LinearProgress variant="determinate" value={metric.progress} color={metric.color as 'success' | 'info'} sx={{ mb: 1, height: 8, borderRadius: 1 }} />
                <Typography variant="caption" color={`${metric.color}.main`}>{metric.status}</Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 4 }}>
        <Box>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <VerifiedIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600 }}>ESG Сертификация</Typography>
              </Box>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Ваши товары соответствуют высочайшим стандартам экологического, социального и корпоративного управления (ESG). Это открывает доступ к осознанным покупателям в США и Европе.
              </Typography>
              <Box sx={{ p: 3, bgcolor: 'success.main', color: 'white', borderRadius: 2, textAlign: 'center' }}>
                <Typography variant="h3" sx={{ fontWeight: 800 }}>+40%</Typography>
                <Typography variant="body1">Потенциал премиальной наценки</Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>Автоматизированная отчетность</Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Генерация отчетов, соответствующих требованиям для:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  'Глобальных маркетплейсов (Etsy, Amazon)',
                  'Корпоративных покупателей и B2B брендов',
                  'ESG Инвестиционных фондов',
                  'Государственных регуляторов и таможни',
                  'Организаций Fair Trade (Справедливая торговля)',
                ].map((item, index) => (
                  <Box key={index} sx={{ p: 2, bgcolor: '#FAF8F5', borderRadius: 1, borderLeft: 4, borderColor: 'primary.main' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>{item}</Typography>
                  </Box>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Container>
  );
}