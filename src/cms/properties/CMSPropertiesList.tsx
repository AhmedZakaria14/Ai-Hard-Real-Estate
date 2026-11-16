import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  Star,
  Download,
  Building,
  Bed,
  Bath,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  List,
  Sparkles,
  Tag,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { Property, PropertyType, ListingStatus, Language } from '../../types';
import { SAUDI_CITIES } from '../../data/cities';
import { getPropertyAreaSqM, getLocalizedText } from '../../lib/utils';
import { normalizePropertySearch } from '../../lib/propertySearch';
import { PropertyCatalogStats } from './PropertyCatalogStats';
import { propertiesCSV } from './propertyCsv';

interface CMSPropertiesListProps {
  properties: Property[];
  onAddProperty: () => void;
  onEditProperty: (property: Property) => void;
  onDeleteProperty: (id: string) => Promise<boolean>;
  onDuplicateProperty: (property: Property) => void;
  onToggleFeatured: (property: Property) => void;
  onQuickStatusChange: (property: Property, newStatus: ListingStatus) => void;
  onViewLive: (property: Property) => void;
  language: Language;
}

const safePropTitle = (prop: Property, lang: 'ar' | 'en') => {
  if (!prop || !prop.title) return 'Un-titled Listing';
  if (typeof prop.title === 'string') return prop.title;
  return (lang === 'ar' ? prop.title.ar : prop.title.en) || prop.title.en || prop.title.ar || 'Un-titled Listing';
};

const safePropLocation = (prop: Property, lang: 'ar' | 'en') => {
  if (!prop || !prop.location) return 'Saudi Arabia';
  if (typeof prop.location === 'string') return prop.location;
  const city = typeof prop.location.city === 'string'
    ? prop.location.city
    : (lang === 'ar' ? prop.location.city?.ar : prop.location.city?.en) || 'Saudi Arabia';
  const area = typeof prop.location.area === 'string'
    ? prop.location.area
    : (lang === 'ar' ? prop.location.area?.ar : prop.location.area?.en) || '';
  return area ? `${city} - ${area}` : city;
};

const safePropPrice = (prop: Property) => {
  if (!prop || !prop.price) return '0';
  if (typeof (prop as any).price === 'number') return (prop as any).price.toLocaleString();
  const rawSar = (prop.price as any)?.sar ?? (prop.price as any)?.amount ?? 0;
  const num = Number(rawSar);
  return isNaN(num) ? String(rawSar || '0') : num.toLocaleString();
};

