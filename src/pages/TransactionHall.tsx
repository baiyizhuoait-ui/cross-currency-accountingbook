import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { getCurrencySymbol } from '@/lib/currencies';
import { Trash2, X } from 'lucide-react';
import AddTransactionModal from '@/components/AddTransactionModal';
import CategoryIcon from '@/components/CategoryIcon';

type Filter = 'all' | 'expense' | 'income';

export default function TransactionHall() {
  const { transactions, categories, platforms, wallets } = useApp();
  const { deleteTransaction } = useApp();
  const [filter, setFilter] = useState<Filter>('all');
  const [editTx, setEditTx] = useState<typeof transactions[0] | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = transactions
    .filter(t => filter === 'all' || t.type === filter)
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
      <div className="flex gap-2 mb-5">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
              filter === f.key ? 'bg-primary text-primary-foreground accent-glow' : 'bg-secondary text-muted-foreground hover:bg-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

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
