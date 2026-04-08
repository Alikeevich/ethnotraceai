import { useState, useRef, useCallback, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Snackbar from '@mui/material/Snackbar';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import CloudQueueIcon from '@mui/icons-material/CloudQueue';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import PolicyIcon from '@mui/icons-material/Policy';
import StarIcon from '@mui/icons-material/Star';
import StarHalfIcon from '@mui/icons-material/StarHalf';
import { useAuth } from '../contexts/AuthContext';
import { saveListing } from '../lib/storage';
import { notifyListingReady, isConnected as tgConnected } from '../lib/telegram';

interface ListingResult {
  craftAuthenticityScore: number;
  authenticityReasoning: string;
  title: string;
  description: string;
  suggestedPrice: string;
  priceReasoning: string;
  esgMetrics: { co2SavedKg: number; waterSavedLiters: number };
  tags?: string[];
  bulletPoints?: string[];
  characteristics?: Record<string, string>;
}

// Умный промпт с выходом в интернет и строгим разделением языков
const getBaseInstructions = (marketplaceName: string) => `
You are an expert assistant for artisans. 
You MUST use Google Search to estimate the REAL CURRENT MARKET PRICE for the item in the image.

STEP 1: IDENTIFY & RESEARCH
Identify exactly what the item is (materials, is it a known brand like Guess, Zara, etc., or handmade?).
Use Search to find the real retail price for this specific item/brand or similar handmade items on ${marketplaceName}.

STEP 2: AUTHENTICITY CHECK (CRITICAL)
If you see a MASS-MARKET FACTORY ITEM or a RECOGNIZABLE BRAND:
- "craftAuthenticityScore": Low (0-40).
- "authenticityReasoning": Name the brand or explain why it is a factory item.
- "esgMetrics": Set both to 0.
- "suggestedPrice": The REAL retail/resale price based on your internet search for this exact brand/item (e.g. 129$, 8500₽). Only the number and currency symbol!
- "priceReasoning": Explain how you found this price.

If it is GENUINELY HANDMADE:
- "craftAuthenticityScore": High (75-100).
- "suggestedPrice": A PREMIUM price based on real market rates for handmade goods. Only the number and currency symbol!
- "priceReasoning": Justify based on craftsmanship.
- "esgMetrics": Calculate eco-savings (water, CO2) compared to factory production.

CRITICAL LANGUAGE RULE: 
- Fields "authenticityReasoning" and "priceReasoning" MUST ALWAYS BE IN RUSSIAN (Русский язык) so the user understands your logic.
- The listing text (title, description, tags, etc.) must be in the requested Target Language.

Return strict JSON ONLY, without markdown code blocks (\`\`\`json).`;

const SYSTEM_PROMPTS = (marketplaceName: string, type: string) => {
  const base = getBaseInstructions(marketplaceName);
  const currency =['etsy', 'amazon'].includes(type) ? '$' : '₽';
  
  if (type === 'etsy') return `${base} 
Target Language for listing: ENGLISH. 
Format: {"craftAuthenticityScore": 90, "authenticityReasoning": "Объяснение на русском", "title": "English title...", "description": "English desc...", "tags":["english tags"], "suggestedPrice": "${currency}...", "priceReasoning": "Объяснение цены на русском", "esgMetrics": {"co2SavedKg": 10, "waterSavedLiters": 100}}`;
  
  if (type === 'amazon') return `${base} 
Target Language for listing: ENGLISH. 
Format: {"craftAuthenticityScore": 90, "authenticityReasoning": "Объяснение на русском", "title": "English title...", "bulletPoints":["English bullet..."], "description": "English desc...", "suggestedPrice": "${currency}...", "priceReasoning": "Объяснение цены на русском", "esgMetrics": {"co2SavedKg": 10, "waterSavedLiters": 100}}`;
  
  if (type === 'wb') return `${base} 
Target Language for listing: RUSSIAN. 
Format: {"craftAuthenticityScore": 90, "authenticityReasoning": "Объяснение на русском", "title": "Русский заголовок...", "description": "Русское описание...", "characteristics": {"Материал": "..."}, "suggestedPrice": "... ${currency}", "priceReasoning": "Объяснение цены на русском", "esgMetrics": {"co2SavedKg": 10, "waterSavedLiters": 100}}`;
  
  return `${base} 
Target Language for listing: RUSSIAN. 
Format: {"craftAuthenticityScore": 90, "authenticityReasoning": "Объяснение на русском", "title": "Русский заголовок...", "description": "Русское описание...", "tags": ["..."], "characteristics": {"Бренд": "Нет"}, "suggestedPrice": "... ${currency}", "priceReasoning": "Объяснение цены на русском", "esgMetrics": {"co2SavedKg": 10, "waterSavedLiters": 100}}`;
};

const MARKETPLACES =[
  { id: 'etsy', label: 'Etsy (США/Европа)' },
  { id: 'amazon', label: 'Amazon Handmade' },
  { id: 'wb', label: 'Wildberries' },
  { id: 'ozon', label: 'Ozon' },
];

const LOADING_MESSAGES =[
  'Изучаем фото и материалы...',
  'Ищем похожие товары и цены в интернете...',
  'Оцениваем качество и бренд...',
  'Пишем красивый текст на нужном языке...',
  'Почти готово, оформляем результат...'
];

export default function Scanner() {
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [description, setDescription] = useState('');
  const [marketplace, setMarketplace] = useState('etsy');
  const { connectedMarkets, user } = useAuth();
  
  const[loading, setLoading] = useState(false);
  const [loadingTextIdx, setLoadingTextIdx] = useState(0);
  const [result, setResult] = useState<ListingResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<string | null>(null);
  const [studioMode, setStudioMode] = useState(true);
  
  const[exporting, setExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingTextIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [loading]);

  const processImage = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => setImage(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files[0]) processImage(e.dataTransfer.files[0]);
  },[]);

  const generateAll = async () => {
    if (!image) { setError('Пожалуйста, загрузите фото товара'); return; }
    const key = import.meta.env.VITE_GEMINI_API_KEY as string;
    if (!key) { setError('Введите API ключ Google Gemini'); return; }

    setError('');
    setResult(null);
    setLoading(true);
    setLoadingTextIdx(0);

    try {
      const activeMarketLabel = MARKETPLACES.find(m => m.id === marketplace)?.label || 'этой площадке';
      const finalPrompt = SYSTEM_PROMPTS(activeMarketLabel, marketplace);
      const base64Data = image.split(',')[1];
      const mimeType = image.split(';')[0].split(':')[1];

      const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.0-pro:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents:[{ 
            parts:[
              { text: `${finalPrompt}\n\nЧто сказал мастер о товаре (если есть): ${description}` }, 
              { inlineData: { mimeType: mimeType, data: base64Data } }
            ] 
          }],
          tools: [{ googleSearch: {} }],
          generationConfig: { temperature: 0.1 }
        })
      });

      if (!geminiResponse.ok) {
        const errData = await geminiResponse.json().catch(() => null);
        throw new Error(errData?.error?.message || `Ошибка сервера Google: ${geminiResponse.status}`);
      }
      
      const data = await geminiResponse.json();
      const rawText = data.candidates[0].content.parts[0].text;
      
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Нейросеть не смогла сформировать правильный ответ. Попробуйте еще раз.');
      
      const parsedData: ListingResult = JSON.parse(jsonMatch[0]);
      setResult(parsedData);

      if (tgConnected()) {
        notifyListingReady({
          title: parsedData.title,
          marketplace: marketplace,
          price: parsedData.suggestedPrice,
          authenticityScore: parsedData.craftAuthenticityScore,
          esgCo2: parsedData.esgMetrics?.co2SavedKg ?? 0,
        });
      }

      saveListing({
        marketplace: marketplace,
        imageUrl: image!, // base64 фото
        title: parsedData.title,
        description: parsedData.description,
        suggestedPrice: parsedData.suggestedPrice,
        craftAuthenticityScore: parsedData.craftAuthenticityScore,
        esgMetrics: parsedData.esgMetrics ?? { co2SavedKg: 0, waterSavedLiters: 0 },
        tags: parsedData.tags,
        bulletPoints: parsedData.bulletPoints,
        characteristics: parsedData.characteristics,
      });

    } catch (err) {
      console.error(err);
      let errMsg = err instanceof Error ? err.message : 'Произошла ошибка при анализе';
      if (errMsg === 'Failed to fetch') errMsg = 'Ошибка сети. Возможно, вам нужен VPN (серверы Google AI могут быть недоступны в вашем регионе).';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const CopyButton = ({ text, field }: { text: string; field: string }) => (
    <Tooltip title={copied === field ? 'Скопировано!' : 'Копировать'}>
      <IconButton size="small" onClick={() => copy(text, field)} sx={{ color: copied === field ? 'success.main' : 'text.secondary' }}>
        {copied === field ? <CheckIcon fontSize="small" /> : <ContentCopyIcon fontSize="small" />}
      </IconButton>
    </Tooltip>
  );

  const handleApiExport = () => {
    if (!user) { alert("Сначала войдите в аккаунт!"); return; }
    if (!connectedMarkets.includes(marketplace)) { setExportError(true); return; }
    
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      setExportSuccess(true);
    }, 2000);
  };

  const activeMarket = MARKETPLACES.find(m => m.id === marketplace);

  // --- Рендеринг интерфейса маркетплейсов ---
  const renderMarketplaceUI = () => {
    if (!result) return null;

    // Вспомогательная функция для расчета "старой" цены (фейковая скидка)
    const oldPriceNum = parseInt(result.suggestedPrice.replace(/\D/g, '')) * 1.5;
    const oldPrice = isNaN(oldPriceNum) ? '' : `${Math.floor(oldPriceNum)}`;

    if (marketplace === 'etsy') {
      return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="body2" sx={{ color: '#595959', mb: 0.5, '&:hover': { textDecoration: 'underline', cursor: 'pointer' } }}>EthnoTraceArtisan</Typography>
          <Typography sx={{ fontWeight: 300, fontSize: '1.25rem', fontFamily: 'serif', lineHeight: 1.3, mb: 1, color: '#222222' }}>{result.title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
            <Box sx={{ display: 'flex', color: '#222222' }}>
              <StarIcon fontSize="small" /><StarIcon fontSize="small" /><StarIcon fontSize="small" /><StarIcon fontSize="small" /><StarHalfIcon fontSize="small" />
            </Box>
            <Typography variant="body2" sx={{ color: '#222222' }}>(124)</Typography>
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: '#222222', mb: 1 }}>{result.suggestedPrice}</Typography>
          <Typography variant="body2" sx={{ color: '#258635', fontWeight: 600, mb: 2 }}>FREE shipping</Typography>
          <Chip label="Bestseller" size="small" sx={{ bgcolor: '#FDEBD2', color: '#222222', fontWeight: 600, alignSelf: 'flex-start', borderRadius: 4, height: 24 }} />
          <Button fullWidth variant="contained" sx={{ mt: 'auto', bgcolor: '#222222', color: 'white', borderRadius: 8, textTransform: 'none', py: 1.5, fontWeight: 700, '&:hover': { bgcolor: '#000000' } }}>Add to cart</Button>
        </Box>
      );
    }

    if (marketplace === 'amazon') {
      return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', fontFamily: 'Arial, sans-serif' }}>
          <Typography variant="body2" sx={{ color: '#007185', mb: 0.5, '&:hover': { textDecoration: 'underline', cursor: 'pointer' } }}>Visit the EthnoTrace Store</Typography>
          <Typography sx={{ fontSize: '1.2rem', lineHeight: 1.3, mb: 1, color: '#0F1111' }}>{result.title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ display: 'flex', color: '#FFA41C' }}>
              <StarIcon fontSize="small" /><StarIcon fontSize="small" /><StarIcon fontSize="small" /><StarIcon fontSize="small" /><StarHalfIcon fontSize="small" />
            </Box>
            <Typography variant="body2" sx={{ color: '#007185' }}>124 ratings</Typography>
          </Box>
          <Box sx={{ mb: 1, display: 'flex', alignItems: 'baseline' }}>
            <Typography variant="h4" sx={{ fontWeight: 400, color: '#0F1111' }}>{result.suggestedPrice}</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
            <Typography variant="body2" sx={{ color: '#0F1111', fontWeight: 700 }}>prime</Typography>
            <Typography variant="body2" sx={{ color: '#565959' }}>FREE delivery</Typography>
          </Box>
          <Button fullWidth variant="contained" sx={{ mt: 'auto', bgcolor: '#FFD814', color: '#0F1111', borderRadius: 8, textTransform: 'none', py: 1, boxShadow: 'none', border: '1px solid #FCD200', '&:hover': { bgcolor: '#F7CA00', boxShadow: 'none' } }}>Add to Cart</Button>
        </Box>
      );
    }

    if (marketplace === 'wb') {
      return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="body2" sx={{ color: '#868695', fontWeight: 600, textTransform: 'uppercase' }}>BRAND</Typography>
            <Typography variant="body2" sx={{ color: '#868695' }}>/ {result.title.substring(0, 20)}...</Typography>
          </Box>
          <Typography sx={{ fontSize: '1.1rem', lineHeight: 1.3, mb: 1, color: '#242424' }}>{result.title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', color: '#cb11ab' }}>
              <StarIcon fontSize="small" /> <Typography sx={{ fontWeight: 700, ml: 0.5 }}>4.8</Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#868695' }}>124 оценки</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1.5, mb: 2 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: '#cb11ab' }}>{result.suggestedPrice}</Typography>
            <Typography sx={{ textDecoration: 'line-through', color: '#868695', fontSize: '1.1rem' }}>{oldPrice} ₽</Typography>
          </Box>
          <Button fullWidth variant="contained" sx={{ mt: 'auto', bgcolor: '#cb11ab', color: 'white', borderRadius: 2, textTransform: 'none', py: 1.5, fontSize: '1.1rem', fontWeight: 600, '&:hover': { bgcolor: '#b20e96' } }}>В корзину</Button>
        </Box>
      );
    }

    // Ozon
    return (
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography sx={{ fontSize: '1.1rem', lineHeight: 1.3, mb: 1, color: '#001A34' }}>{result.title}</Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', color: '#00A046' }}>
            <StarIcon fontSize="small" sx={{ color: '#FFB800' }} />
            <StarIcon fontSize="small" sx={{ color: '#FFB800' }} />
            <StarIcon fontSize="small" sx={{ color: '#FFB800' }} />
            <StarIcon fontSize="small" sx={{ color: '#FFB800' }} />
            <StarIcon fontSize="small" sx={{ color: '#FFB800' }} />
            <Typography sx={{ ml: 0.5, color: '#001A34' }}>124 отзыва</Typography>
          </Box>
        </Box>
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'inline-flex', alignItems: 'center', bgcolor: '#00A046', color: 'white', px: 1, py: 0.5, borderRadius: 1, mb: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>{result.suggestedPrice}</Typography>
            <Typography variant="caption" sx={{ ml: 1 }}>c Ozon Картой</Typography>
          </Box>
          <Typography variant="body1" sx={{ color: '#001A34', textDecoration: 'line-through', opacity: 0.6 }}>{oldPrice} ₽</Typography>
        </Box>
        <Button fullWidth variant="contained" sx={{ mt: 'auto', bgcolor: '#005BFF', color: 'white', borderRadius: 2, textTransform: 'none', py: 1.5, fontWeight: 600, '&:hover': { bgcolor: '#004DE6' } }}>В корзину</Button>
      </Box>
    );
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 800 }}>
          Оформление товара
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 650 }}>
          Загрузите фото. Мы найдем цены конкурентов в интернете и напишем текст, который продает.
        </Typography>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1.2fr' }, gap: 4 }}>
        
        {/* ЛЕВАЯ ЧАСТЬ: ВВОД */}
        <Box>
          <Card sx={{ mb: 3, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
            <CardContent sx={{ p: 0 }}>
              <Box
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => !image && fileInputRef.current?.click()}
                sx={{
                  height: image ? 'auto' : 280, 
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                  border: `2px dashed`, borderColor: isDragging ? 'primary.main' : '#E5E0D8', 
                  borderRadius: 3, cursor: image ? 'default' : 'pointer',
                  bgcolor: isDragging ? 'rgba(44, 62, 53, 0.05)' : '#FAF8F5', 
                  transition: 'all 0.2s', overflow: 'hidden', m: 2
                }}
              >
                {image ? (
                  <Box sx={{ position: 'relative', width: '100%' }}>
                    <img src={image} alt="Uploaded" style={{ width: '100%', maxHeight: 320, objectFit: 'cover', display: 'block' }} />
                    <Button size="small" variant="contained" onClick={(e) => { e.stopPropagation(); setImage(null); }} sx={{ position: 'absolute', top: 8, right: 8, bgcolor: 'rgba(0,0,0,0.7)', '&:hover': { bgcolor: 'black' } }}>
                      Другое фото
                    </Button>
                  </Box>
                ) : (
                  <Box sx={{ textAlign: 'center', p: 4 }}>
                    <CloudUploadIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2, opacity: 0.8 }} />
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>Нажмите или перетащите фото</Typography>
                    <Typography variant="body2" color="text.secondary">Желательно при хорошем свете, чтобы было видно детали</Typography>
                  </Box>
                )}
              </Box>
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { if (e.target.files?.[0]) processImage(e.target.files[0]); }} />
            </CardContent>
          </Card>

          <TextField 
            fullWidth multiline rows={2} 
            label="Уточнения (необязательно)" 
            placeholder="Например: овечья шерсть, красил натуральными травами..." 
            value={description} onChange={(e) => setDescription(e.target.value)} 
            sx={{ mb: 3 }} 
          />

          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>
              Для какого сайта готовим текст?
            </Typography>
            <ToggleButtonGroup value={marketplace} exclusive onChange={(_, v) => v && setMarketplace(v)} fullWidth size="small">
              {MARKETPLACES.map(m => (
                <ToggleButton key={m.id} value={m.id} sx={{ textTransform: 'none', py: 1, fontWeight: 600 }}>{m.label}</ToggleButton>
              ))}
            </ToggleButtonGroup>
          </Box>

          {error && <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>}

          <Button 
            fullWidth variant="contained" size="large" onClick={generateAll} 
            disabled={loading || !image} 
            sx={{ py: 2, fontSize: '1.1rem', borderRadius: 2, fontWeight: 700 }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><CircularProgress size={20} color="inherit" /> Анализируем...</Box>
            ) : (
              `Создать описание`
            )}
          </Button>
        </Box>

        {/* ПРАВАЯ ЧАСТЬ: РЕЗУЛЬТАТ */}
        <Box>
          {(!result && !loading) && (
            <Card sx={{ height: '100%', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'transparent', border: '2px dashed #E5E0D8' }}>
              <CardContent sx={{ textAlign: 'center', opacity: 0.6 }}>
                <AutoAwesomeIcon sx={{ fontSize: 64, mb: 2, color: 'text.secondary' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>Здесь появится результат</Typography>
                <Typography variant="body2">Загрузите фото слева и нажмите кнопку</Typography>
              </CardContent>
            </Card>
          )}

          {loading && (
            <Card sx={{ height: '100%', minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <CircularProgress sx={{ mb: 4, color: 'primary.main' }} size={48} />
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', minHeight: 32 }}>
                  {LOADING_MESSAGES[loadingTextIdx]}
                </Typography>
              </CardContent>
            </Card>
          )}

          {result && image && !loading && (
            <Card sx={{ overflow: 'hidden', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
              
              {/* ИНДИКАТОР: КРАФТ ИЛИ ФАБРИКА */}
              <Box sx={{ p: 3, borderBottom: '1px solid #E5E0D8', bgcolor: result.craftAuthenticityScore < 50 ? '#FFF4E5' : '#E8F5E9' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <PolicyIcon sx={{ color: result.craftAuthenticityScore < 50 ? '#ED6C02' : '#2E7D32' }} />
                  <Typography variant="h6" sx={{ color: result.craftAuthenticityScore < 50 ? '#ED6C02' : '#2E7D32', fontWeight: 700 }}>
                    {result.craftAuthenticityScore < 50 ? 'Похоже на фабричный товар / Известный бренд' : 'Подтверждена ручная работа'}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  <b>Вердикт ИИ:</b> {result.authenticityReasoning}
                </Typography>
              </Box>

              {/* ПРЕВЬЮ МАРКЕТПЛЕЙСА (Реалистичное) */}
              <Box sx={{ p: 3, bgcolor: '#ffffff', borderBottom: '1px solid #E5E0D8' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>Как это будет выглядеть ({activeMarket?.label})</Typography>
                  <ToggleButtonGroup value={studioMode ? 'studio' : 'original'} exclusive onChange={(_, v) => { if(v) setStudioMode(v === 'studio'); }} size="small">
                    <ToggleButton value="original" sx={{ textTransform: 'none', px: 2, fontSize: '0.75rem' }}>Оригинал</ToggleButton>
                    <ToggleButton value="studio" sx={{ textTransform: 'none', px: 2, fontSize: '0.75rem' }}><AutoAwesomeIcon sx={{ fontSize: 14, mr: 0.5 }} /> Улучшено</ToggleButton>
                  </ToggleButtonGroup>
                </Box>
                
                <Box sx={{ display: 'flex', gap: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
                  <Box sx={{ width: { xs: '100%', sm: '40%' }, borderRadius: 2, overflow: 'hidden', position: 'relative', aspectRatio: '1/1' }}>
                    <img src={image} alt="Product" style={{ width: '100%', height: '100%', objectFit: 'cover', filter: studioMode ? 'contrast(1.15) saturate(1.2) brightness(1.05)' : 'none' }} />
                  </Box>
                  
                  {/* Рендерим нужный интерфейс в зависимости от площадки */}
                  {renderMarketplaceUI()}
                  
                </Box>
              </Box>

              <CardContent sx={{ p: 4, bgcolor: '#FAF8F5' }}>
                
                {/* БЛОК ЭКОЛОГИИ */}
                {result.craftAuthenticityScore < 50 ? (
                  <Alert severity="warning" sx={{ mb: 4, borderRadius: 2 }}>Для известных брендов и фабричных вещей сертификат ручной работы и эко-значок недоступны.</Alert>
                ) : (
                  <>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>Польза для природы (Эко-паспорт)</Typography>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                      <Box sx={{ flex: 1, minWidth: 150, p: 2, bgcolor: '#E8F5E9', borderRadius: 2, border: '1px solid #C8E6C9', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <CloudQueueIcon sx={{ color: '#2E7D32', fontSize: 32 }} />
                        <Box>
                          <Typography variant="h5" sx={{ color: '#2E7D32', fontWeight: 800 }}>{result.esgMetrics?.co2SavedKg} кг</Typography>
                          <Typography variant="caption" sx={{ color: '#2E7D32', fontWeight: 600 }}>Выбросов CO2 избежали</Typography>
                        </Box>
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 150, p: 2, bgcolor: '#E3F2FD', borderRadius: 2, border: '1px solid #BBDEFB', display: 'flex', alignItems: 'center', gap: 2 }}>
                        <WaterDropIcon sx={{ color: '#1565C0', fontSize: 32 }} />
                        <Box>
                          <Typography variant="h5" sx={{ color: '#1565C0', fontWeight: 800 }}>{result.esgMetrics?.waterSavedLiters} л</Typography>
                          <Typography variant="caption" sx={{ color: '#1565C0', fontWeight: 600 }}>Воды сэкономили</Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Alert icon={<InfoOutlinedIcon fontSize="inherit" />} severity="info" sx={{ mb: 4, borderRadius: 2 }}>
                      <Typography variant="body2">
                        Иностранцы любят эти цифры! Скопируйте их и добавьте в самый низ вашего описания.
                      </Typography>
                    </Alert>
                  </>
                )}

                {/* ТЕКСТ И ХАРАКТЕРИСТИКИ */}
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Готовый текст описания</Typography>
                    <CopyButton text={result.description} field="desc" />
                  </Box>
                  <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'text.primary', p: 3, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E5E0D8', whiteSpace: 'pre-wrap' }}>
                    {result.description}
                  </Typography>
                </Box>

                {result.bulletPoints && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>Особенности для Amazon</Typography>
                    <Box sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E5E0D8' }}>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {result.bulletPoints.map((point, i) => (
                          <li key={i}><Typography variant="body2" sx={{ mb: 1 }}>{point}</Typography></li>
                        ))}
                      </ul>
                    </Box>
                  </Box>
                )}

                {result.characteristics && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', mb: 1, display: 'block' }}>Характеристики</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      {Object.entries(result.characteristics).map(([key, val], i) => (
                        <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', p: 1.5, bgcolor: '#FFFFFF', borderRadius: 1, border: '1px solid #E5E0D8' }}>
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>{key}</Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>{val as string}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </Box>
                )}

                {result.tags && (
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>Слова для поиска (Теги)</Typography>
                      <CopyButton text={result.tags.join(', ')} field="tags" />
                    </Box>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {result.tags.map((tag, i) => (
                        <Chip key={i} label={tag} size="small" sx={{ bgcolor: '#FFFFFF', border: '1px solid #E5E0D8' }} />
                      ))}
                    </Box>
                  </Box>
                )}

                <Divider sx={{ my: 4 }} />
                
                {/* БЛОК АНАЛИТИКИ ЦЕНЫ (СПУЩЕН ВНИЗ) */}
                <Box sx={{ mb: 4, p: 3, bgcolor: '#FFFFFF', borderRadius: 2, border: '1px solid #E5E0D8' }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 2, color: 'primary.main', textTransform: 'uppercase' }}>
                    Аналитика и ценообразование
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>Предлагаемая цена за товар/работу:</Typography>
                      <Typography variant="h4" sx={{ fontWeight: 800, color: 'secondary.main' }}>{result.suggestedPrice}</Typography>
                    </Box>
                    <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', sm: 'block' } }} />
                    <Box sx={{ flex: 1, minWidth: 250 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <AttachMoneyIcon sx={{ color: 'text.secondary', mt: 0.3 }} />
                        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                          <b>Почему такая цена:</b> {result.priceReasoning}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ bgcolor: 'primary.main', p: 3, borderRadius: 2, color: 'white' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1 }}>Загрузка в магазин {activeMarket?.label}</Typography>
                  <Typography variant="body2" sx={{ mb: 3, opacity: 0.9 }}>
                    Отправить все эти данные в ваш магазин одним кликом (нужна привязка в кабинете).
                  </Typography>
                  <Button 
                    fullWidth variant="contained" sx={{ bgcolor: 'white', color: 'primary.dark', py: 1.5, fontWeight: 700, '&:hover': { bgcolor: '#f0f0f0' } }}
                    onClick={handleApiExport} disabled={exporting}
                    startIcon={<ShoppingBagIcon />}
                  >
                    {exporting ? `Загружаем...` : `Опубликовать товар`}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>

      <Snackbar open={exportSuccess} autoHideDuration={4000} onClose={() => setExportSuccess(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="success" variant="filled" sx={{ width: '100%' }}>Успешно! Товар отправлен в магазин {activeMarket?.label}.</Alert>
      </Snackbar>

      <Snackbar open={exportError} autoHideDuration={5000} onClose={() => setExportError(false)} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity="error" variant="filled" sx={{ width: '100%' }}>Ошибка: {activeMarket?.label} не подключен. Сначала привяжите магазин в "Кабинете".</Alert>
      </Snackbar>
    </Container>
  );
}