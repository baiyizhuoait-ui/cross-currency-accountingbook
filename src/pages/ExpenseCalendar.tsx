import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { getCurrencySymbol } from '@/lib/currencies';
import { getHistoricalRate } from '@/lib/exchangeRates';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function ExpenseCalendar() {
  const { transactions, categories, primaryCurrency, secondaryCurrency } = useApp();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [chartCurrency, setChartCurrency] = useState(primaryCurrency);

  const currencies = [primaryCurrency, secondaryCurrency];
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  // Generate calendar days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();

  // Get expense-only transactions (exclude income and transfer)
  const expenseTransactions = useMemo(() =>
    transactions.filter(t => t.type === 'expense' && t.category !== 'transfer'),
    [transactions]
  );

  // Daily totals for the month
  const dailyTotals = useMemo(() => {
    const totals: Record<string, Record<string, number>> = {};
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      totals[dateStr] = {};
      currencies.forEach(c => { totals[dateStr][c] = 0; });

      const dayTxs = expenseTransactions.filter(t => t.date === dateStr);
      for (const tx of dayTxs) {
        if (totals[dateStr][tx.currency] !== undefined) {
          totals[dateStr][tx.currency] += tx.amount;
        }
      }
    }
    return totals;
  }, [expenseTransactions, year, month, daysInMonth, currencies]);

  // Bar chart data - daily totals converted to chartCurrency using historical rates
  const barData = useMemo(() => {
    const data: { day: number; amount: number; date: string }[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      let total = 0;
      const dayTxs = expenseTransactions.filter(t => t.date === dateStr);
      for (const tx of dayTxs) {
        if (tx.currency === chartCurrency) {
          total += tx.amount;
        } else {
          const rate = getHistoricalRate(tx.currency, chartCurrency, dateStr);
          total += tx.amount * rate;
        }
      }
      if (total > 0) data.push({ day: d, amount: parseFloat(total.toFixed(2)), date: dateStr });
    }
    return data;
  }, [expenseTransactions, daysInMonth, year, month, chartCurrency]);

  // Selected day data
  const selectedDayTxs = selectedDate
    ? expenseTransactions.filter(t => t.date === selectedDate)
    : [];

  const pieData = useMemo(() => {
    if (!selectedDate) return [];
    const catTotals: Record<string, number> = {};
    for (const tx of selectedDayTxs) {
      let amount = tx.amount;
      if (tx.currency !== chartCurrency) {
        amount *= getHistoricalRate(tx.currency, chartCurrency, selectedDate);
      }
      catTotals[tx.category] = (catTotals[tx.category] || 0) + amount;
    }
    return Object.entries(catTotals).map(([catId, value]) => {
      const cat = categories.find(c => c.id === catId);
      return { name: cat?.name || catId, value: parseFloat(value.toFixed(2)), color: cat?.color || '#94a3b8', icon: cat?.icon || '📦' };
    });
  }, [selectedDate, selectedDayTxs, chartCurrency, categories]);

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const calendarCells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) calendarCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) calendarCells.push(d);

  return (
    <div className="max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-foreground mb-5">消费日历</h2>

      {/* Calendar */}
      <div className="glass-card mb-5 overflow-hidden relative">
        {/* Decorative gradient */}
        <div className="absolute inset-0 gradient-primary opacity-5 rounded-3xl" />

        <div className="relative">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-secondary transition-colors">
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <span className="text-lg font-semibold text-foreground">{year}年{month + 1}月</span>
            <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-secondary transition-colors">
              <ChevronRight className="w-5 h-5 text-foreground" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {['日', '一', '二', '三', '四', '五', '六'].map(d => (
              <div key={d} className="text-center text-xs text-muted-foreground py-1">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarCells.map((day, i) => {
              if (day === null) return <div key={i} />;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              const isSelected = selectedDate === dateStr;
              const dayTotal = dailyTotals[dateStr] || {};
              const hasExpense = currencies.some(c => (dayTotal[c] || 0) > 0);

              return (
                <button
                  key={i}
                  onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                  className={`p-1.5 rounded-xl text-center transition-all duration-200 min-h-[52px] flex flex-col items-center justify-start ${
                    isSelected ? 'bg-primary text-primary-foreground accent-glow' : hasExpense ? 'bg-secondary/50 hover:bg-secondary' : 'hover:bg-secondary/30'
                  }`}
                >
                  <span className="text-sm font-medium">{day}</span>
                  {hasExpense && (
                    <div className="mt-0.5 space-y-0">
                      {currencies.map(c => dayTotal[c] > 0 ? (
                        <div key={c} className={`text-[8px] leading-tight ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                          {getCurrencySymbol(c)}{dayTotal[c].toFixed(0)}
                        </div>
                      ) : null)}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Currency switcher */}
      <div className="flex gap-2 mb-4">
        {currencies.map(c => (
          <button
            key={c}
            onClick={() => setChartCurrency(c)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              chartCurrency === c ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Chart area */}
      {!selectedDate ? (
        /* Monthly bar chart */
        <div className="glass-card">
          <h3 className="text-sm font-semibold text-foreground mb-3">月度每日消费统计 ({chartCurrency})</h3>
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData}>
                <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '12px',
                    fontSize: 12,
                  }}
                  formatter={(value: number) => [`${getCurrencySymbol(chartCurrency)}${value}`, '消费']}
                />
                <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-10 text-muted-foreground text-sm">本月暂无消费记录</div>
          )}
        </div>
      ) : (
        /* Selected day pie chart + detail */
        <div className="space-y-4">
          {pieData.length > 0 && (
            <div className="glass-card">
              <h3 className="text-sm font-semibold text-foreground mb-3">{selectedDate} 消费构成 ({chartCurrency})</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
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
                    formatter={(value: number) => [`${getCurrencySymbol(chartCurrency)}${value}`, '']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2">
                {pieData.map(p => (
                  <div key={p.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                    <span>{p.icon} {p.name} {getCurrencySymbol(chartCurrency)}{p.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Day transactions */}
          <div className="glass-card">
            <h3 className="text-sm font-semibold text-foreground mb-3">当日流水</h3>
            {selectedDayTxs.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">当天无消费记录</div>
            ) : (
              <div className="space-y-2">
                {selectedDayTxs.map(t => {
                  const cat = categories.find(c => c.id === t.category);
                  return (
                    <div key={t.id} className="flex items-center gap-3 p-2 rounded-xl bg-secondary/50">
                      <span className="text-lg">{cat?.icon || '📦'}</span>
                      <span className="flex-1 text-sm text-foreground">{cat?.name || t.category}</span>
                      <span className="text-sm font-medium text-expense">
                        -{getCurrencySymbol(t.currency)}{t.amount.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
