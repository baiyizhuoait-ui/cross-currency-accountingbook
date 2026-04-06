import { STORAGE_KEYS, loadFromStorage, saveToStorage } from './storage';
import type { ExchangeRateCache } from '@/types';

const API_BASE = 'https://open.er-api.com/v6/latest';
const LATEST_TTL = 3600_000; // 1 hour

let cache: ExchangeRateCache = loadFromStorage(STORAGE_KEYS.EXCHANGE_RATES, {
  latest: {},
  latestTimestamp: 0,
  historical: {},
  historicalTimestamp: 0,
  historicalPair: '',
});

function saveCache() {
  saveToStorage(STORAGE_KEYS.EXCHANGE_RATES, cache);
}

export async function fetchLatestRate(from: string, to: string): Promise<number> {
  if (from === to) return 1;

  const key = `${from}_${to}`;

  // Check cache freshness
  if (cache.latest[key] && Date.now() - cache.latestTimestamp < LATEST_TTL) {
    return cache.latest[key][to] || 1;
  }

  try {
    const res = await fetch(`${API_BASE}/${from}`);
    if (!res.ok) throw new Error('API error');
    const data = await res.json();
    if (data.result !== 'success') throw new Error('API returned error');

    const rate = data.rates[to];
    if (!rate) throw new Error(`No rate for ${to}`);

    // Store the direct rate
    if (!cache.latest[key]) cache.latest[key] = {};
    cache.latest[key][to] = rate;

    // Store reverse
    const reverseKey = `${to}_${from}`;
    if (!cache.latest[reverseKey]) cache.latest[reverseKey] = {};
    cache.latest[reverseKey][from] = 1 / rate;

    cache.latestTimestamp = Date.now();

    // Also snapshot today's rate into historical for chart building
    const today = new Date().toISOString().split('T')[0];
    if (!cache.historical[today]) cache.historical[today] = {};
    if (!cache.historical[today][from]) cache.historical[today][from] = {};
    cache.historical[today][from][to] = rate;
    if (!cache.historical[today][to]) cache.historical[today][to] = {};
    cache.historical[today][to][from] = 1 / rate;

    cache.historicalPair = key;
    cache.historicalTimestamp = Date.now();

    saveCache();
    return rate;
  } catch {
    return cache.latest[key]?.[to] || 1;
  }
}

// This API doesn't support historical ranges, so we just ensure latest is fetched
export async function fetchHistoricalRates(from: string, to: string, _days: number = 365): Promise<void> {
  // The latest fetch already snapshots today's rate into historical.
  // Over time the chart will accumulate data points.
  await fetchLatestRate(from, to);
}

export function getHistoricalRate(from: string, to: string, date: string): number {
  if (from === to) return 1;

  const rate = cache.historical[date]?.[from]?.[to];
  if (rate) return rate;

  // Fallback: look back up to 5 days for weekend/holiday
  const d = new Date(date);
  for (let i = 1; i <= 5; i++) {
    d.setDate(d.getDate() - 1);
    const fallbackDate = d.toISOString().split('T')[0];
    const fallbackRate = cache.historical[fallbackDate]?.[from]?.[to];
    if (fallbackRate) return fallbackRate;
  }

  return cache.latest[`${from}_${to}`]?.[to] || 1;
}

export function getLatestCachedRate(from: string, to: string): number {
  if (from === to) return 1;
  return cache.latest[`${from}_${to}`]?.[to] || 1;
}

export function getCachedHistoricalDates(): string[] {
  return Object.keys(cache.historical).sort();
}

export function getHistoricalRateForChart(from: string, to: string, date: string): number | null {
  return cache.historical[date]?.[from]?.[to] || null;
}
