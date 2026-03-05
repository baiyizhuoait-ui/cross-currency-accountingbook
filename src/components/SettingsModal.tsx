import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { SUPPORTED_CURRENCIES } from '@/lib/currencies';
import { Sun, Moon, X, Plus, Trash2, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';
import AddCategoryModal from './AddCategoryModal';
import AddPlatformModal from './AddPlatformModal';

interface Props {
  open: boolean;
  onClose: () => void;
}

type SettingsTab = 'general' | 'platforms' | 'categories';

export default function SettingsModal({ open, onClose }: Props) {
  const app = useApp();
  const [tab, setTab] = useState<SettingsTab>('general');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddPlatform, setShowAddPlatform] = useState(false);

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
                <select
                  value={app.primaryCurrency}
                  onChange={e => { app.setPrimaryCurrency(e.target.value); app.refreshRates(); }}
                  className="w-full bg-secondary text-foreground rounded-xl px-3 py-2.5 text-sm outline-none"
                >
                  {SUPPORTED_CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.nameZh}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">次要货币</label>
                <select
                  value={app.secondaryCurrency}
                  onChange={e => { app.setSecondaryCurrency(e.target.value); app.refreshRates(); }}
                  className="w-full bg-secondary text-foreground rounded-xl px-3 py-2.5 text-sm outline-none"
                >
                  {SUPPORTED_CURRENCIES.map(c => (
                    <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.nameZh}</option>
                  ))}
                </select>
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
                  <span className="text-lg">{c.icon}</span>
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
