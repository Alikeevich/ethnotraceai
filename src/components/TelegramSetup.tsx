import { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Switch from '@mui/material/Switch';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import StepContent from '@mui/material/StepContent';
import TelegramIcon from '@mui/icons-material/Telegram';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import {
  validateBot,
  fetchChatId,
  saveConfig,
  clearConfig,
  isConnected,
  notifyTest,
  notifyWeeklyTrends,
} from '../lib/telegram';

interface NotifSettings {
  listingReady: boolean;
  newOrder: boolean;
  buyerQuestion: boolean;
  weeklyTrends: boolean;
  esgUpdate: boolean;
}

const DEFAULT_SETTINGS: NotifSettings = {
  listingReady: true,
  newOrder: true,
  buyerQuestion: true,
  weeklyTrends: true,
  esgUpdate: false,
};

function getNotifSettings(): NotifSettings {
  try {
    const raw = localStorage.getItem('ethnotrace_notif');
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveNotifSettings(s: NotifSettings) {
  localStorage.setItem('ethnotrace_notif', JSON.stringify(s));
}

export default function TelegramSetup() {
  const [connected, setConnected] = useState(isConnected);
  const [step, setStep] = useState(0);
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [botName, setBotName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetchingId, setFetchingId] = useState(false);
  const [testSent, setTestSent] = useState(false);
  const [trendSent, setTrendSent] = useState(false);
  const [notifSettings, setNotifSettings] = useState<NotifSettings>(getNotifSettings);

  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY as string || '';

  useEffect(() => {
    setConnected(isConnected());
  }, []);

  const handleValidateToken = async () => {
    if (!botToken.trim()) { setError('Введи токен бота'); return; }
    setLoading(true);
    setError('');
    const result = await validateBot(botToken.trim());
    if (result.ok) {
      setBotName(result.botName || '');
      setStep(1);
    } else {
      setError('Неверный токен. Проверь что скопировал правильно из @BotFather');
    }
    setLoading(false);
  };

  const handleFetchChatId = async () => {
    setFetchingId(true);
    setError('');
    const id = await fetchChatId(botToken.trim());
    if (id) {
      setChatId(id);
    } else {
      setError('Не нашли сообщение. Убедись что написал /start боту и нажми ещё раз.');
    }
    setFetchingId(false);
  };

  const handleConnect = async () => {
    if (!chatId.trim()) { setError('Нужен Chat ID'); return; }
    setLoading(true);
    saveConfig({ botToken: botToken.trim(), chatId: chatId.trim() });
    // Отправляем приветствие
    const { notifyWelcome } = await import('../lib/telegram');
    await notifyWelcome('Мастер');
    setConnected(true);
    setLoading(false);
  };

  const handleDisconnect = () => {
    clearConfig();
    setConnected(false);
    setBotToken('');
    setChatId('');
    setBotName('');
    setStep(0);
    setTestSent(false);
  };

  const handleTest = async () => {
    const ok = await notifyTest();
    if (ok) setTestSent(true);
    else setError('Не удалось отправить. Проверь токен и Chat ID.');
  };

  const handleWeeklyTrend = async () => {
    setTrendSent(false);
    const ok = await notifyWeeklyTrends(geminiKey);
    if (ok) setTrendSent(true);
  };

  const updateNotif = (key: keyof NotifSettings, val: boolean) => {
    const updated = { ...notifSettings, [key]: val };
    setNotifSettings(updated);
    saveNotifSettings(updated);
  };

  // ── Уже подключён ──
  if (connected) {
    return (
      <Box>
        <Card sx={{ mb: 3, border: '2px solid', borderColor: 'success.main', borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
              <TelegramIcon sx={{ fontSize: 40, color: '#229ED9' }} />
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Telegram подключён</Typography>
                  <CheckCircleIcon sx={{ color: 'success.main', fontSize: 20 }} />
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Уведомления приходят прямо в мессенджер
                </Typography>
              </Box>
              <Chip label="Активно" color="success" />
            </Box>

            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                onClick={handleTest}
                startIcon={testSent ? <CheckCircleIcon /> : <NotificationsActiveIcon />}
                color={testSent ? 'success' : 'primary'}
                sx={{ textTransform: 'none' }}
              >
                {testSent ? 'Отправлено!' : 'Тест уведомление'}
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleWeeklyTrend}
                startIcon={<NotificationsActiveIcon />}
                color={trendSent ? 'success' : 'primary'}
                sx={{ textTransform: 'none' }}
              >
                {trendSent ? 'Тренды отправлены!' : 'Отправить тренды сейчас'}
              </Button>
              <Button
                size="small"
                color="error"
                variant="text"
                onClick={handleDisconnect}
                sx={{ textTransform: 'none', ml: 'auto' }}
              >
                Отключить
              </Button>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2 }}>
              Настройки уведомлений
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {([
                { key: 'listingReady', label: 'Листинг готов', sub: 'После генерации в Нейро-интеграторе' },
                { key: 'newOrder', label: 'Новый заказ', sub: 'Пришёл покупатель с маркетплейса' },
                { key: 'buyerQuestion', label: 'Вопрос покупателя', sub: 'Автоответчик ответил, ты в курсе' },
                { key: 'weeklyTrends', label: 'Еженедельные тренды', sub: 'По воскресеньям, AI-дайджест Etsy' },
                { key: 'esgUpdate', label: 'Обновление ESG рейтинга', sub: 'Когда добавляются новые товары' },
              ] as { key: keyof NotifSettings; label: string; sub: string }[]).map(({ key, label, sub }) => (
                <Box
                  key={key}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    p: 2,
                    borderRadius: 2,
                    bgcolor: notifSettings[key] ? 'rgba(46, 125, 82, 0.04)' : '#FAF8F5',
                    border: '1px solid',
                    borderColor: notifSettings[key] ? 'success.light' : 'divider',
                    transition: 'all 0.2s',
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
                    <Typography variant="caption" color="text.secondary">{sub}</Typography>
                  </Box>
                  <Switch
                    size="small"
                    checked={notifSettings[key]}
                    onChange={(_, v) => updateNotif(key, v)}
                    color="success"
                  />
                </Box>
              ))}
            </Box>
          </CardContent>
        </Card>

        {/* Пример уведомления */}
        <Card sx={{ bgcolor: '#1c1c1e', color: 'white', borderRadius: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="caption" sx={{ opacity: 0.5, display: 'block', mb: 2, textTransform: 'uppercase', letterSpacing: 1 }}>
              Пример в Telegram
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
              <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Typography variant="caption" sx={{ color: 'white', fontWeight: 700 }}>ET</Typography>
              </Box>
              <Box sx={{ flex: 1, bgcolor: '#2c2c2e', borderRadius: '4px 12px 12px 12px', p: 2 }}>
                <Typography variant="caption" sx={{ color: '#229ED9', fontWeight: 700, display: 'block', mb: 0.5 }}>
                  EthnoTrace Bot
                </Typography>
                <Typography variant="body2" sx={{ color: 'white', lineHeight: 1.6 }}>
                  🎉 <strong>НОВЫЙ ЗАКАЗ!</strong><br />
                  📦 Войлочная сумка «Степь»<br />
                  🌍 Покупатель из: Germany<br />
                  💵 Сумма: $72.00<br />
                  🏪 Площадка: ETSY<br />
                  <span style={{ opacity: 0.6, fontSize: '0.75rem' }}>AI-автоответчик уже ответил покупателю</span>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  // ── Настройка ──
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <TelegramIcon sx={{ fontSize: 48, color: '#229ED9' }} />
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>Подключить Telegram</Typography>
          <Typography variant="body2" color="text.secondary">
            Получай уведомления о заказах, листингах и трендах прямо в мессенджер
          </Typography>
        </Box>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

      <Stepper activeStep={step} orientation="vertical">

        {/* ШАГ 0: Создать бота */}
        <Step>
          <StepLabel>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Создай бота в @BotFather</Typography>
          </StepLabel>
          <StepContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Открой Telegram → найди <strong>@BotFather</strong> → напиши <code>/newbot</code> → выбери имя → скопируй токен
            </Typography>

            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<TelegramIcon />}
                href="https://t.me/BotFather"
                target="_blank"
                sx={{ textTransform: 'none' }}
              >
                Открыть @BotFather
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<ContentCopyIcon />}
                onClick={() => navigator.clipboard.writeText('/newbot')}
                sx={{ textTransform: 'none' }}
              >
                Скопировать /newbot
              </Button>
            </Box>

            <TextField
              fullWidth
              size="small"
              label="Токен бота (от @BotFather)"
              placeholder="7123456789:AAF..."
              value={botToken}
              onChange={e => setBotToken(e.target.value)}
              sx={{ mb: 2 }}
            />
            <Button
              variant="contained"
              onClick={handleValidateToken}
              disabled={loading || !botToken.trim()}
              sx={{ textTransform: 'none' }}
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Проверить токен'}
            </Button>
          </StepContent>
        </Step>

        {/* ШАГ 1: Получить Chat ID */}
        <Step>
          <StepLabel>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Напиши /start своему боту
              {botName && <Chip label={`@${botName}`} size="small" sx={{ ml: 1 }} color="primary" />}
            </Typography>
          </StepLabel>
          <StepContent>
            <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
              ✅ Бот <strong>@{botName}</strong> найден и активен!
            </Alert>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Открой своего бота в Telegram → нажми <strong>START</strong> или напиши <code>/start</code> → вернись сюда
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
              <Button
                variant="outlined"
                size="small"
                href={`https://t.me/${botName}`}
                target="_blank"
                startIcon={<TelegramIcon />}
                sx={{ textTransform: 'none' }}
              >
                Открыть @{botName}
              </Button>
              <Button
                variant="contained"
                size="small"
                onClick={handleFetchChatId}
                disabled={fetchingId}
                sx={{ textTransform: 'none' }}
              >
                {fetchingId ? <CircularProgress size={16} color="inherit" /> : 'Получить мой Chat ID'}
              </Button>
            </Box>
            {chatId && (
              <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
                Chat ID найден: <strong>{chatId}</strong>
              </Alert>
            )}
            {!chatId && (
              <TextField
                fullWidth
                size="small"
                label="Или введи Chat ID вручную"
                placeholder="123456789"
                value={chatId}
                onChange={e => setChatId(e.target.value)}
                helperText="Можно узнать через @userinfobot"
                sx={{ mb: 2 }}
              />
            )}
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="text" onClick={() => setStep(0)} sx={{ textTransform: 'none' }}>
                Назад
              </Button>
              <Button
                variant="contained"
                onClick={handleConnect}
                disabled={loading || !chatId.trim()}
                sx={{ textTransform: 'none' }}
              >
                {loading ? <CircularProgress size={20} color="inherit" /> : 'Подключить Telegram ✓'}
              </Button>
            </Box>
          </StepContent>
        </Step>
      </Stepper>
    </Box>
  );
}