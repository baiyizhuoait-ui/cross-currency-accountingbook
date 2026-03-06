import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { Transaction, Wallet, Category, Platform, ThemeMode } from '@/types';
import { STORAGE_KEYS, loadFromStorage, saveToStorage } from '@/lib/storage';
import { DEFAULT_CATEGORIES, DEFAULT_PLATFORMS } from '@/lib/defaults';
import { fetchLatestRate, fetchHistoricalRates } from '@/lib/exchangeRates';

interface AppContextType {
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
  refreshRates: () => Promise<void>;
  refreshRates: () => Promise<void>;
}

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

function genId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() =>
    loadFromStorage(STORAGE_KEYS.TRANSACTIONS, [])
  );
  const [wallets, setWallets] = useState<Wallet[]>(() =>
    loadFromStorage(STORAGE_KEYS.WALLETS, [])
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    loadFromStorage(STORAGE_KEYS.CATEGORIES, DEFAULT_CATEGORIES)
  );
  const [platforms, setPlatforms] = useState<Platform[]>(() =>
    loadFromStorage(STORAGE_KEYS.PLATFORMS, DEFAULT_PLATFORMS)
  );
  const [themeColor, setThemeColorState] = useState<string>(() =>
    loadFromStorage(STORAGE_KEYS.THEME_COLOR, 'blue')
  );
  const [theme, setThemeState] = useState<ThemeMode>(() =>
    loadFromStorage(STORAGE_KEYS.THEME, 'light')
  );
  const [primaryCurrency, setPrimaryCurrencyState] = useState<string>(() =>
    loadFromStorage(STORAGE_KEYS.PRIMARY_CURRENCY, 'CNY')
  );
  const [secondaryCurrency, setSecondaryCurrencyState] = useState<string>(() =>
    loadFromStorage(STORAGE_KEYS.SECONDARY_CURRENCY, 'MYR')
  );
  const [latestRate, setLatestRate] = useState(1);
  const [rateLoading, setRateLoading] = useState(false);
  

  // Persist
  useEffect(() => { saveToStorage(STORAGE_KEYS.TRANSACTIONS, transactions); }, [transactions]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.WALLETS, wallets); }, [wallets]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.CATEGORIES, categories); }, [categories]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.PLATFORMS, platforms); }, [platforms]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.THEME, theme); }, [theme]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.PRIMARY_CURRENCY, primaryCurrency); }, [primaryCurrency]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.SECONDARY_CURRENCY, secondaryCurrency); }, [secondaryCurrency]);

  // Theme
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  const refreshRates = useCallback(async () => {
    setRateLoading(true);
    try {
      const rate = await fetchLatestRate(primaryCurrency, secondaryCurrency);
      setLatestRate(rate);
      await fetchHistoricalRates(primaryCurrency, secondaryCurrency, 365);
    } catch {}
    setRateLoading(false);
  }, [primaryCurrency, secondaryCurrency]);

  useEffect(() => {
    refreshRates();
  }, [refreshRates]);

  // CRUD
  const addTransaction = useCallback((t: Omit<Transaction, 'id' | 'createdAt'>) => {
    setTransactions(prev => [{ ...t, id: genId(), createdAt: Date.now() }, ...prev]);
  }, []);
  const updateTransaction = useCallback((t: Transaction) => {
    setTransactions(prev => prev.map(x => x.id === t.id ? t : x));
  }, []);
  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(x => x.id !== id));
  }, []);

  const addWallet = useCallback((w: Omit<Wallet, 'id'>) => {
    setWallets(prev => [...prev, { ...w, id: genId() }]);
  }, []);
  const updateWallet = useCallback((w: Wallet) => {
    setWallets(prev => prev.map(x => x.id === w.id ? w : x));
  }, []);
  const deleteWallet = useCallback((id: string) => {
    setWallets(prev => prev.filter(x => x.id !== id));
  }, []);
  const reorderWallets = useCallback((w: Wallet[]) => setWallets(w), []);

  const addCategory = useCallback((c: Omit<Category, 'id'>) => {
    setCategories(prev => [...prev, { ...c, id: genId() }]);
  }, []);
  const updateCategory = useCallback((c: Category) => {
    setCategories(prev => prev.map(x => x.id === c.id ? c : x));
  }, []);
  const deleteCategory = useCallback((id: string) => {
    if (id === 'transfer') return;
    setCategories(prev => prev.filter(x => x.id !== id));
  }, []);
  const reorderCategories = useCallback((c: Category[]) => setCategories(c), []);

  const addPlatform = useCallback((p: Omit<Platform, 'id'>) => {
    setPlatforms(prev => [...prev, { ...p, id: genId() }]);
  }, []);
  const updatePlatform = useCallback((p: Platform) => {
    setPlatforms(prev => prev.map(x => x.id === p.id ? p : x));
  }, []);
  const deletePlatform = useCallback((id: string) => {
    setPlatforms(prev => prev.filter(x => x.id !== id));
  }, []);

  const setTheme = useCallback((t: ThemeMode) => setThemeState(t), []);
  const setPrimaryCurrency = useCallback((c: string) => {
    setPrimaryCurrencyState(c);
  }, []);
  const setSecondaryCurrency = useCallback((c: string) => {
    setSecondaryCurrencyState(c);
  }, []);

  return (
    <AppContext.Provider value={{
      transactions, wallets, categories, platforms, theme,
      primaryCurrency, secondaryCurrency, latestRate, rateLoading,
      addTransaction, updateTransaction, deleteTransaction,
      addWallet, updateWallet, deleteWallet, reorderWallets,
      addCategory, updateCategory, deleteCategory, reorderCategories,
      addPlatform, updatePlatform, deletePlatform,
      setTheme, setPrimaryCurrency, setSecondaryCurrency, refreshRates,
    }}>
      {children}
    </AppContext.Provider>
  );
}
