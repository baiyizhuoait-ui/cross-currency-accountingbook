export interface Transaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  currency: string;
  platformId: string;
  walletId: string;
  category: string;
  date: string; // ISO date string YYYY-MM-DD
  note: string;
  createdAt: number;
}

export interface Wallet {
  id: string;
  name: string;
  currency: string;
  color: string;
  balance: number; // initial balance
  order: number;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  order: number;
}

export interface Platform {
  id: string;
  name: string;
  color: string;
}

export interface ExchangeRateCache {
  latest: Record<string, Record<string, number>>;
  latestTimestamp: number;
  historical: Record<string, Record<string, Record<string, number>>>; // date -> from -> to -> rate
  historicalTimestamp: number;
  historicalPair?: string; // track which pair is cached
}

export type ThemeMode = 'light' | 'dark';

export interface AppState {
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
  platforms: Platform[];
  theme: ThemeMode;
  primaryCurrency: string;
  secondaryCurrency: string;
}
