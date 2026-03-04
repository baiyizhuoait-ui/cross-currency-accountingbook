import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { SUPPORTED_CURRENCIES } from '@/lib/currencies';
import { Sun, Moon, X, Plus, Trash2, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
}

type SettingsTab = 'general' | 'platforms' | 'categories';

const EMOJI_OPTIONS = ['🍜','🚗','🛍️','🏠','🎮','🏥','📚','🧴','📱','👗','🍻','📦','✈️','🎵','🐾','💼','🎁','💳','🔧','☕'];
const COLOR_OPTIONS = ['#f97316','#3b82f6','#ec4899','#8b5cf6','#06b6d4','#ef4444','#14b8a6','#a3e635','#6366f1','#f43f5e','#fbbf24','#78716c','#1677ff','#07c160'];

export default function SettingsModal({ open, onClose }: Props) {
  const app = useApp();
  const [tab, setTab] = useState<SettingsTab>('general');
  const [newPlatformName, setNewPlatformName] = useState('');
  const [newPlatformColor, setNewPlatformColor] = useState('#3b82f6');
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📦');
  const [newCatColor, setNewCatColor] = useState('#3b82f6');

  if (!open) return null;

  const tabs: { key: SettingsTab; label: string }[] = [
    { key: 'general', label: '常规' },
    { key: 'platforms', label: '平台管理' },
    { key: 'categories', label: '分类管理' },
  ];

  const handleAddPlatform = () => {
    if (!newPlatformName.trim()) return;
    app.addPlatform({ name: newPlatformName.trim(), color: newPlatformColor });
    setNewPlatformName('');
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const maxOrder = Math.max(...app.categories.map(c => c.order), -1);
    app.addCategory({ name: newCatName.trim(), icon: newCatIcon, color: newCatColor, order: maxOrder + 1 });
    setNewCatName('');
  };

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
            <div className="flex gap-2 mt-3">
              <input
                value={newPlatformName}
                onChange={e => setNewPlatformName(e.target.value)}
                placeholder="平台名称"
                className="flex-1 bg-secondary text-foreground rounded-xl px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
              />
              <input
                type="color"
                value={newPlatformColor}
                onChange={e => setNewPlatformColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer bg-transparent"
              />
              <button onClick={handleAddPlatform} className="p-2 bg-primary text-primary-foreground rounded-xl">
                <Plus className="w-4 h-4" />
              </button>
            </div>
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

            {/* Add category */}
            <div className="border-t border-border pt-3 mt-3 space-y-2">
              <div className="flex gap-2">
                <input
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  placeholder="分类名称"
                  className="flex-1 bg-secondary text-foreground rounded-xl px-3 py-2 text-sm outline-none placeholder:text-muted-foreground"
                />
                <button onClick={handleAddCategory} className="p-2 bg-primary text-primary-foreground rounded-xl">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">图标</label>
                <div className="flex flex-wrap gap-1.5">
                  {EMOJI_OPTIONS.map(e => (
                    <button
                      key={e}
                      onClick={() => setNewCatIcon(e)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all ${
                        newCatIcon === e ? 'ring-2 ring-primary bg-primary/10' : 'bg-secondary hover:bg-muted'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">颜色</label>
                <div className="flex flex-wrap gap-1.5">
                  {COLOR_OPTIONS.map(c => (
                    <button
                      key={c}
                      onClick={() => setNewCatColor(c)}
                      className={`w-7 h-7 rounded-full transition-all ${
                        newCatColor === c ? 'ring-2 ring-offset-2 ring-primary' : ''
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
