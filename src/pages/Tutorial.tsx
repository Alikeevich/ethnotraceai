import { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import Button from '@mui/material/Button';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const steps = [
  { label: 'Регистрация магазина', description: `Подключите ваши магазины через "Кабинет селлера". Для Etsy/Amazon потребуется пройти верификацию.` },
  { label: 'Создание контента', description: 'Сделайте качественные фото. Идеально: 1 главное фото на белом/светлом фоне, 3-4 макро-фото текстуры, 1 фото изделия в жизни (в интерьере/на человеке).' },
  { label: 'AI Интегратор', description: `Загрузите фото. ИИ сам проанализирует рынок, сформирует цену с учетом ручной работы и подготовит SEO-описание.` },
  { label: 'Публикация', description: `Проверьте данные и нажмите "Опубликовать". Товар появится в черновиках вашего маркетплейса.` },
];

export default function Tutorial() {
  const [activeStep, setActiveStep] = useState(0);
  const [marketTab, setMarketTab] = useState(0);

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Box sx={{ mb: 6, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800 }}>База Знаний EthnoTrace</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>Узнайте, как правильно оцифровать свои изделия и работать с алгоритмами мировых маркетплейсов.</Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 6, mb: 8 }}>
        <Box>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>С чего начать?</Typography>
          <Stepper activeStep={activeStep} orientation="vertical">
            {steps.map((step, index) => (
              <Step key={step.label}>
                <StepLabel><Typography variant="h6">{step.label}</Typography></StepLabel>
                <StepContent>
                  <Typography sx={{ mb: 2, color: 'text.secondary' }}>{step.description}</Typography>
                  <Box sx={{ mb: 2 }}>
                    <Button variant="contained" onClick={() => setActiveStep((p) => p + 1)} sx={{ mt: 1, mr: 1 }}>{index === steps.length - 1 ? 'Завершить' : 'Далее'}</Button>
                    <Button disabled={index === 0} onClick={() => setActiveStep((p) => p - 1)} sx={{ mt: 1, mr: 1 }}>Назад</Button>
                  </Box>
                </StepContent>
              </Step>
            ))}
          </Stepper>
        </Box>

        <Box>
          <Typography variant="h4" sx={{ mb: 4, fontWeight: 700 }}>Специфика площадок (Реалии 2024-2025)</Typography>
          <Card sx={{ border: '1px solid #E5E0D8', boxShadow: 'none' }}>
            <Tabs value={marketTab} onChange={(_, v) => setMarketTab(v)} variant="fullWidth" sx={{ borderBottom: '1px solid #E5E0D8' }}>
              <Tab label="Etsy" />
              <Tab label="Amazon" />
              <Tab label="Wildberries" />
              <Tab label="Ozon" />
            </Tabs>
            <CardContent sx={{ minHeight: 300 }}>
              
              {marketTab === 0 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Алгоритмы Etsy</Typography>
                  <Typography variant="body2" paragraph>• <b>Long-tail keywords:</b> Заголовки должны состоять из точных фраз (не "Bag", а "Handmade Wool Tote Bag Boho Style").</Typography>
                  <Typography variant="body2" paragraph>• <b>Etsy Search:</b> Платформа активно продвигает товары с бесплатной доставкой по США (гарантия фри-шипа от $35).</Typography>
                  <Typography variant="body2" paragraph>• <b>Видео:</b> Карточки с короткими видео (даже просто прокрутка товара в руках) получают на 30% больше показов.</Typography>
                  <Button variant="text" size="small" endIcon={<OpenInNewIcon />} href="https://www.etsy.com/seller-handbook" target="_blank" sx={{ mt: 1 }}>Официальный Etsy Seller Handbook</Button>
                </Box>
              )}

              {marketTab === 1 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Amazon Handmade</Typography>
                  <Typography variant="body2" paragraph>• <b>Строгий аудит:</b> Вам нужно доказать, что товар сделан вручную (записывайте видео процесса!).</Typography>
                  <Typography variant="body2" paragraph>• <b>A+ Content:</b> Обязательно используйте расширенное описание с картинками, именно туда нужно вставлять наши ESG метрики.</Typography>
                  <Typography variant="body2" paragraph>• <b>FBA vs FBM:</b> Для старта отправляйте товары сами (FBM), но для топа нужно отправлять партии на склады Amazon (FBA).</Typography>
                  <Button variant="text" size="small" endIcon={<OpenInNewIcon />} href="https://sell.amazon.com/programs/handmade" target="_blank" sx={{ mt: 1 }}>Гайд Amazon Handmade</Button>
                </Box>
              )}

              {marketTab === 2 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Wildberries</Typography>
                  <Typography variant="body2" paragraph>• <b>Автореклама (АРК):</b> Сейчас органика почти не работает без запуска авторекламы. Заложите 10-15% цены на продвижение.</Typography>
                  <Typography variant="body2" paragraph>• <b>Рич-контент:</b> Визуальное оформление решает 80% продаж. Делайте инфографику на главном фото (здесь отлично зайдут эко-плашки).</Typography>
                  <Typography variant="body2" paragraph>• <b>Индексация:</b> Алгоритм ищет слова из характеристик, наш ИИ заполняет их максимально плотно.</Typography>
                  <Button variant="text" size="small" endIcon={<OpenInNewIcon />} href="https://seller.wildberries.ru/edu" target="_blank" sx={{ mt: 1 }}>Портал WB Partners</Button>
                </Box>
              )}

              {marketTab === 3 && (
                <Box>
                  <Typography variant="h6" gutterBottom>Ozon (в т.ч. Global)</Typography>
                  <Typography variant="body2" paragraph>• <b>Контент-рейтинг:</b> Ozon дает буст товарам с контент-рейтингом 100. Наш ИИ генерирует все нужные поля для этого.</Typography>
                  <Typography variant="body2" paragraph>• <b>Видеообложки:</b> Они бесплатны и сильно повышают CTR (кликабельность).</Typography>
                  <Typography variant="body2" paragraph>• <b>Трафареты:</b> Основной инструмент рекламы. Начинайте с оплаты за клики, а не за показы.</Typography>
                  <Button variant="text" size="small" endIcon={<OpenInNewIcon />} href="https://seller-edu.ozon.ru/" target="_blank" sx={{ mt: 1 }}>Ozon University</Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* FAQ */}
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        <Typography variant="h4" sx={{ mb: 4, fontWeight: 700, textAlign: 'center' }}>Частые вопросы (FAQ)</Typography>
        <Accordion sx={{ mb: 1, border: '1px solid #E5E0D8', borderRadius: '8px !important', boxShadow: 'none', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography sx={{ fontWeight: 600 }}>Откуда ИИ берет рыночные цены?</Typography></AccordionSummary>
          <AccordionDetails><Typography color="text.secondary">Перед генерацией описания платформа парсит средние цены аналогичных товаров на выбранном маркетплейсе (API Scraping). Затем ИИ оценивает качество ВАШЕЙ работы по фото и добавляет премиальную наценку (Handmade Premium).</Typography></AccordionDetails>
        </Accordion>
        <Accordion sx={{ mb: 1, border: '1px solid #E5E0D8', borderRadius: '8px !important', boxShadow: 'none', '&:before': { display: 'none' } }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}><Typography sx={{ fontWeight: 600 }}>Куда вставлять экономию CO2 и воды?</Typography></AccordionSummary>
          <AccordionDetails><Typography color="text.secondary">Платформы пока не имеют отдельных полей для ESG-метрик. Мы рекомендуем: <b>1)</b> Добавлять их на второе фото в виде красивой инфографики. <b>2)</b> Вставлять абзац с этими цифрами в самый низ текстового описания (Description) как доказательство вашей экологичности.</Typography></AccordionDetails>
        </Accordion>
      </Box>
    </Container>
  );
}