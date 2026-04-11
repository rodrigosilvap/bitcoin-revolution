const STORAGE_KEY = 'btc-portfolio-v1';

export type AssetType = 'etf' | 'company' | 'btc';

export interface PortfolioEntry {
  id: string;
  assetType: AssetType;
  ticker: string;
  name: string;
  shares: number;
  costPerShare: number;   // USD per share at purchase
  purchaseDate?: string;  // ISO date string YYYY-MM-DD
  notes?: string;
}

function genId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadPortfolio(): PortfolioEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PortfolioEntry[]) : [];
  } catch {
    return [];
  }
}

export function savePortfolio(entries: PortfolioEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function addEntry(entry: Omit<PortfolioEntry, 'id'>): PortfolioEntry {
  const next = { ...entry, id: genId() };
  savePortfolio([...loadPortfolio(), next]);
  return next;
}

export function updateEntry(id: string, patch: Partial<Omit<PortfolioEntry, 'id'>>): void {
  savePortfolio(loadPortfolio().map(e => (e.id === id ? { ...e, ...patch } : e)));
}

export function deleteEntry(id: string): void {
  savePortfolio(loadPortfolio().filter(e => e.id !== id));
}
