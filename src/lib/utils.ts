import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, _currency: 'SAR' = 'SAR', language: 'en' | 'ar' = 'en') {
  const formattedNum = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(amount);

  return language === 'ar' ? `${formattedNum} ر.س` : `${formattedNum} SAR`;
}

export function formatPricePerSqFt(priceInSar: number, sqFt: number, language: 'en' | 'ar' = 'en') {
  if (!sqFt || sqFt <= 0) return '';
  const pricePerSqFt = Math.round(priceInSar / sqFt);
  const formattedNum = new Intl.NumberFormat('en-US').format(pricePerSqFt);
  return language === 'ar' ? `${formattedNum} ر.س / قدم²` : `${formattedNum} SAR / sq ft`;
}
