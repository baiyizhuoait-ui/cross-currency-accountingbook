import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { translations } from '@/lib/i18n';

interface Props {
  value: string; // YYYY-MM-DDTHH:mm
  onChange: (value: string) => void;
  onClose: () => void;
}

function WheelColumn({ values, selected, onChange, label }: {
  values: number[];
  selected: number;
  onChange: (v: number) => void;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const ITEM_H = 44;
  const programmatic = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const idx = values.indexOf(selected);
    if (ref.current && idx >= 0) {
      programmatic.current = true;
      ref.current.scrollTop = idx * ITEM_H;
      setTimeout(() => { programmatic.current = false; }, 200);
    }
  }, [selected, values]);

  const handleScroll = useCallback(() => {
    if (programmatic.current) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!ref.current) return;
      const idx = Math.round(ref.current.scrollTop / ITEM_H);
      const clamped = Math.max(0, Math.min(idx, values.length - 1));
      if (values[clamped] !== selected) {
        onChange(values[clamped]);
      }
    }, 100);
  }, [values, selected, onChange]);

  return (
    <div className="flex flex-col items-center flex-1">
      <span className="text-xs text-muted-foreground mb-1">{label}</span>
      <div className="relative h-[220px] w-full overflow-hidden rounded-xl bg-secondary/50">
        <div className="absolute left-1 right-1 top-[88px] h-[44px] bg-primary/10 rounded-lg pointer-events-none z-10" />
        <div className="absolute inset-x-0 top-0 h-[88px] bg-gradient-to-b from-secondary/80 to-transparent pointer-events-none z-10 rounded-t-xl" />
        <div className="absolute inset-x-0 bottom-0 h-[88px] bg-gradient-to-t from-secondary/80 to-transparent pointer-events-none z-10 rounded-b-xl" />
        <div
          ref={ref}
          className="h-full overflow-y-auto scrollbar-hide"
          onScroll={handleScroll}
          style={{ scrollSnapType: 'y mandatory', scrollPaddingTop: 88 }}
        >
          <div style={{ height: 88 }} />
          {values.map(v => (
            <div
              key={v}
              className={`flex items-center justify-center text-lg font-medium select-none ${
                v === selected ? 'text-foreground' : 'text-muted-foreground/60'
              }`}
              style={{ height: ITEM_H, scrollSnapAlign: 'start' }}
            >
              {String(v).padStart(2, '0')}
            </div>
          ))}
          <div style={{ height: 88 }} />
        </div>
      </div>
    </div>
  );
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export default function MobileTimePicker({ value, onChange, onClose }: Props) {
  const { language } = useApp();
  const lang = translations[language];

  const parsed = useMemo(() => {
    const [datePart, timePart] = (value || '').split('T');
    const [y, m, d] = (datePart || '').split('-').map(Number);
    const [h, min] = (timePart || '00:00').split(':').map(Number);
    return {
      year: y || new Date().getFullYear(),
      month: m || new Date().getMonth() + 1,
      day: d || new Date().getDate(),
      hour: h || 0,
      minute: min || 0,
    };
  }, [value]);

  const [year, setYear] = useState(parsed.year);
  const [month, setMonth] = useState(parsed.month);
  const [day, setDay] = useState(parsed.day);
  const [hour, setHour] = useState(parsed.hour);
  const [minute, setMinute] = useState(parsed.minute);

  const maxDay = getDaysInMonth(year, month);

  useEffect(() => {
    if (day > maxDay) setDay(maxDay);
  }, [year, month, maxDay, day]);

  const handleConfirm = () => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(Math.min(day, maxDay)).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    onChange(dateStr);
    onClose();
  };

  const handleYearChange = (val: string) => {
    const n = parseInt(val);
    if (!isNaN(n) && n >= 2000 && n <= 2099) setYear(n);
    else if (val === '') setYear(new Date().getFullYear());
  };

  const handleMonthChange = (val: string) => {
    const n = parseInt(val);
    if (!isNaN(n) && n >= 1 && n <= 12) setMonth(n);
  };

  const handleDayChange = (val: string) => {
    const n = parseInt(val);
    if (!isNaN(n) && n >= 1 && n <= 31) setDay(n);
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-foreground/20 backdrop-blur-sm modal-overlay" />
      <div
        className="relative w-full max-w-lg glass-card rounded-t-3xl modal-content pb-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-foreground">{lang.selectTime}</h3>
          <button
            onClick={handleConfirm}
            className="px-4 py-1.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
          >
            {lang.confirm}
          </button>
        </div>

        {/* Date inputs */}
        <div className="flex items-center gap-2 mb-5">
          <div className="flex-1">
            <label className="text-[10px] text-muted-foreground block mb-1">{lang.yearLabel}</label>
            <input
              type="number"
              inputMode="numeric"
              value={year}
              onChange={e => handleYearChange(e.target.value)}
              className="w-full bg-secondary text-foreground rounded-xl px-3 py-2.5 text-center text-sm font-medium outline-none"
              min={2000}
              max={2099}
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-muted-foreground block mb-1">{lang.monthLabel}</label>
            <input
              type="number"
              inputMode="numeric"
              value={month}
              onChange={e => handleMonthChange(e.target.value)}
              className="w-full bg-secondary text-foreground rounded-xl px-3 py-2.5 text-center text-sm font-medium outline-none"
              min={1}
              max={12}
            />
          </div>
          <div className="flex-1">
            <label className="text-[10px] text-muted-foreground block mb-1">{lang.dayLabel}</label>
            <input
              type="number"
              inputMode="numeric"
              value={Math.min(day, maxDay)}
              onChange={e => handleDayChange(e.target.value)}
              className="w-full bg-secondary text-foreground rounded-xl px-3 py-2.5 text-center text-sm font-medium outline-none"
              min={1}
              max={maxDay}
            />
          </div>
        </div>

        {/* Time wheels */}
        <div className="flex gap-3">
          <WheelColumn values={HOURS} selected={hour} onChange={setHour} label={lang.hourLabel} />
          <div className="flex items-center justify-center pt-5 text-2xl font-bold text-muted-foreground">:</div>
          <WheelColumn values={MINUTES} selected={minute} onChange={setMinute} label={lang.minuteLabel} />
        </div>
      </div>
    </div>
  );
}
