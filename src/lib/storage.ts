// Сервис хранения листингов в localStorage
// Потом заменим на Supabase когда подключим реальный auth

export interface SavedListing {
  id: string;
  createdAt: string;
  marketplace: string;
  imageUrl: string;
  title: string;
  description: string;
  suggestedPrice: string;
  craftAuthenticityScore: number;
  esgMetrics: { co2SavedKg: number; waterSavedLiters: number };
  tags?: string[];
  bulletPoints?: string[];
  characteristics?: Record<string, string>;
  status: 'draft' | 'published' | 'archived';
}

const KEY = 'ethnotrace_listings';

export function getListings(): SavedListing[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SavedListing[]) : [];
  } catch {
    return [];
  }
}

export function saveListing(listing: Omit<SavedListing, 'id' | 'createdAt' | 'status'>): SavedListing {
  const all = getListings();
  const newItem: SavedListing = {
    ...listing,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: 'draft',
  };
  all.unshift(newItem); // новые сверху
  localStorage.setItem(KEY, JSON.stringify(all.slice(0, 50))); // макс 50 записей
  return newItem;
}

export function updateListingStatus(id: string, status: SavedListing['status']): void {
  const all = getListings().map(l => l.id === id ? { ...l, status } : l);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteListing(id: string): void {
  const all = getListings().filter(l => l.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function getStats() {
  const all = getListings();
  const published = all.filter(l => l.status === 'published').length;
  const totalCo2 = all.reduce((sum, l) => sum + (l.esgMetrics?.co2SavedKg ?? 0), 0);
  const totalWater = all.reduce((sum, l) => sum + (l.esgMetrics?.waterSavedLiters ?? 0), 0);
  const avgScore = all.length
    ? Math.round(all.reduce((sum, l) => sum + l.craftAuthenticityScore, 0) / all.length)
    : 0;
  return { total: all.length, published, totalCo2, totalWater, avgScore };
}