export const CMSPropertiesList: React.FC<CMSPropertiesListProps> = ({
  properties,
  onAddProperty,
  onEditProperty,
  onDeleteProperty,
  onDuplicateProperty,
  onToggleFeatured,
  onQuickStatusChange,
  onViewLive,
  language,
}) => {
  const isAr = language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [onlyFeatured, setOnlyFeatured] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [propertyForDelete, setPropertyForDelete] = useState<Property | null>(null);

  const [archiving, setArchiving] = useState(false);
  const [archiveError, setArchiveError] = useState('');

  const filteredProperties = useMemo(() => {
    const query = normalizePropertySearch(searchQuery);
    const city = normalizePropertySearch(selectedCity);
    return properties.filter((item) => {
      const cities = ['en', 'ar'].map((lang: Language) => normalizePropertySearch(getLocalizedText(item.location?.city, lang)));
      const searchFields = [
        item.id,
        ...cities,
        ...(['en', 'ar'] as const).flatMap((lang) => [
          getLocalizedText(item.title, lang),
          getLocalizedText(item.location?.area, lang),
        ]),
      ];
      return (!query || searchFields.some((field) => normalizePropertySearch(field).includes(query)))
        && (selectedType === 'all' || item.type === selectedType)
        && (selectedStatus === 'all' || item.status === selectedStatus)
        && (selectedCity === 'all' || cities.includes(city))
        && (!onlyFeatured || item.featured);
    });
  }, [properties, searchQuery, selectedType, selectedStatus, selectedCity, onlyFeatured]);

  const handleExportCSV = () => {
    const csv = propertiesCSV(filteredProperties);
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `HARD_Properties_Catalog_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const archiveProperty = async () => {
    if (!propertyForDelete || archiving) return;
    setArchiving(true);
    setArchiveError('');
    try {
      if (!await onDeleteProperty(propertyForDelete.id)) throw new Error('Archive was not confirmed');
      setPropertyForDelete(null);
    } catch {
      setArchiveError(isAr ? 'تعذّرت أرشفة العقار. حاول مرة أخرى.' : 'Could not archive the listing. Try again.');
    } finally {
      setArchiving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <PropertyCatalogStats properties={properties} language={language} />

      {/* 2. FILTER & ACTION TOOLBAR */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5" />
            <input
              type="text"
              placeholder={isAr ? 'ابحث باسم العقار، الكود، المدينة، أو الحي...' : 'Search by title, property ID, city, or district...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full ps-10 pe-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute top-2.5 end-3 text-xs text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              title={isAr ? 'تصدير قائمة العقارات إلى ملف إكسل CSV' : 'Export Properties to CSV'}
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">{isAr ? 'تصدير CSV' : 'Export CSV'}</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Grid Cards View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            {/* Add Property Button */}
            <button
              onClick={onAddProperty}
              className="px-4 py-2.5 bg-hard-gradient text-white text-xs sm:text-sm font-bold rounded-xl shadow-md hover:brightness-105 active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? 'إضافة عقار جديد' : 'Add Property'}</span>
            </button>
          </div>
        </div>

        {/* Dropdown Filters Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs font-medium text-slate-700">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3" /> {isAr ? 'التصنيف:' : 'Filter:'}
          </span>

          {/* Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">{isAr ? 'جميع أنواع العقارات' : 'All Property Types'}</option>
            <option value="villa">{isAr ? 'فيلا (Villa)' : 'Villa'}</option>
            <option value="apartment">{isAr ? 'شقة (Apartment)' : 'Apartment'}</option>
            <option value="penthouse">{isAr ? 'بنتهاوس (Penthouse)' : 'Penthouse'}</option>
            <option value="townhouse">{isAr ? 'تاون هاوس (Townhouse)' : 'Townhouse'}</option>
            <option value="commercial">{isAr ? 'تجاري (Commercial)' : 'Commercial'}</option>
            <option value="mansion">{isAr ? 'قصر (Mansion)' : 'Mansion'}</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">{isAr ? 'جميع حالات العرض' : 'All Statuses'}</option>
            <option value="for-sale">{isAr ? 'للبيع (For Sale)' : 'For Sale'}</option>
            <option value="for-rent">{isAr ? 'للإيجار (For Rent)' : 'For Rent'}</option>
            <option value="off-plan">{isAr ? 'على الخارطة (Off-Plan)' : 'Off-Plan'}</option>
            <option value="exclusive">{isAr ? 'عقار حصري (Exclusive)' : 'Exclusive'}</option>
            <option value="new-launch">{isAr ? 'إطلاق حديث (New Launch)' : 'New Launch'}</option>
          </select>

          {/* City Filter */}
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="all">{isAr ? 'جميع المدن' : 'All Cities'}</option>
            {SAUDI_CITIES.map((c) => {
              const cityName = isAr ? c.ar : c.en;
              return (
                <option key={c.en} value={cityName}>
                  {cityName}
                </option>
              );
            })}
          </select>

          {/* Featured Toggle Filter */}
          <button
            onClick={() => setOnlyFeatured(!onlyFeatured)}
            className={`px-3 py-1.5 rounded-xl border text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
              onlyFeatured
                ? 'bg-amber-50 border-amber-300 text-amber-800 font-bold'
                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Star className={`w-3.5 h-3.5 ${onlyFeatured ? 'fill-amber-500 text-amber-500' : 'text-slate-400'}`} />
            <span>{isAr ? 'المميزة فقط' : 'Featured Only'}</span>
          </button>

          {/* Reset Filters */}
          {(selectedType !== 'all' || selectedStatus !== 'all' || selectedCity !== 'all' || onlyFeatured || searchQuery) && (
            <button
              onClick={() => {
                setSelectedType('all');
                setSelectedStatus('all');
                setSelectedCity('all');
                setOnlyFeatured(false);
                setSearchQuery('');
              }}
              className="text-xs text-blue-600 hover:underline ms-auto cursor-pointer font-semibold"
            >
              {isAr ? 'إعادة ضبط التصفيات' : 'Reset Filters'}
            </button>
          )}
        </div>
      </div>

      {/* 3. PROPERTIES DATA PRESENTATION */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
          <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
            <Building className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-800">
              {isAr ? 'لم يتم العثور على عقارات مطابقة' : 'No matching properties found'}
            </h3>
            <p className="text-xs text-slate-500">
              {isAr
                ? 'جرّب تعديل مصطلحات البحث أو تغيير خيارات التصفية أو أضف عقاراً جديداً.'
                : 'Try adjusting your search criteria or add a new property to the catalog.'}
            </p>
          </div>
          <button
            onClick={onAddProperty}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة عقار الآن' : 'Add Property Now'}</span>
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4 text-start">{isAr ? 'العقار والمعلومات' : 'Property & Overview'}</th>
                  <th className="py-3.5 px-3 text-start">{isAr ? 'الموقع' : 'Location'}</th>
                  <th className="py-3.5 px-3 text-start">{isAr ? 'النوع' : 'Type'}</th>
                  <th className="py-3.5 px-3 text-start">{isAr ? 'السعر (SAR)' : 'Price (SAR)'}</th>
                  <th className="py-3.5 px-3 text-start">{isAr ? 'المواصفات' : 'Specs'}</th>
                  <th className="py-3.5 px-3 text-center">{isAr ? 'حالة العرض' : 'Listing Status'}</th>
                  <th className="py-3.5 px-3 text-center">{isAr ? 'مميز' : 'Featured'}</th>
                  <th className="py-3.5 px-4 text-end">{isAr ? 'الإجراءات' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredProperties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-slate-50/70 transition-colors group">
                    {/* Title + Thumbnail */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3 min-w-[220px]">
                        <div className="w-14 h-11 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                          <img
                            src={prop.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'}
                            alt={safePropTitle(prop, 'en')}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="space-y-0.5 max-w-[260px]">
                          <span className="font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1 text-xs">
                            {safePropTitle(prop, language)}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400 block">
                            ID: {prop.id}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-slate-600">
                        <MapPin className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        <span>{safePropLocation(prop, language)}</span>
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="capitalize px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[11px] font-semibold border border-slate-200/80">
                        {prop.type || 'residential'}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="font-bold text-blue-700 text-xs sm:text-sm">
                        {safePropPrice(prop)}{' '}
                        <span className="text-[10px] font-semibold text-slate-500">SAR</span>
                      </div>
                      {prop.price.period && (
                        <span className="text-[10px] text-slate-400 block font-normal">
                          / {prop.price.period}
                        </span>
                      )}
                    </td>

                    {/* Specs */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5 text-slate-500 text-[11px]">
                        <span className="flex items-center gap-1" title={`${prop.bedrooms} Bedrooms`}>
                          <Bed className="w-3.5 h-3.5 text-slate-400" /> {prop.bedrooms}
                        </span>
                        <span className="flex items-center gap-1" title={`${prop.bathrooms} Bathrooms`}>
                          <Bath className="w-3.5 h-3.5 text-slate-400" /> {prop.bathrooms}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-slate-700" title={`${getPropertyAreaSqM(prop)} ${isAr ? 'م²' : 'm²'}`}>
                          <Maximize2 className="w-3.5 h-3.5 text-slate-400" /> {getPropertyAreaSqM(prop)} {isAr ? 'م²' : 'm²'}
                        </span>
                      </div>
                    </td>

                    {/* Status Toggle */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <select
                        value={prop.status}
                        onChange={(e) => onQuickStatusChange(prop, e.target.value as ListingStatus)}
                        className={`text-[11px] font-bold py-1 px-2 rounded-lg border cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                          prop.status === 'for-sale'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : prop.status === 'for-rent'
                            ? 'bg-sky-50 text-sky-800 border-sky-200'
                            : prop.status === 'off-plan'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : 'bg-purple-50 text-purple-800 border-purple-200'
                        }`}
                      >
                        <option value="for-sale">{isAr ? 'للبيع' : 'For Sale'}</option>
                        <option value="for-rent">{isAr ? 'للإيجار' : 'For Rent'}</option>
                        <option value="off-plan">{isAr ? 'على الخارطة' : 'Off-Plan'}</option>
                        <option value="exclusive">{isAr ? 'حصري' : 'Exclusive'}</option>
                        <option value="new-launch">{isAr ? 'إطلاق جديد' : 'New Launch'}</option>
                      </select>
                    </td>

                    {/* Featured Star */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onToggleFeatured(prop)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                        title={prop.featured ? 'Remove from Featured' : 'Mark as Featured'}
                      >
                        <Star
                          className={`w-4 h-4 ${
                            prop.featured ? 'fill-amber-400 text-amber-500' : 'text-slate-300 hover:text-slate-500'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-end whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onViewLive(prop)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title={isAr ? 'معاينة في الموقع الحي' : 'Preview on Live Site'}
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDuplicateProperty(prop)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title={isAr ? 'نسخ العقار' : 'Duplicate Listing'}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEditProperty(prop)}
                          className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title={isAr ? 'تعديل البيانات' : 'Edit Property'}
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setPropertyForDelete(prop)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title={isAr ? 'أرشفة ونقل لسلة المهملات' : 'Move to Trash'}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer Summary */}
          <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>
              {isAr
                ? `عرض ${filteredProperties.length} من أصل ${properties.length} عقار`
                : `Showing ${filteredProperties.length} of ${properties.length} properties`}
            </span>
            <span className="text-[11px] text-slate-400">
              {isAr ? 'التحديثات تنعكس فوراً على الموقع الرئيسي' : 'Live Sync Active across all pages'}
            </span>
          </div>
        </div>
      ) : (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProperties.map((prop) => (
            <div
              key={prop.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col group"
            >
              {/* Card Image */}
              <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                <img
                  src={prop.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'}
                  alt={safePropTitle(prop, 'en')}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 start-3 flex items-center gap-1.5">
                  <span className="px-2.5 py-1 bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold rounded-lg uppercase tracking-wider">
                    {prop.type || 'residential'}
                  </span>
                  <span className={`px-2.5 py-1 text-[10px] font-bold rounded-lg backdrop-blur-md ${
                    prop.status === 'for-sale'
                      ? 'bg-emerald-600/90 text-white'
                      : prop.status === 'for-rent'
                      ? 'bg-sky-600/90 text-white'
                      : 'bg-blue-600/90 text-white'
                  }`}>
                    {prop.status}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleFeatured(prop)}
                  className="absolute top-3 end-3 p-2 bg-white/90 backdrop-blur-md rounded-xl shadow-xs cursor-pointer hover:bg-white"
                >
                  <Star className={`w-4 h-4 ${prop.featured ? 'fill-amber-400 text-amber-500' : 'text-slate-400'}`} />
                </button>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1 text-slate-500 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>{safePropLocation(prop, language)}</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1 font-display-serif">
                    {safePropTitle(prop, language)}
                  </h4>
                  <div className="text-base font-extrabold text-blue-700">
                    {safePropPrice(prop)} <span className="text-xs font-semibold text-slate-500">SAR</span>
                  </div>
                </div>

                {/* Specs */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-600">
                  <span>{prop.bedrooms} {isAr ? 'غرف' : 'Beds'}</span>
                  <span>•</span>
                  <span>{prop.bathrooms} {isAr ? 'حمامات' : 'Baths'}</span>
                  <span>•</span>
                  <span>{prop.areaSqM} m²</span>
                </div>

                {/* Card Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => onViewLive(prop)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>{isAr ? 'معاينة' : 'Preview'}</span>
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onDuplicateProperty(prop)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                      title="Duplicate"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onEditProperty(prop)}
                      className="p-1.5 text-slate-400 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 cursor-pointer"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPropertyForDelete(prop)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                      title={isAr ? 'أرشفة ونقل لسلة المهملات' : 'Move to Trash'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {propertyForDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/50 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="archive-property-title" className="w-full max-w-md rounded-2xl bg-white p-5 shadow-lg">
            <h2 id="archive-property-title" className="font-bold text-slate-900">
              {isAr ? 'أرشفة العقار' : 'Archive listing'} · {safePropTitle(propertyForDelete, language)}
            </h2>
            <p className="mt-2 text-sm text-slate-600">{isAr ? 'سيختفي العقار من الموقع ويمكن استعادته من أرشيف الكتالوج.' : 'The listing will be hidden from visitors and can be restored from the catalog archive.'}</p>
            {archiveError && <p role="alert" className="mt-2 text-sm text-rose-700">{archiveError}</p>}
            <div className="mt-4 flex gap-2">
              <button type="button" disabled={archiving} onClick={() => void archiveProperty()} className="rounded-lg bg-rose-700 px-3 py-2 text-sm text-white">{isAr ? 'أرشفة' : 'Archive'}</button>
              <button type="button" disabled={archiving} onClick={() => { setPropertyForDelete(null); setArchiveError(''); }} className="rounded-lg border px-3 py-2 text-sm">{isAr ? 'إلغاء' : 'Cancel'}</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
