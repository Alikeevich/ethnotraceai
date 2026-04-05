import { notifyWeeklyTrends, isConnected } from './telegram';

export function initWeeklyTrends(geminiKey: string) {
  const lastSent = localStorage.getItem('tg_last_trend');
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  if (!lastSent || Number(lastSent) < weekAgo) {
    if (isConnected()) {
      notifyWeeklyTrends(geminiKey).then((ok) => {
        if (ok) localStorage.setItem('tg_last_trend', String(Date.now()));
      });
    }
  }
}