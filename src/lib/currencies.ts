export interface CurrencyInfo {
  code: string;
  name: string;
  nameZh: string;
  symbol: string;
}

// Currencies supported by frankfurter.app API
export const SUPPORTED_CURRENCIES: CurrencyInfo[] = [
  { code: 'CNY', name: 'Chinese Yuan', nameZh: '人民币', symbol: '¥' },
  { code: 'MYR', name: 'Malaysian Ringgit', nameZh: '马来西亚林吉特', symbol: 'RM' },
  { code: 'USD', name: 'US Dollar', nameZh: '美元', symbol: '$' },
  { code: 'EUR', name: 'Euro', nameZh: '欧元', symbol: '€' },
  { code: 'GBP', name: 'British Pound', nameZh: '英镑', symbol: '£' },
  { code: 'JPY', name: 'Japanese Yen', nameZh: '日元', symbol: '¥' },
  { code: 'KRW', name: 'South Korean Won', nameZh: '韩元', symbol: '₩' },
  { code: 'AUD', name: 'Australian Dollar', nameZh: '澳元', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', nameZh: '加元', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', nameZh: '瑞士法郎', symbol: 'Fr' },
  { code: 'HKD', name: 'Hong Kong Dollar', nameZh: '港币', symbol: 'HK$' },
  { code: 'SGD', name: 'Singapore Dollar', nameZh: '新加坡元', symbol: 'S$' },
  { code: 'SEK', name: 'Swedish Krona', nameZh: '瑞典克朗', symbol: 'kr' },
  { code: 'NOK', name: 'Norwegian Krone', nameZh: '挪威克朗', symbol: 'kr' },
  { code: 'DKK', name: 'Danish Krone', nameZh: '丹麦克朗', symbol: 'kr' },
  { code: 'NZD', name: 'New Zealand Dollar', nameZh: '新西兰元', symbol: 'NZ$' },
  { code: 'THB', name: 'Thai Baht', nameZh: '泰铢', symbol: '฿' },
  { code: 'INR', name: 'Indian Rupee', nameZh: '印度卢比', symbol: '₹' },
  { code: 'IDR', name: 'Indonesian Rupiah', nameZh: '印尼盾', symbol: 'Rp' },
  { code: 'PHP', name: 'Philippine Peso', nameZh: '菲律宾比索', symbol: '₱' },
  { code: 'PLN', name: 'Polish Zloty', nameZh: '波兰兹罗提', symbol: 'zł' },
  { code: 'CZK', name: 'Czech Koruna', nameZh: '捷克克朗', symbol: 'Kč' },
  { code: 'HUF', name: 'Hungarian Forint', nameZh: '匈牙利福林', symbol: 'Ft' },
  { code: 'RON', name: 'Romanian Leu', nameZh: '罗马尼亚列伊', symbol: 'lei' },
  { code: 'BGN', name: 'Bulgarian Lev', nameZh: '保加利亚列弗', symbol: 'лв' },
  { code: 'ISK', name: 'Icelandic Krona', nameZh: '冰岛克朗', symbol: 'kr' },
  { code: 'TRY', name: 'Turkish Lira', nameZh: '土耳其里拉', symbol: '₺' },
  { code: 'BRL', name: 'Brazilian Real', nameZh: '巴西雷亚尔', symbol: 'R$' },
  { code: 'MXN', name: 'Mexican Peso', nameZh: '墨西哥比索', symbol: 'Mex$' },
  { code: 'ZAR', name: 'South African Rand', nameZh: '南非兰特', symbol: 'R' },
  { code: 'ILS', name: 'Israeli Shekel', nameZh: '以色列谢克尔', symbol: '₪' },
];

export function getCurrencySymbol(code: string): string {
  return SUPPORTED_CURRENCIES.find(c => c.code === code)?.symbol || code;
}

export function getCurrencyInfo(code: string): CurrencyInfo | undefined {
  return SUPPORTED_CURRENCIES.find(c => c.code === code);
}

export function formatAmount(amount: number, currency: string): string {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${amount.toFixed(2)}`;
}
