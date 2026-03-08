export type Language = 'zh' | 'en';

const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const translations = {
  zh: {
    appName: '多币种记账本',
    appNameIcon: '💰 多币种记账本',
    navTransactions: '明细大厅',
    navAssets: '我的资产',
    navCalendar: '消费日历',
    navDashboard: '数据看板',
    navSettings: '设置中心',

    filterAll: '所有记录',
    filterExpense: '仅消费',
    filterIncome: '仅入账',
    filterCategory: '选择分类',

    noRecords: '暂无记录',
    noRecordsHint: '点击右下角 + 按钮添加第一条记录',
    income: '入账',
    expense: '支出',

    wallet: '钱包',
    platform: '平台',
    category: '分类',
    time: '时间',
    note: '备注',
    notePlaceholder: '添加备注...',
    saveChanges: '保存修改',
    addRecord: '添加记录',

    netAssets: '净资产总额',
    myWallets: '我的钱包',
    manage: '管理',
    done: '完成',
    createWallet: '创建新钱包',
    walletName: '钱包名称',
    chooseColor: '选择颜色',
    initialBalance: '初始余额',
    cancel: '取消',
    create: '创建',

    weekdays: ['日', '一', '二', '三', '四', '五', '六'],
    monthlyStats: '月度每日消费统计',
    noExpensesMonth: '本月暂无消费记录',
    spendingBreakdown: '消费构成',
    dailyTransactions: '当日流水',
    noExpensesDay: '当天无消费记录',
    spending: '消费',

    rateLoading: '暂无汇率数据，请等待加载...',
    expenseSummary: '总消费分类汇总',
    allWallets: '所有钱包',
    allPlatforms: '所有平台',
    noExpenseData: '暂无消费数据',
    period5d: '5天',
    period1m: '一月',
    period3m: '三月',
    period1y: '一年',

    settingsTitle: '设置中心',
    tabGeneral: '常规',
    tabPlatforms: '平台管理',
    tabCategories: '分类管理',
    appearance: '外观模式',
    lightMode: '浅色',
    darkMode: '深色',
    themeColor: '主题色',
    colorBlue: '蓝色',
    colorRose: '玫红',
    colorGreen: '绿色',
    colorViolet: '紫色',
    colorAmber: '琥珀',
    colorTeal: '青色',
    languageLabel: '语言',
    langZh: '中文',
    langEn: 'English',
    primaryCurrency: '主要货币',
    secondaryCurrency: '次要货币',
    selectPrimaryCurrency: '选择主要货币',
    selectSecondaryCurrency: '选择次要货币',
    searchCurrency: '搜索货币...',
    currencySameError: '主要货币与次要货币不能相同',
    addPlatformBtn: '添加平台',
    addCategoryBtn: '添加分类',

    newCategory: '新建分类',
    categoryName: '分类名称',
    categoryNamePlaceholder: '输入分类名称',
    chooseIcon: '选择图标',
    createCategory: '创建分类',
    addPlatformTitle: '添加平台',
    platformName: '平台名称',
    platformNamePlaceholder: '输入平台名称',

    pageNotFound: '页面未找到',
    returnHome: '返回首页',

    confirm: '确认',
    selectTime: '选择时间',
    yearLabel: '年',
    monthLabel: '月',
    dayLabel: '日',
    hourLabel: '时',
    minuteLabel: '分',
  },
  en: {
    appName: 'Multi-Currency Ledger',
    appNameIcon: '💰 Multi-Currency Ledger',
    navTransactions: 'Transactions',
    navAssets: 'My Assets',
    navCalendar: 'Calendar',
    navDashboard: 'Dashboard',
    navSettings: 'Settings',

    filterAll: 'All',
    filterExpense: 'Expenses',
    filterIncome: 'Income',
    filterCategory: 'Category',

    noRecords: 'No records yet',
    noRecordsHint: 'Tap the + button to add your first record',
    income: 'Income',
    expense: 'Expense',

    wallet: 'Wallet',
    platform: 'Platform',
    category: 'Category',
    time: 'Time',
    note: 'Note',
    notePlaceholder: 'Add a note...',
    saveChanges: 'Save',
    addRecord: 'Add Record',

    netAssets: 'Net Assets',
    myWallets: 'My Wallets',
    manage: 'Manage',
    done: 'Done',
    createWallet: 'New Wallet',
    walletName: 'Wallet Name',
    chooseColor: 'Choose Color',
    initialBalance: 'Initial Balance',
    cancel: 'Cancel',
    create: 'Create',

    weekdays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    monthlyStats: 'Daily Spending',
    noExpensesMonth: 'No expenses this month',
    spendingBreakdown: 'Spending Breakdown',
    dailyTransactions: 'Daily Transactions',
    noExpensesDay: 'No expenses on this day',
    spending: 'Spending',

    rateLoading: 'Loading exchange rate data...',
    expenseSummary: 'Expense Summary by Category',
    allWallets: 'All Wallets',
    allPlatforms: 'All Platforms',
    noExpenseData: 'No expense data',
    period5d: '5D',
    period1m: '1M',
    period3m: '3M',
    period1y: '1Y',

    settingsTitle: 'Settings',
    tabGeneral: 'General',
    tabPlatforms: 'Platforms',
    tabCategories: 'Categories',
    appearance: 'Appearance',
    lightMode: 'Light',
    darkMode: 'Dark',
    themeColor: 'Theme Color',
    colorBlue: 'Blue',
    colorRose: 'Rose',
    colorGreen: 'Green',
    colorViolet: 'Violet',
    colorAmber: 'Amber',
    colorTeal: 'Teal',
    languageLabel: 'Language',
    langZh: '中文',
    langEn: 'English',
    primaryCurrency: 'Primary Currency',
    secondaryCurrency: 'Secondary Currency',
    selectPrimaryCurrency: 'Select Primary Currency',
    selectSecondaryCurrency: 'Select Secondary Currency',
    searchCurrency: 'Search currency...',
    currencySameError: 'Currencies must differ',
    addPlatformBtn: 'Add Platform',
    addCategoryBtn: 'Add Category',

    newCategory: 'New Category',
    categoryName: 'Category Name',
    categoryNamePlaceholder: 'Enter category name',
    chooseIcon: 'Choose Icon',
    createCategory: 'Create Category',
    addPlatformTitle: 'Add Platform',
    platformName: 'Platform Name',
    platformNamePlaceholder: 'Enter platform name',

    pageNotFound: 'Page not found',
    returnHome: 'Return to Home',

    confirm: 'Confirm',
    selectTime: 'Select Time',
    yearLabel: 'Y',
    monthLabel: 'M',
    dayLabel: 'D',
    hourLabel: 'H',
    minuteLabel: 'Min',
  },
} as const;

