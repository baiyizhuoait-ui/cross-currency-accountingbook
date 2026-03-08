import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { List, Wallet, CalendarDays, BarChart3, Settings } from 'lucide-react';
import { useApp } from '@/contexts/AppContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { translations } from '@/lib/i18n';
import SettingsModal from '@/components/SettingsModal';
import AddTransactionModal from '@/components/AddTransactionModal';

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { language } = useApp();
  const lang = translations[language];
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  const NAV_ITEMS = [
    { path: '/transactions', label: lang.navTransactions, icon: List },
    { path: '/assets', label: lang.navAssets, icon: Wallet },
    { path: '/calendar', label: lang.navCalendar, icon: CalendarDays },
    { path: '/dashboard', label: lang.navDashboard, icon: BarChart3 },
  ];

  const isActive = (path: string) => location.pathname === path;

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <header className="glass sticky top-0 z-30 flex items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold text-foreground">{lang.appName}</h1>
          <button onClick={() => setSettingsOpen(true)} className="p-2 rounded-xl hover:bg-secondary transition-colors">
            <Settings className="w-5 h-5 text-muted-foreground" />
          </button>
        </header>

        <main className="flex-1 overflow-auto pb-24 px-4 pt-3">
          {children}
        </main>

        <button
          onClick={() => setAddOpen(true)}
          className="fab-button w-14 h-14 bottom-24 right-5 text-primary-foreground"
        >
          <span className="text-2xl font-light">+</span>
        </button>

        <nav className="glass fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around py-2 px-2 safe-area-bottom">
          {NAV_ITEMS.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive(item.path) ? 'tab-active' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </button>
          ))}
        </nav>

        <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
        <AddTransactionModal open={addOpen} onClose={() => setAddOpen(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      <aside className="glass w-56 flex-shrink-0 flex flex-col border-r border-border/50 sticky top-0 h-screen">
        <div className="p-5">
          <h1 className="text-lg font-bold text-foreground">{lang.appNameIcon}</h1>
        </div>
        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm transition-all duration-200 ${
                isActive(item.path)
                  ? 'gradient-primary text-primary-foreground accent-glow font-semibold'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-3">
          <button
            onClick={() => setSettingsOpen(true)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
          >
            <Settings className="w-5 h-5" />
            <span>{lang.navSettings}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-6 relative">
        {children}
        <button
          onClick={() => setAddOpen(true)}
          className="fab-button w-16 h-16 bottom-8 right-8 text-primary-foreground"
        >
          <span className="text-3xl font-light">+</span>
        </button>
      </main>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <AddTransactionModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
