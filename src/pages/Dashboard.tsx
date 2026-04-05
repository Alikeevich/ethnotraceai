import { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import CircularProgress from '@mui/material/CircularProgress';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Alert from '@mui/material/Alert';
import LinearProgress from '@mui/material/LinearProgress';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Avatar from '@mui/material/Avatar';
import Snackbar from '@mui/material/Snackbar';
import LanguageIcon from '@mui/icons-material/Language';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PublishIcon from '@mui/icons-material/Publish';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import SendIcon from '@mui/icons-material/Send';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import PolicyIcon from '@mui/icons-material/Policy';
import InventoryIcon from '@mui/icons-material/Inventory';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import TelegramIcon from '@mui/icons-material/Telegram';
import { useAuth } from '../contexts/AuthContext';
import { getListings, getStats, updateListingStatus, deleteListing, type SavedListing } from '../lib/storage';
import { notifyNewOrder, notifyBuyerQuestion, isConnected as tgConnected } from '../lib/telegram';
import TelegramSetup from '../components/TelegramSetup';

// ================================================================
// АВТООТВЕТЧИК
// ================================================================
const BUYER_QUESTIONS = [
  'Is this really handmade? How long did it take to make?',
  'Can you ship to Germany? How much will it cost?',
  'What materials did you use? Are they natural/organic?',
  'Do you make custom sizes or colors?',
  'Is this eco-friendly? I care about sustainability.',
];

interface ChatMessage {
  role: 'buyer' | 'bot';
  text: string;
}

function AutoResponder({ apiKey }: { apiKey: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [customQuestion, setCustomQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [botEnabled, setBotEnabled] = useState(true);
  const [totalSaved, setTotalSaved] = useState(142);

  const sendQuestion = useCallback(async (question: string) => {
    if (!question.trim() || loading) return;

    setMessages(prev => [...prev, { role: 'buyer', text: question }]);
    setLoading(true);
    setCustomQuestion('');

    try {
      const key = apiKey || (import.meta.env.VITE_GEMINI_API_KEY as string);
      if (!key) throw new Error('no key');

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an AI sales assistant for EthnoTrace, representing a Kazakh artisan who makes handmade products.
Your name is "Aisha Bot". You speak perfect English and represent the artisan.
Answer buyer questions warmly, professionally. Emphasize: handmade quality, natural materials, Kazakhstan origin, sustainability.
Keep replies under 80 words. Be friendly and helpful.
If asked about shipping: "Worldwide shipping available, 7-14 days to Europe/US, we send tracking."

Buyer asks: "${question}"

Reply:`,
              }],
            }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
          }),
        }
      );
      const data = await res.json();
      const botText: string = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      setMessages(prev => [...prev, { role: 'bot', text: botText.trim() }]);
      setTotalSaved(prev => prev + 1);

      // Telegram уведомление о вопросе покупателя
      if (tgConnected()) {
        notifyBuyerQuestion({
          question,
          marketplace: 'Etsy',
          productName: 'Ваш товар',
        });
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: 'bot',
          text: "Thank you for your interest! This piece is 100% handmade with natural materials from Kazakhstan. Please share your email and I'll send full details! 🌿",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [apiKey, loading]);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <SmartToyIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>AI Автоответчик</Typography>
            <Typography variant="body2" color="text.secondary">Отвечает на Etsy, Amazon, WB за вас</Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color={botEnabled ? 'success.main' : 'text.secondary'} sx={{ fontWeight: 600 }}>
            {botEnabled ? 'Активен' : 'Выключен'}
          </Typography>
          <Switch checked={botEnabled} onChange={(_, v) => setBotEnabled(v)} color="success" />
        </Box>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 3 }}>
        <Box sx={{ p: 2, bgcolor: 'primary.main', borderRadius: 2, textAlign: 'center', color: 'white' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'secondary.light' }}>{totalSaved}</Typography>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>Диалогов обработано</Typography>
        </Box>
        <Box sx={{ p: 2, bgcolor: '#F3F4F6', borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>24ч</Typography>
          <Typography variant="caption" color="text.secondary">Сэкономлено времени</Typography>
        </Box>
        <Box sx={{ p: 2, bgcolor: '#F3F4F6', borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'success.main' }}>~$340</Typography>
          <Typography variant="caption" color="text.secondary">Продаж через бота</Typography>
        </Box>
      </Box>

      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', bgcolor: '#FAF8F5' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', color: 'text.secondary' }}>
              Симулятор покупателя — Демо
            </Typography>
          </Box>

          <Box sx={{ p: 2, minHeight: 280, maxHeight: 400, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {messages.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4, opacity: 0.4 }}>
                <SmartToyIcon sx={{ fontSize: 40, mb: 1 }} />
                <Typography variant="body2">Выберите вопрос покупателя ниже</Typography>
              </Box>
            )}
            {messages.map((msg, i) => (
              <Box key={i} sx={{ display: 'flex', justifyContent: msg.role === 'buyer' ? 'flex-end' : 'flex-start', gap: 1, alignItems: 'flex-start' }}>
                {msg.role === 'bot' && (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>AI</Avatar>
                )}
                <Box sx={{
                  maxWidth: '80%', p: 1.5,
                  borderRadius: msg.role === 'buyer' ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
                  bgcolor: msg.role === 'buyer' ? 'primary.main' : '#F3F4F6',
                  color: msg.role === 'buyer' ? 'white' : 'text.primary',
                }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.5 }}>{msg.text}</Typography>
                </Box>
                {msg.role === 'buyer' && (
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'grey.300', fontSize: 12 }}>B</Avatar>
                )}
              </Box>
            ))}
            {loading && (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: 14 }}>AI</Avatar>
                <Box sx={{ p: 1.5, borderRadius: '12px 12px 12px 4px', bgcolor: '#F3F4F6' }}>
                  <CircularProgress size={16} />
                </Box>
              </Box>
            )}
          </Box>

          <Divider />

          <Box sx={{ p: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 600 }}>
              Частые вопросы покупателей:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {BUYER_QUESTIONS.map((q, i) => (
                <Chip
                  key={i}
                  label={q.length > 40 ? q.slice(0, 38) + '…' : q}
                  size="small"
                  onClick={() => sendQuestion(q)}
                  disabled={loading || !botEnabled}
                  sx={{ cursor: 'pointer', fontSize: '0.7rem' }}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <TextField
                fullWidth size="small"
                placeholder="Введите вопрос на английском..."
                value={customQuestion}
                onChange={e => setCustomQuestion(e.target.value)}
                disabled={loading || !botEnabled}
                onKeyDown={e => { if (e.key === 'Enter') sendQuestion(customQuestion); }}
              />
              <IconButton color="primary" onClick={() => sendQuestion(customQuestion)} disabled={loading || !botEnabled || !customQuestion.trim()}>
                <SendIcon />
              </IconButton>
            </Box>
          </Box>
        </CardContent>
      </Card>

      <Alert severity="info" sx={{ borderRadius: 2 }}>
        <Typography variant="body2">
          <b>В реальной работе:</b> после подключения маркетплейса через OAuth — бот автоматически отвечает на все входящие сообщения покупателей 24/7. Ответ приходит на английском в течение 3 секунд.
        </Typography>
      </Alert>
    </Box>
  );
}

// ================================================================
// МОИ ЛИСТИНГИ
// ================================================================
const MARKETPLACE_COLORS: Record<string, string> = {
  etsy: '#F1641E', amazon: '#FF9900', wb: '#cb11ab', ozon: '#005BFF',
};
const MARKETPLACE_LABELS: Record<string, string> = {
  etsy: 'Etsy', amazon: 'Amazon', wb: 'Wildberries', ozon: 'Ozon',
};

// Случайные страны для симуляции заказов
const FAKE_ORDERS = [
  { country: 'Germany', amount: '$72.00', marketplace: 'Etsy' },
  { country: 'United States', amount: '$95.00', marketplace: 'Etsy' },
  { country: 'France', amount: '$68.00', marketplace: 'Etsy' },
  { country: 'Netherlands', amount: '$84.00', marketplace: 'Amazon' },
  { country: 'Canada', amount: '$61.00', marketplace: 'Etsy' },
  { country: 'Australia', amount: '$110.00', marketplace: 'Amazon' },
];

function ListingsTab(_props: { apiKey: string }) {
  const [listings, setListings] = useState<SavedListing[]>([]);
  const [stats, setStats] = useState({ total: 0, published: 0, totalCo2: 0, totalWater: 0, avgScore: 0 });
  const [orderSnack, setOrderSnack] = useState(false);
  const [simulatingOrder, setSimulatingOrder] = useState(false);
  const [lastOrder, setLastOrder] = useState<typeof FAKE_ORDERS[0] | null>(null);

  const reload = useCallback(() => {
    setListings(getListings());
    setStats(getStats());
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const handlePublish = (id: string) => {
    updateListingStatus(id, 'published');
    reload();
  };

  const handleDelete = (id: string) => {
    deleteListing(id);
    reload();
  };

  // Симуляция нового заказа
  const simulateOrder = async () => {
    setSimulatingOrder(true);
    const order = FAKE_ORDERS[Math.floor(Math.random() * FAKE_ORDERS.length)];
    const productName = listings.length > 0 ? listings[0].title : 'Войлочная сумка «Степь»';

    // Задержка как будто реальный заказ пришёл
    await new Promise(r => setTimeout(r, 1500));

    // Telegram уведомление
    if (tgConnected()) {
      await notifyNewOrder({
        productName,
        buyerCountry: order.country,
        amount: order.amount,
        marketplace: order.marketplace,
      });
    }

    setLastOrder({ ...order });
    setOrderSnack(true);
    setSimulatingOrder(false);
  };

  if (listings.length === 0) {
    return (
      <Box>
        <Box sx={{ textAlign: 'center', py: 8, opacity: 0.5 }}>
          <InventoryIcon sx={{ fontSize: 64, mb: 2 }} />
          <Typography variant="h6">Пока нет листингов</Typography>
          <Typography variant="body2" color="text.secondary">
            Сгенерируйте первый листинг в разделе "Нейро-интегратор"
          </Typography>
          <Button variant="contained" sx={{ mt: 3 }} href="/scanner">
            Оцифровать товар
          </Button>
        </Box>

        {/* Кнопка симуляции даже при пустом списке (для демо) */}
        <Box sx={{ mt: 2, p: 3, bgcolor: '#FAF8F5', borderRadius: 2, border: '1px dashed', borderColor: 'divider', textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Для демо — симулируй входящий заказ:
          </Typography>
          <Button
            variant="outlined"
            startIcon={simulatingOrder ? <CircularProgress size={16} /> : <ShoppingBagIcon />}
            onClick={simulateOrder}
            disabled={simulatingOrder}
            sx={{ textTransform: 'none' }}
          >
            {simulatingOrder ? 'Ждём заказ...' : 'Симулировать заказ с Etsy'}
          </Button>
          {tgConnected() && (
            <Typography variant="caption" color="success.main" sx={{ display: 'block', mt: 1 }}>
              Уведомление придёт в Telegram
            </Typography>
          )}
        </Box>

        <Snackbar
          open={orderSnack}
          autoHideDuration={5000}
          onClose={() => setOrderSnack(false)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
            🎉 Заказ из {lastOrder?.country} на {lastOrder?.amount}! {tgConnected() ? 'Уведомление отправлено в Telegram.' : ''}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  return (
    <Box>
      {/* Статистика */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 4 }}>
        <Box sx={{ p: 2.5, bgcolor: 'primary.main', borderRadius: 2, color: 'white' }}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'secondary.light' }}>{stats.total}</Typography>
          <Typography variant="caption" sx={{ opacity: 0.85 }}>Всего товаров</Typography>
        </Box>
        <Box sx={{ p: 2.5, bgcolor: '#E8F5E9', borderRadius: 2 }}>
          <Typography variant="h3" sx={{ fontWeight: 800, color: 'success.dark' }}>{stats.published}</Typography>
          <Typography variant="caption" color="success.dark">Опубликовано</Typography>
        </Box>
        <Box sx={{ p: 2.5, bgcolor: '#E3F2FD', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CloudQueueIcon sx={{ color: '#1565C0', fontSize: 28 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1565C0' }}>{stats.totalCo2} кг</Typography>
            <Typography variant="caption" sx={{ color: '#1565C0' }}>CO2 сохранено</Typography>
          </Box>
        </Box>
        <Box sx={{ p: 2.5, bgcolor: '#E3F2FD', borderRadius: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <WaterDropIcon sx={{ color: '#1565C0', fontSize: 28 }} />
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#1565C0' }}>{stats.totalWater} л</Typography>
            <Typography variant="caption" sx={{ color: '#1565C0' }}>Воды сэкономлено</Typography>
          </Box>
        </Box>
      </Box>

      {/* Кнопка симуляции заказа */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, p: 2.5, bgcolor: '#FAF8F5', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Симулировать входящий заказ</Typography>
          <Typography variant="caption" color="text.secondary">
            Для демо — имитирует заказ с Etsy/Amazon{tgConnected() ? ' и шлёт уведомление в Telegram' : ''}
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="secondary"
          startIcon={simulatingOrder ? <CircularProgress size={16} color="inherit" /> : <ShoppingBagIcon />}
          onClick={simulateOrder}
          disabled={simulatingOrder}
          sx={{ textTransform: 'none', flexShrink: 0 }}
        >
          {simulatingOrder ? 'Входящий заказ...' : 'Симулировать заказ'}
        </Button>
      </Box>

      {/* Карточки листингов */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {listings.map((listing) => (
          <Card key={listing.id} sx={{ overflow: 'hidden' }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
                {/* Фото */}
                <Box sx={{ width: { xs: '100%', sm: 140 }, minHeight: { xs: 160, sm: 'auto' }, flexShrink: 0, overflow: 'hidden' }}>
                  <img src={listing.imageUrl} alt={listing.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </Box>

                <Box sx={{ flex: 1, p: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1, flexWrap: 'wrap', gap: 1 }}>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={MARKETPLACE_LABELS[listing.marketplace] || listing.marketplace}
                        size="small"
                        sx={{ bgcolor: MARKETPLACE_COLORS[listing.marketplace] || '#888', color: 'white', fontWeight: 600 }}
                      />
                      <Chip
                        label={listing.status === 'published' ? 'Опубликован' : listing.status === 'archived' ? 'Архив' : 'Черновик'}
                        size="small"
                        color={listing.status === 'published' ? 'success' : 'default'}
                        variant={listing.status === 'draft' ? 'outlined' : 'filled'}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(listing.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                  </Box>

                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1, lineHeight: 1.3 }}>
                    {listing.title}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'secondary.main', fontSize: '1.1rem' }}>
                      {listing.suggestedPrice}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <PolicyIcon sx={{ fontSize: 16, color: listing.craftAuthenticityScore >= 50 ? 'success.main' : 'warning.main' }} />
                      <Box sx={{ width: 80 }}>
                        <LinearProgress
                          variant="determinate"
                          value={listing.craftAuthenticityScore}
                          sx={{
                            height: 6, borderRadius: 3, bgcolor: 'grey.200',
                            '& .MuiLinearProgress-bar': { bgcolor: listing.craftAuthenticityScore >= 50 ? 'success.main' : 'warning.main' },
                          }}
                        />
                      </Box>
                      <Typography variant="caption" color="text.secondary">{listing.craftAuthenticityScore}/100</Typography>
                    </Box>
                    {(listing.esgMetrics?.co2SavedKg ?? 0) > 0 && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <CloudQueueIcon sx={{ fontSize: 14, color: 'success.main' }} />
                        <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                          -{listing.esgMetrics.co2SavedKg} кг CO2
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {listing.tags && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                      {listing.tags.slice(0, 5).map((tag, i) => (
                        <Chip key={i} label={tag} size="small" variant="outlined" sx={{ fontSize: '0.65rem', height: 20 }} />
                      ))}
                      {listing.tags.length > 5 && (
                        <Chip label={`+${listing.tags.length - 5}`} size="small" sx={{ fontSize: '0.65rem', height: 20 }} />
                      )}
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 1 }}>
                    {listing.status === 'draft' && (
                      <Button size="small" variant="contained" startIcon={<PublishIcon />} onClick={() => handlePublish(listing.id)} sx={{ textTransform: 'none', fontSize: '0.8rem' }}>
                        Опубликовать
                      </Button>
                    )}
                    <Tooltip title="Удалить">
                      <IconButton size="small" onClick={() => handleDelete(listing.id)} sx={{ color: 'error.main' }}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      <Snackbar
        open={orderSnack}
        autoHideDuration={6000}
        onClose={() => setOrderSnack(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>
          🎉 Заказ из {lastOrder?.country} на {lastOrder?.amount}!
          {tgConnected() ? ' Уведомление отправлено в Telegram.' : ' Подключи Telegram чтобы получать уведомления.'}
        </Alert>
      </Snackbar>
    </Box>
  );
}

// ================================================================
// ИНТЕГРАЦИИ
// ================================================================
function IntegrationsTab() {
  const { connectedMarkets, connectMarket } = useAuth();
  const [loadingMarket, setLoadingMarket] = useState<string | null>(null);

  const markets = [
    { id: 'etsy', label: 'Etsy', sub: 'OAuth 2.0', icon: <LanguageIcon sx={{ color: '#F1641E', fontSize: 36 }} /> },
    { id: 'amazon', label: 'Amazon', sub: 'SP-API', icon: <ShoppingCartIcon sx={{ color: '#FF9900', fontSize: 36 }} /> },
    { id: 'wb', label: 'Wildberries', sub: 'API Ключ', icon: <StorefrontIcon sx={{ color: '#cb11ab', fontSize: 36 }} /> },
    { id: 'ozon', label: 'Ozon', sub: 'Seller API', icon: <StorefrontIcon sx={{ color: '#005BFF', fontSize: 36 }} /> },
  ];

  const handleConnect = async (id: string) => {
    setLoadingMarket(id);
    await connectMarket(id);
    setLoadingMarket(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {markets.map(m => (
        <Card key={m.id}>
          <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '20px !important' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {m.icon}
              <Box>
                <Typography variant="h6">{m.label}</Typography>
                <Typography variant="body2" color="text.secondary">Подключение через {m.sub}</Typography>
              </Box>
            </Box>
            {connectedMarkets.includes(m.id) ? (
              <Chip label="Подключено ✓" color="success" />
            ) : (
              <Button variant="outlined" onClick={() => handleConnect(m.id)} disabled={loadingMarket === m.id}>
                {loadingMarket === m.id ? <CircularProgress size={20} /> : 'Подключить'}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        После подключения маркетплейса — кнопка "Опубликовать" в листингах будет отправлять товар напрямую через API.
      </Alert>
    </Box>
  );
}

// ================================================================
// ГЛАВНЫЙ DASHBOARD
// ================================================================
export default function Dashboard() {
  const [tab, setTab] = useState(0);
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string || '';

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 5, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Кабинет Селлера
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Листинги, интеграции и AI-автоответчик в одном месте
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AutoAwesomeIcon />} href="/scanner" sx={{ alignSelf: 'flex-start' }}>
          Создать листинг
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v as number)}>
          <Tab label="Мои листинги" />
          <Tab label="AI Автоответчик" />
          <Tab label="Интеграции" />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <TelegramIcon sx={{ fontSize: 18, color: '#229ED9' }} />
                Telegram
              </Box>
            }
          />
        </Tabs>
      </Box>

      {tab === 0 && <ListingsTab apiKey={apiKey} />}
      {tab === 1 && <AutoResponder apiKey={apiKey} />}
      {tab === 2 && <IntegrationsTab />}
      {tab === 3 && <TelegramSetup />}
    </Container>
  );
}