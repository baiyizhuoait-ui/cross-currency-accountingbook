import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { getCurrencySymbol } from '@/lib/currencies';
import { getHistoricalRateForChart, getLatestCachedRate, getCachedHistoricalDates } from '@/lib/exchangeRates';
import { ArrowRightLeft } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

type Period = '5d' | '1m' | '3m' | '1y';

export default function DataDashboard() {
  const { transactions, categories, wallets, platforms, primaryCurrency, secondaryCurrency, latestRate } = useApp();
  const [reversed, setReversed] = useState(false);
  const [period, setPeriod] = useState<Period>('1m');
  const [filterWallet, setFilterWallet] = useState('all');
  const [filterPlatform, setFilterPlatform] = useState('all');

  const fromCur = reversed ? secondaryCurrency : primaryCurrency;
  const toCur = reversed ? primaryCurrency : secondaryCurrency;
  const currentRate = reversed ? (latestRate ? 1 / latestRate : 1) : latestRate;

  // Rate chart data
  const chartData = useMemo(() => {
    const dates = getCachedHistoricalDates();
    const now = new Date();
    let cutoff = new Date();
    if (period === '5d') cutoff.setDate(now.getDate() - 5);
    else if (period === '1m') cutoff.setMonth(now.getMonth() - 1);
    else if (period === '3m') cutoff.setMonth(now.getMonth() - 3);
    else cutoff.setFullYear(now.getFullYear() - 1);

    const cutoffStr = cutoff.toISOString().split('T')[0];
    return dates
      .filter(d => d >= cutoffStr)
      .map(d => {
        let rate = getHistoricalRateForChart(primaryCurrency, secondaryCurrency, d);
        if (rate && reversed) rate = 1 / rate;
        return rate ? { date: d.slice(5), rate: parseFloat(rate.toFixed(4)) } : null;
      })
      .filter(Boolean) as { date: string; rate: number }[];
  }, [period, reversed, primaryCurrency, secondaryCurrency]);

  // Expense pie data (exclude income and transfer)
  const pieData = useMemo(() => {
    const filtered = transactions.filter(t => {
      if (t.type === 'income' || t.category === 'transfer') return false;
      if (filterWallet !== 'all' && t.walletId !== filterWallet) return false;
      if (filterPlatform !== 'all' && t.platformId !== filterPlatform) return false;
      return true;
    });

    const catTotals: Record<string, number> = {};
    for (const tx of filtered) {
      // Convert all to primaryCurrency using latest rate
      let amount = tx.amount;
      if (tx.currency !== primaryCurrency) {
        amount /= latestRate || 1;
      }
      catTotals[tx.category] = (catTotals[tx.category] || 0) + amount;
    }

    return Object.entries(catTotals)
      .map(([catId, value]) => {
        const cat = categories.find(c => c.id === catId);
        return { name: cat?.name || catId, value: parseFloat(value.toFixed(2)), color: cat?.color || '#94a3b8', icon: cat?.icon || '📦' };
      })
      .sort((a, b) => b.value - a.value);
  }, [transactions, categories, filterWallet, filterPlatform, primaryCurrency, latestRate]);

  const periods: { key: Period; label: string }[] = [
    { key: '5d', label: '5天' },
    { key: '1m', label: '一月' },
    { key: '3m', label: '三月' },
    { key: '1y', label: '一年' },
  ];

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-foreground mb-5">数据看板</h2>

      {/* Exchange Rate Chart */}
      <div className="glass-card mb-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-sm text-muted-foreground">{fromCur} → {toCur}</div>
            <div className="text-2xl font-bold text-foreground">{currentRate.toFixed(4)}</div>
          </div>
          <button
            onClick={() => setReversed(!reversed)}
            className="p-2.5 rounded-2xl bg-secondary hover:bg-muted transition-all text-foreground"
          >
            <ArrowRightLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Period filters */}
        <div className="flex gap-2 mb-4">
          {periods.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                period === p.key ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <XAxis dataKey="date" tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 9 }} stroke="hsl(var(--muted-foreground))" />
              <Tooltip
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '12px',
                  fontSize: 12,
                }}
                formatter={(value: number) => [value.toFixed(4), `${fromCur}→${toCur}`]}
              />
              <Line type="monotone" dataKey="rate" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-10 text-muted-foreground text-sm">暂无汇率数据，请等待加载...</div>
        )}
      </div>

      {/* Expense Category Pie */}
      <div className="glass-card">
        <h3 className="text-lg font-semibold text-foreground mb-4">总消费分类汇总</h3>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <select
            value={filterWallet}
            onChange={e => setFilterWallet(e.target.value)}
            className="bg-secondary text-foreground rounded-xl px-3 py-2 text-sm outline-none flex-1"
          >
            <option value="all">所有钱包</option>
            {wallets.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
          <select
            value={filterPlatform}
            onChange={e => setFilterPlatform(e.target.value)}
            className="bg-secondary text-foreground rounded-xl px-3 py-2 text-sm outline-none flex-1"
          >
            <option value="all">所有平台</option>
            {platforms.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        {pieData.length > 0 ? (
          <>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [`${getCurrencySymbol(primaryCurrency)}${value}`, '']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-3">
              {pieData.map(p => (
                <div key={p.name} className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                  <span>{p.icon} {p.name}</span>
                  <span className="font-medium text-foreground">{getCurrencySymbol(primaryCurrency)}{p.value}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-10 text-muted-foreground text-sm">暂无消费数据</div>
        )}
      </div>
    </div>
  );
}
