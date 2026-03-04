const STORAGE_KEYS = {
  TRANSACTIONS: 'mcb_transactions',
  WALLETS: 'mcb_wallets',
  CATEGORIES: 'mcb_categories',
  PLATFORMS: 'mcb_platforms',
  THEME: 'mcb_theme',
  PRIMARY_CURRENCY: 'mcb_primary_currency',
  SECONDARY_CURRENCY: 'mcb_secondary_currency',
  EXCHANGE_RATES: 'mcb_exchange_rates',
} as const;

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return fallback;
}

export function saveToStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

export { STORAGE_KEYS };
