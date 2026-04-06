import { STORAGE_KEYS, loadFromStorage, saveToStorage } from './storage';
import type { ExchangeRateCache } from '@/types';

// Primary: jsdelivr CDN, Fallback: Cloudflare Pages
const CDN_BASE = 'https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api';
const CF_BASE = 'https://{date}.currency-api.pages.dev/v1/currencies';

const LATEST_TTL = 3600_000; // 1 hour
const HISTORICAL_TTL = 86400_000; // 1 day

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

async function fetchWithFallback(from: string, date: string): Promise<Record<string, number> | null> {
  const cur = from.toLowerCase();
  // Try jsdelivr CDN first
  try {
    const tag = date === 'latest' ? 'latest' : date;
    const res = await fetch(`${CDN_BASE}@${tag}/v1/currencies/${cur}.min.json`);
    if (res.ok) {
      const data = await res.json();
      return data[cur] || null;
    }
  } catch {}

  // Fallback to Cloudflare Pages
  try {
    const cfDate = date === 'latest' ? 'latest' : date;
    const res = await fetch(`${CF_BASE.replace('{date}', cfDate)}/${cur}.min.json`);
    if (res.ok) {
      const data = await res.json();
      return data[cur] || null;
    }
  } catch {}

  return null;
}

export async function fetchLatestRate(from: string, to: string): Promise<number> {
  if (from === to) return 1;

  const key = `${from}_${to}`;

  if (cache.latest[key] && Date.now() - cache.latestTimestamp < LATEST_TTL) {
    return cache.latest[key][to] || 1;
  }

  const rates = await fetchWithFallback(from, 'latest');
  if (!rates) return cache.latest[key]?.[to] || 1;

  const toKey = to.toLowerCase();
  const rate = rates[toKey];
  if (!rate) return cache.latest[key]?.[to] || 1;

  if (!cache.latest[key]) cache.latest[key] = {};
  cache.latest[key][to] = rate;

  const reverseKey = `${to}_${from}`;
  if (!cache.latest[reverseKey]) cache.latest[reverseKey] = {};
  cache.latest[reverseKey][from] = 1 / rate;

  cache.latestTimestamp = Date.now();
  saveCache();
  return rate;
}

export async function fetchHistoricalRates(from: string, to: string, days: number = 365): Promise<void> {
  if (from === to) return;

  const pairKey = `${from}_${to}`;
  if (
    cache.historicalPair === pairKey &&
    Date.now() - cache.historicalTimestamp < HISTORICAL_TTL &&
    Object.keys(cache.historical).length > 30
  ) {
    return;
  }

  // Clear old historical data for different pair
  if (cache.historicalPair !== pairKey) {
    cache.historical = {};
  }

  // Generate sample dates: daily for <=31 days, weekly for longer
  const dates: string[] = [];
  const now = new Date();
  const interval = days <= 31 ? 1 : 7;
  for (let i = 0; i < days; i += interval) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }

  // Filter out dates already cached
  const toFetch = dates.filter(d => !cache.historical[d]?.[from]?.[to]);

  // Fetch in batches of 10 to avoid overwhelming
  const BATCH = 10;
  const toKey = to.toLowerCase();

  for (let i = 0; i < toFetch.length; i += BATCH) {
    const batch = toFetch.slice(i, i + BATCH);
    const results = await Promise.allSettled(
      batch.map(async (date) => {
        const rates = await fetchWithFallback(from, date);
        if (rates && rates[toKey]) {
          return { date, rate: rates[toKey] };
        }
        return null;
      })
    );

    for (const result of results) {
      if (result.status === 'fulfilled' && result.value) {
        const { date, rate } = result.value;
        if (!cache.historical[date]) cache.historical[date] = {};
        if (!cache.historical[date][from]) cache.historical[date][from] = {};
        cache.historical[date][from][to] = rate;

        if (!cache.historical[date][to]) cache.historical[date][to] = {};
        cache.historical[date][to][from] = 1 / rate;
      }
    }
  }

  cache.historicalPair = pairKey;
  cache.historicalTimestamp = Date.now();
  saveCache();
}

export function getHistoricalRate(from: string, to: string, date: string): number {
  if (from === to) return 1;

  const rate = cache.historical[date]?.[from]?.[to];
  if (rate) return rate;

  // Fallback: look back up to 7 days for weekend/holiday gaps
  const d = new Date(date);
  for (let i = 1; i <= 7; i++) {
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
