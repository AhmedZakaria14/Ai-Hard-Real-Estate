import type { PropertyFilterParams } from '../types';
import { DEFAULT_PURCHASE_MAX, DEFAULT_RENTAL_YEAR_MAX } from './priceNormalization';

const purchaseBudgets: Readonly<Record<string, readonly [number, number]>> = {
  '500k-1m': [500000, 1000000],
  '1m-3m': [1000000, 3000000],
  '3m-6m': [3000000, 6000000],
  '6m-12m': [6000000, 12000000],
  '12m+': [12000000, DEFAULT_PURCHASE_MAX],
};

const rentalBudgets: Readonly<Record<string, readonly [number, number]>> = {
  'rent-under-100k': [0, 100000],
  'rent-100k-200k': [100000, 200000],
  'rent-200k-350k': [200000, 350000],
  'rent-350k+': [350000, DEFAULT_RENTAL_YEAR_MAX],
};

export function getHeroPropertyFilters(
  mode: 'all' | 'buy' | 'rent',
  city: string,
  type: string,
  budget: string,
): PropertyFilterParams {
  const rental = mode === 'rent';
  const ranges = rental ? rentalBudgets : purchaseBudgets;
  const [minPrice, maxPrice] = Object.hasOwn(ranges, budget)
    ? ranges[budget]
    : [0, rental ? DEFAULT_RENTAL_YEAR_MAX : DEFAULT_PURCHASE_MAX];

  return {
    city: city.trim() || 'all',
    type,
    status: mode === 'all' ? 'all' : rental ? 'for-rent' : 'for-sale',
    rentalPeriod: 'year',
    minPrice,
    maxPrice,
  };
}
