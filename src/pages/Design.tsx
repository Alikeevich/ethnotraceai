import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

const designSuggestions = [
  {
    title: 'Bio-Leather Phone Case',
    trend: '2026 Tech Accessories',
    materials: ['Bio-leather', 'Natural dyes'],
    description: 'Minimalist design for iPhone 17 with embossed traditional patterns',
  },
  {
    title: 'Eco-Friendly Tote Bag',
    trend: 'Sustainable Fashion',
    materials: ['Organic cotton', 'Plant-based dyes'],
    description: 'Large capacity bag with geometric ethnic motifs',
  },
  {
    title: 'Hemp Yoga Mat',
    trend: 'Wellness & Sustainability',
    materials: ['Hemp fiber', 'Natural rubber'],
    description: 'Non-slip surface with traditional mandala design',
  },
  {
    title: 'Wool Home Decor',
    trend: 'Artisan Interiors',
    materials: ['Organic wool', 'Natural pigments'],
    description: 'Wall hanging with contemporary ethnic fusion patterns',
  },
];

export default function Design() {
  return (
    <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
      <Box sx={{ textAlign: 'center', mb: 6 }}>
        <Typography
          variant="h3"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 700,
            fontSize: { xs: '2rem', md: '2.75rem' },
          }}
        >
          AI Design Generator
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            fontSize: '1.125rem',
            maxWidth: 700,
            mx: 'auto',
          }}
        >
          Get product suggestions based on 2026 global trends. AI generates patterns,
          instructions, and market insights tailored to your materials.
        </Typography>
      </Box>

      <Box sx={{ mb: 6 }}>
        <Card sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <AutoFixHighIcon sx={{ fontSize: 60, mb: 2 }} />
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
              Generate Custom Design
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
              Based on your scanned materials and current market trends
            </Typography>
            <Button
              variant="contained"
              size="large"
              sx={{
                bgcolor: 'background.paper',
                color: 'primary.main',
                textTransform: 'none',
                '&:hover': {
                  bgcolor: 'grey.100',
                },
              }}
            >
              Start Generation
            </Button>
          </CardContent>
        </Card>
      </Box>

      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
        Trending Design Suggestions
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 4 }}>
        {designSuggestions.map((design, index) => (
          <Box key={index}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                },
              }}
            >
              <CardMedia
                sx={{
                  height: 200,
                  bgcolor: 'grey.200',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <AutoFixHighIcon sx={{ fontSize: 60, color: 'text.secondary' }} />
              </CardMedia>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                  {design.title}
                </Typography>
                <Chip
                  label={design.trend}
                  size="small"
                  sx={{ mb: 2 }}
                  color="primary"
                />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {design.description}
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {design.materials.map((material, idx) => (
                    <Chip
                      key={idx}
                      label={material}
                      size="small"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>
    </Container>
  );
}