export type TranslationKeys = typeof translations.zh;

// Default category name translations (by known ID)
const DEFAULT_CAT_NAMES: Record<string, Record<Language, string>> = {
  food: { zh: '餐饮', en: 'Food' },
  transport: { zh: '交通', en: 'Transport' },
  shopping: { zh: '购物', en: 'Shopping' },
  housing: { zh: '住房', en: 'Housing' },
  entertainment: { zh: '娱乐', en: 'Entertainment' },
  medical: { zh: '医疗', en: 'Medical' },
  education: { zh: '教育', en: 'Education' },
  grocery: { zh: '日用', en: 'Daily' },
  telecom: { zh: '通讯', en: 'Telecom' },
  clothing: { zh: '服饰', en: 'Clothing' },
  social: { zh: '社交', en: 'Social' },
  transfer: { zh: '转账', en: 'Transfer' },
  other: { zh: '其他', en: 'Other' },
  income: { zh: '入账', en: 'Income' },
};

const DEFAULT_PLAT_NAMES: Record<string, Record<Language, string>> = {
  alipay: { zh: '支付宝', en: 'Alipay' },
  wechat: { zh: '微信支付', en: 'WeChat Pay' },
  cash: { zh: '现金', en: 'Cash' },
  bank: { zh: '银行卡', en: 'Bank Card' },
};

export function getCategoryDisplayName(lang: Language, id: string, storedName: string): string {
  return DEFAULT_CAT_NAMES[id]?.[lang] || storedName;
}

export function getPlatformDisplayName(lang: Language, id: string, storedName: string): string {
  return DEFAULT_PLAT_NAMES[id]?.[lang] || storedName;
}

export function formatDateHeader(lang: Language, dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  if (lang === 'zh') return `${y}年${m}月${d}日`;
  return `${EN_MONTHS[m - 1]} ${d}, ${y}`;
}

export function formatYearMonth(lang: Language, y: number, m: number): string {
  if (lang === 'zh') return `${y}年${m}月`;
  return `${EN_MONTHS[m - 1]} ${y}`;
}

export function getCurrencyDisplayName(lang: Language, code: string, nameZh: string, nameEn: string): string {
  return lang === 'zh' ? nameZh : nameEn;
}
