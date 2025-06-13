
export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
}

export const CURRENCIES: Record<string, CurrencyInfo> = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', name: 'British Pound' },
  CAD: { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  CHF: { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  BRL: { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  MXN: { code: 'MXN', symbol: 'MX$', name: 'Mexican Peso' },
};

export const formatCurrency = (
  amount: number,
  currencyCode: string = 'USD'
): string => {
  const currency = CURRENCIES[currencyCode] || CURRENCIES.USD;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDistance = (
  distance: number,
  unit: string = 'km'
): string => {
  const unitLabel = unit === 'km' ? 'km' : 'miles';
  return `${distance.toLocaleString()} ${unitLabel}`;
};
