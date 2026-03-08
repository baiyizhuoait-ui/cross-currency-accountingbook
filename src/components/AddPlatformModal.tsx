import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { translations } from '@/lib/i18n';
import { X } from 'lucide-react';

interface Props {
  open: boolean;
  onClose: () => void;
  onAdd: (data: { name: string; color: string }) => void;
}

const COLOR_OPTIONS = [
  '#f97316', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4',
  '#ef4444', '#14b8a6', '#a3e635', '#6366f1', '#f43f5e',
  '#fbbf24', '#78716c', '#1677ff', '#07c160', '#0ea5e9',
  '#d946ef', '#f59e0b', '#10b981', '#64748b', '#be123c',
];

export default function AddPlatformModal({ open, onClose, onAdd }: Props) {
  const { language } = useApp();
  const lang = translations[language];
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3b82f6');

  if (!open) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim(), color });
    setName('');
    setColor('#3b82f6');
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm" />
      <div
        className="relative w-full sm:max-w-sm max-h-[90vh] overflow-auto glass-card rounded-t-3xl sm:rounded-3xl modal-content"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-foreground">{lang.addPlatformTitle}</h2>
          <button onClick={onClose} className="p-1.5 rounded-xl hover:bg-secondary transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="flex items-center justify-center mb-5">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: color + '20' }}>
            <div className="w-6 h-6 rounded-full" style={{ backgroundColor: color }} />
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs text-muted-foreground mb-1 block">{lang.platformName}</label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={lang.platformNamePlaceholder}
            className="w-full bg-secondary text-foreground rounded-xl px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground"
            autoFocus
          />
        </div>

        <div className="mb-6">
          <label className="text-xs text-muted-foreground mb-2 block">{lang.chooseColor}</label>
          <div className="flex flex-wrap gap-2">
            {COLOR_OPTIONS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className={`w-8 h-8 rounded-full transition-all ${
                  color === c ? 'ring-2 ring-offset-2 ring-primary scale-110' : 'hover:scale-105'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full gradient-primary text-primary-foreground py-3 rounded-2xl font-semibold accent-glow transition-all duration-200 hover:opacity-90"
        >
          {lang.addPlatformBtn}
        </button>
      </div>
    </div>
  );
}
