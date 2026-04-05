// ================================================================
// Telegram Notification Service для EthnoTrace AI
// Работает напрямую из браузера — без бэкенда
// ================================================================

const TG_API = 'https://api.telegram.org';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
}

function getConfig(): TelegramConfig | null {
  try {
    const raw = localStorage.getItem('ethnotrace_tg');
    return raw ? (JSON.parse(raw) as TelegramConfig) : null;
  } catch {
    return null;
  }
}

export function saveConfig(config: TelegramConfig): void {
  localStorage.setItem('ethnotrace_tg', JSON.stringify(config));
}

export function clearConfig(): void {
  localStorage.removeItem('ethnotrace_tg');
}

export function isConnected(): boolean {
  const cfg = getConfig();
  return !!(cfg?.botToken && cfg?.chatId);
}

// Базовая отправка
async function send(text: string, parseMode: 'HTML' | 'Markdown' = 'HTML'): Promise<boolean> {
  const cfg = getConfig();
  if (!cfg) return false;

  try {
    const res = await fetch(`${TG_API}/bot${cfg.botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: cfg.chatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
    });
    const data = await res.json();
    return data.ok === true;
  } catch {
    return false;
  }
}

// Получить chat_id из последнего сообщения боту
export async function fetchChatId(botToken: string): Promise<string | null> {
  try {
    const res = await fetch(`${TG_API}/bot${botToken}/getUpdates?limit=1&offset=-1`);
    const data = await res.json();
    if (!data.ok || !data.result.length) return null;
    const update = data.result[data.result.length - 1];
    const chatId =
      update.message?.chat?.id ||
      update.channel_post?.chat?.id ||
      update.callback_query?.from?.id;
    return chatId ? String(chatId) : null;
  } catch {
    return null;
  }
}

// Проверить токен бота
export async function validateBot(botToken: string): Promise<{ ok: boolean; botName?: string }> {
  try {
    const res = await fetch(`${TG_API}/bot${botToken}/getMe`);
    const data = await res.json();
    if (!data.ok) return { ok: false };
    return { ok: true, botName: data.result.username };
  } catch {
    return { ok: false };
  }
}

// ================================================================
// ТИПЫ УВЕДОМЛЕНИЙ
// ================================================================

// 1. Листинг готов (после генерации в Scanner)
export async function notifyListingReady(params: {
  title: string;
  marketplace: string;
  price: string;
  authenticityScore: number;
  esgCo2: number;
}): Promise<boolean> {
  const marketEmoji: Record<string, string> = {
    etsy: '🛍', amazon: '📦', wb: '🟣', ozon: '🔵',
  };
  const emoji = marketEmoji[params.marketplace] || '🛒';
  const craftBadge = params.authenticityScore >= 75 ? '✅ Крафт подтверждён' : '⚠️ Масс-маркет';

  return send(`
${emoji} <b>Листинг готов!</b>

📝 <b>Товар:</b> ${params.title}
💰 <b>Рекомендуемая цена:</b> ${params.price}
🏪 <b>Площадка:</b> ${params.marketplace.toUpperCase()}
${craftBadge} (${params.authenticityScore}/100)
🌿 <b>CO₂ сохранено:</b> ${params.esgCo2} кг vs фабрика

<i>Перейди в кабинет → нажми «Опубликовать»</i>
`);
}

// 2. ESG рейтинг вырос
export async function notifyEsgUpdate(params: {
  productName: string;
  newScore: number;
  co2Saved: number;
  waterSaved: number;
}): Promise<boolean> {
  return send(`
🌿 <b>ESG Рейтинг обновлён!</b>

📦 <b>Товар:</b> ${params.productName}
⭐ <b>Индекс устойчивости:</b> ${params.newScore}/100
☁️ <b>Сохранено CO₂:</b> ${params.co2Saved} кг
💧 <b>Сохранено воды:</b> ${params.waterSaved} л

<i>Эти цифры дают +40% к цене на Etsy</i>
`);
}

// 3. Новый заказ (симуляция)
export async function notifyNewOrder(params: {
  productName: string;
  buyerCountry: string;
  amount: string;
  marketplace: string;
}): Promise<boolean> {
  return send(`
🎉 <b>НОВЫЙ ЗАКАЗ!</b>

📦 <b>Товар:</b> ${params.productName}
🌍 <b>Покупатель из:</b> ${params.buyerCountry}
💵 <b>Сумма:</b> ${params.amount}
🏪 <b>Площадка:</b> ${params.marketplace}

<i>AI-автоответчик уже ответил покупателю</i>
`);
}

// 4. Новый вопрос от покупателя
export async function notifyBuyerQuestion(params: {
  question: string;
  marketplace: string;
  productName: string;
}): Promise<boolean> {
  return send(`
💬 <b>Вопрос от покупателя</b>

🏪 ${params.marketplace} | 📦 ${params.productName}
❓ "${params.question}"

<i>AI-автоответчик уже ответил. Проверь в кабинете.</i>
`);
}

// 5. Еженедельный дайджест трендов (через Gemini)
export async function notifyWeeklyTrends(geminiApiKey: string): Promise<boolean> {
  let trendsText = '';

  if (geminiApiKey) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are a market analyst for Etsy handmade products.
Generate a SHORT weekly trend report for a Kazakh artisan selling handmade products.
Write in Russian. STRICT LIMIT: maximum 800 characters total.
Use this exact structure (no intro phrases like "Привет" or "Вот ваш"):

🔥 Топ-3 категории недели:
- [category] — [1 sentence why]
- [category] — [1 sentence why]  
- [category] — [1 sentence why]

💡 SEO совет: [1 sentence]

💰 Цены: [1 sentence]

Mention real trends: boho, cottagecore, maximalism, quiet luxury etc.`
              }]
            }],
            generationConfig: { temperature: 0.8, maxOutputTokens: 600 },
          }),
        }
      );
      const data = await res.json();
      trendsText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    } catch {
      // сеть недоступна — используем фолбек
    }
  }

  // Фолбек — если ключа нет или Gemini не ответил
  if (!trendsText) {
    trendsText = `🔥 <b>Топ категории этой недели:</b>
- <b>Boho Bags</b> — рост спроса +23%, популярно в США и Германии
- <b>Ethnic Wall Art</b> — казахский орнамент в тренде (cottagecore-волна)
- <b>Handmade Jewelry</b> — средний чек $45–80, ищут "unique"

💡 <b>SEO совет:</b> Добавляй "Kazakhstan" и "Central Asian" в теги — нишевый запрос с низкой конкуренцией.

💰 <b>Цены:</b> Товары с эко-пометкой продаются на 30–40% дороже аналогов без неё.`;
  }

  return send(`📈 <b>Еженедельный дайджест трендов</b>
<i>EthnoTrace AI • ${new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}</i>

${trendsText}

━━━━━━━━━━
<i>Следующий дайджест через 7 дней</i>`);
}

// 6. Приветственное сообщение при подключении
export async function notifyWelcome(artisanName: string): Promise<boolean> {
  return send(`
👋 <b>EthnoTrace AI подключён!</b>

Привет, <b>${artisanName}</b>! 

Теперь ты будешь получать уведомления:
✅ Когда листинг готов
📦 О новых заказах
💬 О вопросах покупателей
📈 Еженедельные тренды Etsy

<b>Удачных продаж на глобальном рынке! 🌍</b>
`);
}

// 7. Тестовое уведомление
export async function notifyTest(): Promise<boolean> {
  return send(`
🤖 <b>EthnoTrace AI — тест связи</b>

✅ Бот подключён и работает!
Ты будешь получать уведомления о листингах, заказах и трендах прямо сюда.

<i>Это сообщение можно удалить</i>
`);
}