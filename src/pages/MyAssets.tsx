import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { getCurrencySymbol } from '@/lib/currencies';
import { Plus, ChevronLeft, ChevronRight, Trash2, Settings } from 'lucide-react';

const WALLET_COLORS = [
  '#3b82f6', '#f97316', '#ec4899', '#8b5cf6', '#06b6d4',
  '#ef4444', '#14b8a6', '#a3e635', '#6366f1', '#f43f5e',
  '#fbbf24', '#78716c', '#1677ff', '#07c160', '#0ea5e9',
  '#d946ef', '#f59e0b', '#10b981', '#64748b', '#be123c',
];

export default function MyAssets() {
  const { wallets, transactions, primaryCurrency, secondaryCurrency, latestRate, addWallet, deleteWallet, reorderWallets } = useApp();
  const [displayCurrency, setDisplayCurrency] = useState(primaryCurrency);
  const [managing, setManaging] = useState(false);
  const [newWallet, setNewWallet] = useState({ name: '', currency: primaryCurrency, color: '#3b82f6', balance: '' });
  const [showCreate, setShowCreate] = useState(false);

  const currencies = [primaryCurrency, secondaryCurrency];

  const getWalletBalance = (walletId: string, walletCurrency: string, initialBalance: number) => {
    const walletTxs = transactions.filter(t => t.walletId === walletId);
    let balance = initialBalance;
    for (const t of walletTxs) {
      let amount = t.amount;
      if (t.currency !== walletCurrency) {
        const rate = t.currency === primaryCurrency
          ? (walletCurrency === secondaryCurrency ? latestRate : 1 / latestRate)
          : (walletCurrency === primaryCurrency ? 1 / latestRate : latestRate);
        amount *= rate;
      }
      if (t.type === 'income') balance += amount;
      else balance -= amount;
    }
    return balance;
  };

  const convertToDisplay = (amount: number, fromCurrency: string) => {
    if (fromCurrency === displayCurrency) return amount;
    if (fromCurrency === primaryCurrency && displayCurrency === secondaryCurrency) return amount * latestRate;
    if (fromCurrency === secondaryCurrency && displayCurrency === primaryCurrency) return amount / latestRate;
    return amount;
  };

  const totalAssets = wallets.reduce((sum, w) => {
    const balance = getWalletBalance(w.id, w.currency, w.balance);
    return sum + convertToDisplay(balance, w.currency);
  }, 0);

  const sortedWallets = [...wallets].sort((a, b) => a.order - b.order);

  const moveWallet = (idx: number, dir: -1 | 1) => {
    const arr = [...sortedWallets];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    reorderWallets(arr.map((w, i) => ({ ...w, order: i })));
  };

  const handleCreateWallet = () => {
    if (!newWallet.name.trim()) return;
    addWallet({
      name: newWallet.name.trim(),
      currency: newWallet.currency,
      color: newWallet.color,
      balance: parseFloat(newWallet.balance) || 0,
      order: wallets.length,
    });
    setNewWallet({ name: '', currency: primaryCurrency, color: '#3b82f6', balance: '' });
    setShowCreate(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-foreground mb-5">我的资产</h2>

      {/* Total Assets Card */}
      <div className="gradient-primary rounded-3xl p-6 mb-6 accent-glow-lg">
        <div className="text-primary-foreground/70 text-sm mb-1">净资产总额</div>
        <div className="text-primary-foreground text-3xl font-bold mb-3">
          {getCurrencySymbol(displayCurrency)}{totalAssets.toFixed(2)}
        </div>
        <div className="flex gap-2">
          {currencies.map(c => (
            <button
              key={c}
              onClick={() => setDisplayCurrency(c)}
              className={`px-3 py-1 rounded-xl text-xs font-medium transition-all ${
                displayCurrency === c
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-primary-foreground/10 text-primary-foreground/60 hover:bg-primary-foreground/15'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Manage button */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">我的钱包</h3>
        <button
          onClick={() => setManaging(!managing)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            managing ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          {managing ? '完成' : '管理'}
        </button>
      </div>

      {/* Wallet Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sortedWallets.map((w, idx) => {
          const balance = getWalletBalance(w.id, w.currency, w.balance);
          return (
            <div
              key={w.id}
              className="glass-card relative overflow-hidden"
              style={{ borderColor: w.color + '30' }}
            >
              <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20"
                style={{ backgroundColor: w.color }}
              />
              <div className="relative">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: w.color }} />
                  <span className="text-sm font-medium text-foreground">{w.name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-lg bg-secondary text-muted-foreground">{w.currency}</span>
                </div>
                <div className="text-xl font-bold text-foreground">
                  {getCurrencySymbol(w.currency)}{balance.toFixed(2)}
                </div>
                {managing && (
                  <div className="flex gap-2 mt-3">
                    <button onClick={() => moveWallet(idx, -1)} className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground">
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button onClick={() => moveWallet(idx, 1)} className="p-1.5 rounded-lg bg-secondary text-muted-foreground hover:text-foreground">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteWallet(w.id)} className="p-1.5 rounded-lg bg-expense/10 text-expense hover:bg-expense hover:text-primary-foreground transition-all ml-auto">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Create new wallet card */}
        {!showCreate ? (
          <button
            onClick={() => setShowCreate(true)}
            className="border-2 border-dashed border-muted rounded-3xl p-5 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary hover:text-primary transition-all duration-200 min-h-[120px]"
          >
            <Plus className="w-6 h-6" />
            <span className="text-sm">创建新钱包</span>
          </button>
        ) : (
          <div className="glass-card space-y-3">
            <input
              value={newWallet.name}
              onChange={e => setNewWallet({ ...newWallet, name: e.target.value })}
              placeholder="钱包名称"
              className="w-full bg-secondary text-foreground rounded-xl px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <select
              value={newWallet.currency}
              onChange={e => setNewWallet({ ...newWallet, currency: e.target.value })}
              className="w-full bg-secondary text-foreground rounded-xl px-3 py-2 text-sm outline-none"
            >
              {currencies.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            {/* Color selection */}
            <div>
              <label className="text-xs text-muted-foreground mb-1.5 block">选择颜色</label>
              <div className="flex flex-wrap gap-1.5">
                {WALLET_COLORS.map(c => (
                  <button
                    key={c}
                    onClick={() => setNewWallet({ ...newWallet, color: c })}
                    className={`w-7 h-7 rounded-full transition-all ${
                      newWallet.color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <input
              type="number"
              value={newWallet.balance}
              onChange={e => setNewWallet({ ...newWallet, balance: e.target.value })}
              placeholder="初始余额"
              className="w-full bg-secondary text-foreground rounded-xl px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2 rounded-xl bg-secondary text-muted-foreground text-sm">
                取消
              </button>
              <button onClick={handleCreateWallet} className="flex-1 py-2 rounded-xl gradient-primary text-primary-foreground text-sm font-medium">
                创建
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
