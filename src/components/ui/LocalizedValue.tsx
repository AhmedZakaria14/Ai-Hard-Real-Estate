import type { ReactNode } from 'react';
import { useTextOverride } from '../../context/TextOverrideContext';

export function displayDigits(value: string | number, language: 'ar' | 'en'): string {
  const western = String(value).replace(/[٠-٩]/g, (char) => String(char.charCodeAt(0) - 1632)).replace(/[۰-۹]/g, (char) => String(char.charCodeAt(0) - 1776));
  return language === 'ar' ? western.replace(/\d/g, (char) => String.fromCharCode(1632 + Number(char))) : western;
}

/** Format visible numbers only; links, input values and stored data keep their original values. */
export function LocalizedValue({ value }: { value: ReactNode }) {
  const { publicLanguage } = useTextOverride();
  return <>{typeof value === 'number' || typeof value === 'string' ? displayDigits(value, publicLanguage) : value}</>;
}
