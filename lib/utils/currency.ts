/**
 * Currency formatting utilities for MentorVerse
 * 
 * Handles display of prices with support for currency conversion
 */

/**
 * Format a price with proper currency symbol and formatting
 * 
 * @param amount - The numeric amount to format
 * @param currency - ISO 4217 currency code (e.g., 'USD', 'GHS', 'EUR')
 * @param locale - Optional locale for formatting (defaults to browser locale)
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number,
  currency: string,
  locale?: string
): string {
  try {
    const formatter = new Intl.NumberFormat(locale || navigator?.language || 'en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return formatter.format(amount);
  } catch (error) {
    // Fallback for unsupported currencies
    console.warn(`Currency formatting failed for ${currency}:`, error);
    return `${currency} ${amount.toFixed(2)}`;
  }
}

/**
 * Format price with original currency if converted
 * Shows both display price and original price for transparency
 * 
 * @param price - Display price (converted to user's currency)
 * @param currency - Display currency
 * @param basePrice - Original price set by mentor (optional)
 * @param baseCurrency - Original currency (optional)
 * @param showOriginal - Whether to show original price (default: true)
 * @returns Object with formatted strings
 */
export function formatPriceWithOriginal(
  price: number,
  currency: string,
  basePrice?: number,
  baseCurrency?: string,
  showOriginal: boolean = true
): {
  display: string;
  original?: string;
  isConverted: boolean;
} {
  const display = formatCurrency(price, currency);
  
  // Check if currency was converted
  const isConverted = Boolean(
    baseCurrency && 
    baseCurrency !== currency && 
    basePrice !== undefined &&
    showOriginal
  );
  
  if (isConverted) {
    return {
      display,
      original: formatCurrency(basePrice!, baseCurrency!),
      isConverted: true,
    };
  }
  
  return {
    display,
    isConverted: false,
  };
}

/**
 * Get currency symbol for a given currency code
 * 
 * @param currency - ISO 4217 currency code
 * @returns Currency symbol (e.g., '$', '₵', '€')
 */
export function getCurrencySymbol(currency: string): string {
  try {
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(0);
    
    // Extract symbol by removing digits and spaces
    return formatted.replace(/[\d\s.,]/g, '');
  } catch (error) {
    // Common fallbacks
    const symbols: Record<string, string> = {
      USD: '$',
      GHS: '₵',
      EUR: '€',
      GBP: '£',
      NGN: '₦',
      ZAR: 'R',
      KES: 'KSh',
    };
    return symbols[currency] || currency;
  }
}

/**
 * Get currency name for a given currency code
 * 
 * @param currency - ISO 4217 currency code
 * @returns Full currency name
 */
export function getCurrencyName(currency: string): string {
  const names: Record<string, string> = {
    USD: 'US Dollar',
    GHS: 'Ghanaian Cedi',
    EUR: 'Euro',
    GBP: 'British Pound',
    NGN: 'Nigerian Naira',
    ZAR: 'South African Rand',
    KES: 'Kenyan Shilling',
    CAD: 'Canadian Dollar',
    AUD: 'Australian Dollar',
  };
  return names[currency] || currency;
}

/**
 * Map country code to default currency
 * 
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns ISO 4217 currency code
 */
export function getCountryCurrency(countryCode: string): string {
  const mapping: Record<string, string> = {
    US: 'USD',
    GH: 'GHS',
    NG: 'NGN',
    ZA: 'ZAR',
    KE: 'KES',
    GB: 'GBP',
    DE: 'EUR',
    FR: 'EUR',
    ES: 'EUR',
    IT: 'EUR',
    CA: 'CAD',
    AU: 'AUD',
  };
  return mapping[countryCode.toUpperCase()] || 'USD';
}

/**
 * Format conversion rate for display
 * 
 * @param rate - Exchange rate
 * @param fromCurrency - Source currency
 * @param toCurrency - Target currency
 * @returns Formatted rate string
 */
export function formatConversionRate(
  rate: number,
  fromCurrency: string,
  toCurrency: string
): string {
  return `1 ${fromCurrency} = ${rate.toFixed(4)} ${toCurrency}`;
}

/**
 * Supported currencies in MentorVerse
 */
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
  { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
  { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
] as const;
