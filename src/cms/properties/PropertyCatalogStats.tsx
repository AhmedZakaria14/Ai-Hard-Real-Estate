import type { Language, Property } from '../../types';

export function PropertyCatalogStats({ properties, language }: { properties: Property[]; language: Language }) {
  const ar = language === 'ar';
  const valuation = properties.reduce((sum, property) => sum + property.price.sar, 0);
  const cards = [
    { label: ar ? 'إجمالي العقارات' : 'Total properties', value: properties.length },
    { label: ar ? 'إجمالي الأسعار المعروضة' : 'Total advertised prices', value: valuation.toLocaleString(ar ? 'ar-SA' : 'en-US') + (ar ? ' ر.س' : ' SAR') },
    { label: ar ? 'للبيع' : 'For sale', value: properties.filter((property) => property.status === 'for-sale').length },
    { label: ar ? 'للإيجار' : 'For rent', value: properties.filter((property) => property.status === 'for-rent').length },
    { label: ar ? 'عقارات مميزة' : 'Featured properties', value: properties.filter((property) => property.featured).length },
  ];
  return <dl className="grid grid-cols-2 gap-3.5 lg:grid-cols-5">
    {cards.map(({ label, value }) => <div key={label} className="space-y-1 rounded-2xl border border-slate-200 bg-white p-4">
      <dt className="text-xs font-bold text-slate-500">{label}</dt>
      <dd className="text-xl font-extrabold text-slate-900">{value}</dd>
    </div>)}
  </dl>;
}
