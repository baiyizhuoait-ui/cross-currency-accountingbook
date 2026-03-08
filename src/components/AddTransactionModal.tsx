import { useState, useEffect, useMemo, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { translations, getCategoryDisplayName } from '@/lib/i18n';
import type { Transaction } from '@/types';
import { getCurrencySymbol } from '@/lib/currencies';
import CategoryIcon from '@/components/CategoryIcon';
import MobileTimePicker from '@/components/MobileTimePicker';

interface Props {
  open: boolean;
  onClose: () => void;
  editTransaction?: Transaction | null;
}

export default function AddTransactionModal({ open, onClose, editTransaction }: Props) {
  const { wallets, categories, platforms, primaryCurrency, secondaryCurrency, addTransaction, updateTransaction, language } = useApp();
  const lang = translations[language];

  const isTouchDevice = useMemo(() =>
    typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0),
  []);

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(primaryCurrency);
  const [walletId, setWalletId] = useState('');
  const [platformId, setPlatformId] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
  const [note, setNote] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editTransaction) {
      setType(editTransaction.type);
      setAmount(editTransaction.amount.toString());
      setCurrency(editTransaction.currency);
      setWalletId(editTransaction.walletId);
      setPlatformId(editTransaction.platformId);
      setCategory(editTransaction.category);
      setDate(editTransaction.date);
      setNote(editTransaction.note);
    } else {
      setType('expense');
      setAmount('');
      setCurrency(primaryCurrency);
      setWalletId(wallets[0]?.id || '');
      setPlatformId(platforms[0]?.id || '');
      setCategory('');
      setDate(new Date().toISOString().slice(0, 16));
      setNote('');
    }
  }, [editTransaction, open, primaryCurrency, wallets, platforms]);

  // Auto-focus amount input on mobile when adding new
  useEffect(() => {
    if (open && !editTransaction && amountRef.current) {
      setTimeout(() => amountRef.current?.focus(), 350);
    }
  }, [open, editTransaction]);

  const displayDate = useMemo(() => {
    if (!date) return '';
    const [d, t] = date.split('T');
    return `${d}  ${t || '00:00'}`;
  }, [date]);

  if (!open) return null;

  const handleAmountChange = (val: string) => {
    const num = parseFloat(val);
    if (val !== '' && num < 0) return;
    setAmount(val);
  };

  const handleSubmit = () => {
    const amt = parseFloat(amount);
    if (!amt || amt < 0 || !walletId || !platformId || (type === 'expense' && !category)) return;

    const data = {
      type, amount: amt, currency, walletId, platformId,
      category: type === 'income' ? 'income' : category,
      date, note,
    };

    if (editTransaction) {
      updateTransaction({ ...editTransaction, ...data });
    } else {
      addTransaction(data);
    }
    onClose();
  };

  const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
  const currencies = [primaryCurrency, secondaryCurrency];

  const displayDate = useMemo(() => {
    if (!date) return '';
    const [d, t] = date.split('T');
    return `${d}  ${t || '00:00'}`;
  }, [date]);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm modal-overlay" />
      <div
        className="relative w-full sm:max-w-lg max-h-[90vh] overflow-auto glass-card rounded-t-3xl sm:rounded-3xl modal-content"
        onClick={e => e.stopPropagation()}
      >
        {/* Type + Currency toggle */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {(['expense', 'income'] as const).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  type === t
                    ? t === 'expense' ? 'bg-expense text-primary-foreground' : 'bg-income text-primary-foreground'
                    : 'bg-secondary text-muted-foreground'
                }`}
              >
                {t === 'expense' ? lang.expense : lang.income}
              </button>
            ))}
          </div>
          <div className="flex gap-1">
            {currencies.map(c => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                  currency === c ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Amount */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <span className="text-2xl text-muted-foreground">{getCurrencySymbol(currency)}</span>
          <input
            ref={amountRef}
            type="number"
            inputMode="decimal"
            value={amount}
            onChange={e => handleAmountChange(e.target.value)}
            min="0"
            placeholder="0.00"
            className="text-4xl font-bold bg-transparent border-none outline-none w-full text-foreground placeholder:text-muted"
          />
        </div>

        {/* Wallet + Platform */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{lang.wallet}</label>
            <select
              value={walletId}
              onChange={e => setWalletId(e.target.value)}
              className="w-full bg-secondary text-foreground rounded-xl px-3 py-2.5 text-sm outline-none border-none"
            >
              {wallets.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{lang.platform}</label>
            <select
              value={platformId}
              onChange={e => setPlatformId(e.target.value)}
              className="w-full bg-secondary text-foreground rounded-xl px-3 py-2.5 text-sm outline-none border-none"
            >
              {platforms.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Categories grid (expense only) */}
        {type === 'expense' && (
          <div className="mb-4">
            <label className="text-xs text-muted-foreground mb-2 block">{lang.category}</label>
            <div className="grid grid-cols-5 gap-2">
              {sortedCategories.map(c => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`category-icon-btn ${category === c.id ? 'selected' : ''}`}
                >
                  <CategoryIcon icon={c.icon} color={c.color} size={22} />
                  <span className="text-[10px] text-muted-foreground">{getCategoryDisplayName(language, c.id, c.name)}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date + Note */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{lang.time}</label>
            {isTouchDevice ? (
              <button
                onClick={() => setShowTimePicker(true)}
                className="w-full bg-secondary text-foreground rounded-xl px-3 py-2.5 text-sm text-left outline-none"
              >
                {displayDate}
              </button>
            ) : (
              <input
                type="datetime-local"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-secondary text-foreground rounded-xl px-3 py-2.5 text-sm outline-none"
              />
            )}
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">{lang.note}</label>
            <input
              type="text"
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder={lang.notePlaceholder}
              className="w-full bg-secondary text-foreground rounded-xl px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="w-full gradient-primary text-primary-foreground py-3.5 rounded-2xl font-semibold accent-glow transition-all duration-200 hover:opacity-90"
        >
          {editTransaction ? lang.saveChanges : lang.addRecord}
        </button>
      </div>

      {showTimePicker && (
        <MobileTimePicker
          value={date}
          onChange={setDate}
          onClose={() => setShowTimePicker(false)}
        />
      )}
    </div>
  );
}
