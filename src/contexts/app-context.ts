import { createContext } from 'react';
import type { Transaction, Wallet, Category, Platform, ThemeMode } from '@/types';
import type { Language } from '@/lib/i18n';

export interface AppContextType {
  transactions: Transaction[];
  wallets: Wallet[];
  categories: Category[];
  platforms: Platform[];
  theme: ThemeMode;
  themeColor: string;
  primaryCurrency: string;
  secondaryCurrency: string;
  latestRate: number;
  rateLoading: boolean;
  language: Language;

  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;

  addWallet: (w: Omit<Wallet, 'id'>) => void;
  updateWallet: (w: Wallet) => void;
  deleteWallet: (id: string) => void;
  reorderWallets: (wallets: Wallet[]) => void;

  addCategory: (c: Omit<Category, 'id'>) => void;
  updateCategory: (c: Category) => void;
  deleteCategory: (id: string) => void;
  reorderCategories: (cats: Category[]) => void;

  addPlatform: (p: Omit<Platform, 'id'>) => void;
  updatePlatform: (p: Platform) => void;
  deletePlatform: (id: string) => void;

  setTheme: (t: ThemeMode) => void;
  setThemeColor: (c: string) => void;
  setPrimaryCurrency: (c: string) => void;
  setSecondaryCurrency: (c: string) => void;
  setLanguage: (l: Language) => void;
  refreshRates: () => Promise<void>;
}

export const AppContext = createContext<AppContextType | null>(null);
