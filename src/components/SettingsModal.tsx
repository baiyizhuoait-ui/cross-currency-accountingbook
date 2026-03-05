import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import CategoryIcon from '@/components/CategoryIcon';
import { SUPPORTED_CURRENCIES } from '@/lib/currencies';
import { Sun, Moon, X, Plus, Trash2, ArrowUp, ArrowDown, GripVertical, Check, ChevronRight, Search } from 'lucide-react';
import { toast } from 'sonner';
import AddCategoryModal from './AddCategoryModal';
import AddPlatformModal from './AddPlatformModal';

interface Props {
  open: boolean;
  onClose: () => void;
}

type SettingsTab = 'general' | 'platforms' | 'categories';
type CurrencyPickerTarget = 'primary' | 'secondary' | null;

export default function SettingsModal({ open, onClose }: Props) {
  const app = useApp();
  const [tab, setTab] = useState<SettingsTab>('general');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddPlatform, setShowAddPlatform] = useState(false);
  const [currencyPicker, setCurrencyPicker] = useState<CurrencyPickerTarget>(null);
  const [currencySearch, setCurrencySearch] = useState('');

  if (!open) return null;

  const tabs: { key: SettingsTab; label: string }[] = [
    { key: 'general', label: '常规' },
    { key: 'platforms', label: '平台管理' },
    { key: 'categories', label: '分类管理' },
  ];

  const moveCategory = (idx: number, dir: -1 | 1) => {
    const sorted = [...app.categories].sort((a, b) => a.order - b.order);
    const target = idx + dir;
    if (target < 0 || target >= sorted.length) return;
    const temp = sorted[idx].order;
    sorted[idx] = { ...sorted[idx], order: sorted[target].order };
    sorted[target] = { ...sorted[target], order: temp };
    app.reorderCategories(sorted);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
        <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm modal-overlay" />
        <div
          className="relative w-full max-w-md max-h-[85vh] overflow-auto glass-card rounded-3xl modal-content"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-foreground">设置中心</h2>
            <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-secondary transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-5">
            {tabs.map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                  tab === t.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* General */}
          {tab === 'general' && (
            <div className="space-y-5">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">外观模式</label>
                <div className="flex gap-2">
                  {([['light', '浅色', Sun], ['dark', '深色', Moon]] as const).map(([mode, label, Icon]) => (
                    <button
                      key={mode}
                      onClick={() => app.setTheme(mode)}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm transition-all ${
                        app.theme === mode ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">主要货币</label>
                <button
                  onClick={() => { setCurrencyPicker('primary'); setCurrencySearch(''); }}
                  className="w-full flex items-center justify-between bg-secondary text-foreground rounded-2xl px-4 py-3 text-sm hover:bg-secondary/80 transition-colors"
                >
                  <span>{SUPPORTED_CURRENCIES.find(c => c.code === app.primaryCurrency)?.symbol} {app.primaryCurrency} - {SUPPORTED_CURRENCIES.find(c => c.code === app.primaryCurrency)?.nameZh}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">次要货币</label>
                <button
                  onClick={() => { setCurrencyPicker('secondary'); setCurrencySearch(''); }}
                  className="w-full flex items-center justify-between bg-secondary text-foreground rounded-2xl px-4 py-3 text-sm hover:bg-secondary/80 transition-colors"
                >
                  <span>{SUPPORTED_CURRENCIES.find(c => c.code === app.secondaryCurrency)?.symbol} {app.secondaryCurrency} - {SUPPORTED_CURRENCIES.find(c => c.code === app.secondaryCurrency)?.nameZh}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </div>
          )}

          {/* Platforms */}
          {tab === 'platforms' && (
            <div className="space-y-3">
              {app.platforms.map(p => (
                <div key={p.id} className="flex items-center gap-3 bg-secondary rounded-2xl p-3">
                  <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="flex-1 text-sm text-foreground">{p.name}</span>
                  <button onClick={() => app.deletePlatform(p.id)} className="text-muted-foreground hover:text-expense transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => setShowAddPlatform(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-muted text-muted-foreground hover:border-primary hover:text-primary transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">添加平台</span>
              </button>
            </div>
          )}

          {/* Categories */}
          {tab === 'categories' && (
            <div className="space-y-2">
              {[...app.categories].sort((a, b) => a.order - b.order).map((c, idx) => (
                <div key={c.id} className="flex items-center gap-2 bg-secondary rounded-2xl p-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  <CategoryIcon icon={c.icon} color={c.color} size={20} />
                  <span className="flex-1 text-sm text-foreground">{c.name}</span>
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }} />
                  <button onClick={() => moveCategory(idx, -1)} className="text-muted-foreground hover:text-foreground">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => moveCategory(idx, 1)} className="text-muted-foreground hover:text-foreground">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  {c.id !== 'transfer' && (
                    <button onClick={() => app.deleteCategory(c.id)} className="text-muted-foreground hover:text-expense">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={() => setShowAddCategory(true)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-muted text-muted-foreground hover:border-primary hover:text-primary transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                <span className="text-sm font-medium">添加分类</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* iOS-style Currency Picker Overlay */}
      {currencyPicker && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" onClick={() => setCurrencyPicker(null)}>
          <div className="fixed inset-0 bg-foreground/30 backdrop-blur-sm modal-overlay" />
          <div
            className="relative w-full sm:max-w-sm max-h-[75vh] flex flex-col glass-card rounded-t-3xl sm:rounded-3xl modal-content overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 pt-5 pb-3">
              <h3 className="text-base font-semibold text-foreground">
                {currencyPicker === 'primary' ? '选择主要货币' : '选择次要货币'}
              </h3>
              <button onClick={() => setCurrencyPicker(null)} className="p-1.5 rounded-xl hover:bg-secondary transition-colors">
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="px-5 pb-3">
              <div className="flex items-center gap-2 bg-secondary/80 rounded-xl px-3 py-2.5">
                <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <input
                  type="text"
                  value={currencySearch}
                  onChange={e => setCurrencySearch(e.target.value)}
                  placeholder="搜索货币..."
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-5 pb-5">
              <div className="rounded-2xl overflow-hidden bg-secondary/50 backdrop-blur-md">
                {SUPPORTED_CURRENCIES
                  .filter(c => {
                    if (!currencySearch) return true;
                    const q = currencySearch.toLowerCase();
                    return c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.nameZh.includes(q);
                  })
                  .map((c, i, arr) => {
                    const currentValue = currencyPicker === 'primary' ? app.primaryCurrency : app.secondaryCurrency;
                    const isSelected = c.code === currentValue;
                    return (
                      <button
                        key={c.code}
                        onClick={() => {
                          const otherValue = currencyPicker === 'primary' ? app.secondaryCurrency : app.primaryCurrency;
                          if (c.code === otherValue) {
                            toast.error('主要货币与次要货币不能相同', { description: `${c.nameZh} (${c.code}) 已被设为${currencyPicker === 'primary' ? '次要' : '主要'}货币` });
                            return;
                          }
                          if (currencyPicker === 'primary') {
                            app.setPrimaryCurrency(c.code);
                          } else {
                            app.setSecondaryCurrency(c.code);
                          }
                          app.refreshRates();
                          setCurrencyPicker(null);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-secondary/80 ${
                          i < arr.length - 1 ? 'border-b border-border/30' : ''
                        }`}
                      >
                        <span className="w-8 text-center text-lg">{c.symbol}</span>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground">{c.nameZh}</span>
                          <span className="text-xs text-muted-foreground ml-2">{c.code}</span>
                        </div>
                        {isSelected && <Check className="w-4.5 h-4.5 text-primary flex-shrink-0" />}
                      </button>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      <AddCategoryModal
        open={showAddCategory}
        onClose={() => setShowAddCategory(false)}
        onAdd={(data) => {
          const maxOrder = Math.max(...app.categories.map(c => c.order), -1);
          app.addCategory({ ...data, order: maxOrder + 1 });
          setShowAddCategory(false);
        }}
      />

      <AddPlatformModal
        open={showAddPlatform}
        onClose={() => setShowAddPlatform(false)}
        onAdd={(data) => {
          app.addPlatform(data);
          setShowAddPlatform(false);
        }}
      />
    </>
  );
}
