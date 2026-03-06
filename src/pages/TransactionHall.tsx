import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { getCurrencySymbol } from '@/lib/currencies';
import { Trash2, X, ChevronDown } from 'lucide-react';
import AddTransactionModal from '@/components/AddTransactionModal';
import CategoryIcon from '@/components/CategoryIcon';

type Filter = 'all' | 'expense' | 'income';

export default function TransactionHall() {
  const { transactions, categories, platforms, wallets } = useApp();
  const { deleteTransaction } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [editTx, setEditTx] = useState<typeof transactions[0] | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const selectedCategory = selectedCategoryId ? categories.find(c => c.id === selectedCategoryId) : null;

  const filtered = transactions
    .filter(t => filter === 'all' || t.type === filter)
    .filter(t => !selectedCategoryId || t.category === selectedCategoryId)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || b.createdAt - a.createdAt);

  const getCategory = (id: string) => categories.find(c => c.id === id);
  const getPlatform = (id: string) => platforms.find(p => p.id === id);
  const getWallet = (id: string) => wallets.find(w => w.id === id);

  // Group by date
  const grouped: Record<string, typeof filtered> = {};
  for (const t of filtered) {
    if (!grouped[t.date]) grouped[t.date] = [];
    grouped[t.date].push(t);
  }

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: '所有记录' },
    { key: 'expense', label: '仅消费' },
    { key: 'income', label: '仅入账' },
  ];

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-foreground mb-5">明细大厅</h2>

      {/* Filters */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => { setFilter(f.key); setSelectedCategoryId(null); }}
            className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
              filter === f.key && !selectedCategoryId ? 'bg-primary text-primary-foreground accent-glow' : 'bg-secondary text-muted-foreground hover:bg-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
        <button
          onClick={() => setShowCategoryPicker(true)}
          className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
            selectedCategoryId ? 'bg-primary text-primary-foreground accent-glow' : 'bg-secondary text-muted-foreground hover:bg-muted'
          }`}
        >
          {selectedCategory ? (
            <>
              <CategoryIcon icon={selectedCategory.icon} color={selectedCategoryId ? 'currentColor' : selectedCategory.color} size={14} />
              {selectedCategory.name}
            </>
          ) : (
            <>选择分类 <ChevronDown className="w-3.5 h-3.5" /></>
          )}
        </button>
      </div>

      {/* Category Picker Modal */}
      {showCategoryPicker && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={() => setShowCategoryPicker(false)}>
          <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm modal-overlay" />
          <div
            className="relative w-full sm:max-w-sm max-h-[60vh] flex flex-col glass-card rounded-t-3xl sm:rounded-3xl modal-content overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold text-foreground">选择分类</h3>
              <button onClick={() => setShowCategoryPicker(false)} className="p-1.5 rounded-xl hover:bg-secondary transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto space-y-1">
              {[...categories].sort((a, b) => a.order - b.order).map(c => (
                <button
                  key={c.id}
                  onClick={() => { setSelectedCategoryId(c.id); setShowCategoryPicker(false); setFilter('all'); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-left transition-colors ${
                    selectedCategoryId === c.id ? 'bg-primary/10 ring-1 ring-primary' : 'hover:bg-secondary'
                  }`}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: (c.color || '#94a3b8') + '20' }}
                  >
                    <CategoryIcon icon={c.icon} color={c.color} size={18} />
                  </div>
                  <span className="text-sm font-medium text-foreground">{c.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Transaction List */}
      {Object.keys(grouped).length === 0 && (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">暂无记录</p>
          <p className="text-sm mt-1">点击右下角 + 按钮添加第一条记录</p>
        </div>
      )}

      {Object.entries(grouped).map(([date, txs]) => (
        <div key={date} className="mb-5">
          <div className="text-sm text-muted-foreground mb-2 px-1">{date}</div>
          <div className="space-y-2">
            {txs.map(t => {
              const cat = getCategory(t.category);
              const plat = getPlatform(t.platformId);
              const wallet = getWallet(t.walletId);
              return (
                <div
                  key={t.id}
                  className="glass-card-hover cursor-pointer relative group"
                  onClick={() => setEditTx(t)}
                  onMouseEnter={() => setHoveredId(t.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <div className="flex items-center gap-3">
                    {/* Category icon */}
                    <div
                      className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: (cat?.color || '#94a3b8') + '20' }}
                    >
                      <CategoryIcon icon={cat?.icon || (t.type === 'income' ? '💰' : '📦')} color={cat?.color} size={20} />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">
                          {t.type === 'income' ? '入账' : cat?.name || t.category}
                        </span>
                        {plat && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-lg text-primary-foreground"
                            style={{ backgroundColor: plat.color }}
                          >
                            {plat.name}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 flex gap-2">
                        {wallet && <span>{wallet.name}</span>}
                        {t.note && <span>· {t.note}</span>}
                      </div>
                    </div>

                    {/* Amount */}
                    <div className="text-right flex-shrink-0">
                      <span className={`text-sm font-semibold ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
                        {t.type === 'income' ? '+' : '-'}{getCurrencySymbol(t.currency)}{t.amount.toFixed(2)}
                      </span>
                      <span className="text-[10px] ml-1 text-muted-foreground">{t.currency}</span>
                    </div>

                    {/* Delete button on hover */}
                    {hoveredId === t.id && (
                      <button
                        onClick={e => { e.stopPropagation(); deleteTransaction(t.id); }}
                        className="absolute right-2 top-2 p-1.5 rounded-xl bg-expense/10 text-expense hover:bg-expense hover:text-primary-foreground transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {editTx && (
        <AddTransactionModal open={!!editTx} onClose={() => setEditTx(null)} editTransaction={editTx} />
      )}
    </div>
  );
}
