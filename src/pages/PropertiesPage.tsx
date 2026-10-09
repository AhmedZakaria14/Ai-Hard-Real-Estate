import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  MapPin,
  Bed,
  Bath,
  Maximize,
  Calendar,
  MessageSquare,
  Building,
  RotateCcw,
  LayoutGrid,
  List,
  Compass,
  DollarSign,
  Check,
  X,
  Sparkles,
  Building2,
  Home,
  Layers,
  ArrowUpDown,
  Filter,
} from 'lucide-react';
import { Language, PageId, Property, PropertyFilterParams, PropertyType } from '../types';
import { translations } from '../lib/translations';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { PropertyCard } from '../components/ui/PropertyCard';
import { PropertyMapView } from '../components/properties/PropertyMapView';
import { useData } from '../context/DataContext';
import { SAUDI_CITIES } from '../data/cities';
import { CitySearchDropdown } from '../components/ui/CitySearchDropdown';

interface PropertiesPageProps {
  onNavigate: (page: PageId, filters?: PropertyFilterParams) => void;
  onSelectProperty: (property: Property) => void;
  language: Language;
  onOpenBookViewingModal: (property: Property) => void;
  initialFilters?: PropertyFilterParams | null;
}

export function PropertiesPage({
  onNavigate,
  onSelectProperty,
  language,
  onOpenBookViewingModal,
  initialFilters,
}: PropertiesPageProps) {
  const t = translations[language];
  const { properties: liveProperties, isLoading } = useData();

  // Filters State
  const [searchQuery, setSearchQuery] = useState(initialFilters?.searchQuery || '');
  const [statusFilter, setStatusFilter] = useState<string>(initialFilters?.status || 'all');
  const [typeFilter, setTypeFilter] = useState<string>(initialFilters?.type || 'all');
  const [bedroomFilter, setBedroomFilter] = useState<string>(initialFilters?.bedroom || 'all');
  const [locationFilter, setLocationFilter] = useState<string>(initialFilters?.city || 'all');
  const [maxPrice, setMaxPrice] = useState<number>(initialFilters?.maxPrice ?? 50000000); // Up to 50M SAR
  const [minPrice, setMinPrice] = useState<number>(initialFilters?.minPrice ?? 0);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'area-desc' | 'beds-desc'>('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [isAdvancedFiltersOpen, setIsAdvancedFiltersOpen] = useState(false);

  // Sync state when initialFilters changes (e.g. user navigates from Home search with new criteria)
  useEffect(() => {
    if (initialFilters) {
      if (initialFilters.searchQuery !== undefined) setSearchQuery(initialFilters.searchQuery);
      if (initialFilters.status !== undefined) setStatusFilter(initialFilters.status);
      if (initialFilters.type !== undefined) setTypeFilter(initialFilters.type);
      if (initialFilters.city !== undefined) setLocationFilter(initialFilters.city);
      if (initialFilters.minPrice !== undefined) setMinPrice(initialFilters.minPrice);
      if (initialFilters.maxPrice !== undefined) setMaxPrice(initialFilters.maxPrice);
      if (initialFilters.bedroom !== undefined) setBedroomFilter(initialFilters.bedroom);
    }
  }, [initialFilters]);

  // Extract unique locations dynamically from live database
  const uniqueLocations = useMemo(() => {
    const locations = new Set<string>();
    liveProperties.forEach((p) => {
      locations.add(p.location.area[language] || p.location.area.en);
    });
    return Array.from(locations);
  }, [liveProperties, language]);

  // Compute counts for Property Types
  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: liveProperties.length,
      villa: 0,
      apartment: 0,
      penthouse: 0,
      townhouse: 0,
      commercial: 0,
    };
    liveProperties.forEach((p) => {
      if (counts[p.type] !== undefined) {
        counts[p.type]++;
      }
    });
    return counts;
  }, [liveProperties]);

  // Compute filtered list
  const filteredProperties = useMemo(() => {
    return liveProperties
      .filter((item) => {
        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle =
            item.title.en.toLowerCase().includes(q) ||
            item.title.ar.toLowerCase().includes(q);
          const matchesArea =
            item.location.area.en.toLowerCase().includes(q) ||
            item.location.area.ar.toLowerCase().includes(q);
          const matchesCity =
            item.location.city.en.toLowerCase().includes(q) ||
            item.location.city.ar.toLowerCase().includes(q);
          const matchesDesc =
            item.description.en.toLowerCase().includes(q) ||
            item.description.ar.toLowerCase().includes(q);
          if (!matchesTitle && !matchesArea && !matchesCity && !matchesDesc) return false;
        }

        // Status
        if (statusFilter !== 'all' && item.status !== statusFilter) return false;

        // Type
        if (typeFilter !== 'all' && item.type !== typeFilter) return false;

        // Location / City
        if (locationFilter !== 'all') {
          const locLower = locationFilter.toLowerCase();
          const cityObj = SAUDI_CITIES.find(
            (c) => c.ar.toLowerCase() === locLower || c.en.toLowerCase() === locLower
          );
          const searchAr = cityObj ? cityObj.ar.toLowerCase() : locLower;
          const searchEn = cityObj ? cityObj.en.toLowerCase() : locLower;

          const itemAreaEn = item.location.area.en.toLowerCase();
          const itemAreaAr = item.location.area.ar.toLowerCase();
          const itemCityEn = item.location.city.en.toLowerCase();
          const itemCityAr = item.location.city.ar.toLowerCase();
          
          const matches =
            itemCityAr === searchAr ||
            itemCityEn === searchEn ||
            itemCityAr === locLower ||
            itemCityEn === locLower ||
            itemAreaAr === searchAr ||
            itemAreaEn === searchEn ||
            itemAreaAr === locLower ||
            itemAreaEn === locLower ||
            itemCityAr.includes(searchAr) ||
            itemCityEn.includes(searchEn) ||
            itemCityAr.includes(locLower) ||
            itemCityEn.includes(locLower) ||
            searchAr.includes(itemCityAr) ||
            searchEn.includes(itemCityEn) ||
            locLower.includes(itemCityAr) ||
            locLower.includes(itemCityEn) ||
            itemAreaAr.includes(searchAr) ||
            itemAreaEn.includes(searchEn) ||
            itemAreaAr.includes(locLower) ||
            itemAreaEn.includes(locLower);

          if (!matches) return false;
        }

        // Bedrooms
        if (bedroomFilter !== 'all') {
          if (bedroomFilter === '5+' && item.bedrooms < 5) return false;
          if (bedroomFilter !== '5+' && item.bedrooms.toString() !== bedroomFilter) return false;
        }

        // Price Range (SAR comparison)
        if (item.price.sar < minPrice) return false;
        if (maxPrice < 50000000 && item.price.sar > maxPrice) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price.sar - b.price.sar;
        if (sortBy === 'price-desc') return b.price.sar - a.price.sar;
        if (sortBy === 'area-desc') return b.areaSqFt - a.areaSqFt;
        if (sortBy === 'beds-desc') return b.bedrooms - a.bedrooms;
        // Default: featured first
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [searchQuery, statusFilter, typeFilter, locationFilter, bedroomFilter, minPrice, maxPrice, sortBy, language]);

  // Active filters count
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchQuery.trim()) count++;
    if (statusFilter !== 'all') count++;
    if (typeFilter !== 'all') count++;
    if (locationFilter !== 'all') count++;
    if (bedroomFilter !== 'all') count++;
    if (maxPrice < 50000000 || minPrice > 0) count++;
    return count;
  }, [searchQuery, statusFilter, typeFilter, locationFilter, bedroomFilter, minPrice, maxPrice]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTypeFilter('all');
    setLocationFilter('all');
    setBedroomFilter('all');
    setMinPrice(0);
    setMaxPrice(50000000);
    setSortBy('featured');
  };

  const propertyTypeTabs: { id: string; label: string; icon: any }[] = [
    { id: 'all', label: t.properties.filters.allTypes, icon: Layers },
    { id: 'villa', label: t.properties.filters.villa, icon: Home },
    { id: 'apartment', label: t.properties.filters.apartment, icon: Building2 },
    { id: 'penthouse', label: t.properties.filters.penthouse, icon: Sparkles },
    { id: 'townhouse', label: t.properties.filters.townhouse, icon: Building },
    { id: 'commercial', label: t.properties.filters.commercial, icon: Building2 },
  ];

  const pricePresets = [
    { label: language === 'en' ? 'Any Price' : 'أي سعر', max: 50000000 },
    { label: language === 'en' ? 'Under 5M SAR' : 'أقل من 5 مليون ر.س', max: 5000000 },
    { label: language === 'en' ? 'Under 10M SAR' : 'أقل من 10 مليون ر.س', max: 10000000 },
    { label: language === 'en' ? 'Under 25M SAR' : 'أقل من 25 مليون ر.س', max: 25000000 },
    { label: language === 'en' ? '25M+ SAR' : 'أكثر من 25 مليون ر.س', min: 25000000, max: 50000000 },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <Badge variant="primary">
            {language === 'en' ? 'Verified Brokerage Inventory' : 'محفظة العقارات المعتمدة'}
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display-serif tracking-tight">
            {t.properties.pageTitle}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-2xl">
            {t.properties.pageSubtitle}
          </p>
        </div>

        {/* Live Filter Counter pill */}
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span>
              {filteredProperties.length} {language === 'en' ? 'Units Available' : 'عقار متاح'}
            </span>
          </div>
        </div>
      </div>

      {/* Property Type Visual Pill Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {propertyTypeTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = typeFilter === tab.id;
          const count = typeCounts[tab.id] ?? 0;
          return (
            <button
              key={tab.id}
              onClick={() => setTypeFilter(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full ${
                  isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Search & Interactive Filter Control Panel */}
      <div className="relative z-30 bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-sm space-y-6 overflow-visible">
        {/* Primary Row: Search, Status, Location, and Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 relative z-30 overflow-visible">
          {/* Keyword Search (4 cols) */}
          <div className="lg:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5" />
            <input
              type="text"
              placeholder={t.properties.filters.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full ps-10 pe-9 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute top-3 end-3 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Location / City Dropdown (3 cols) */}
          <div className="lg:col-span-3">
            <CitySearchDropdown
              value={locationFilter}
              onChange={(city) => setLocationFilter(city)}
              language={language}
              placeholder={t.properties.filters.allCities}
              allOptionLabel={t.properties.filters.allCities}
              showAllOption={true}
              id="properties-city-search"
            />
          </div>

          {/* Status Tabs / Selector (2 cols) */}
          <div className="lg:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer"
            >
              <option value="all">{t.properties.filters.allStatus}</option>
              <option value="for-sale">{t.properties.filters.forSale}</option>
              <option value="for-rent">{t.properties.filters.forRent}</option>
              <option value="off-plan">{t.properties.filters.offPlan}</option>
            </select>
          </div>

          {/* Sort By (3 cols) */}
          <div className="lg:col-span-3 relative">
            <ArrowUpDown className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5 pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full ps-10 pe-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none transition-all cursor-pointer"
            >
              <option value="featured">{t.properties.filters.featuredFirst}</option>
              <option value="price-asc">{t.properties.filters.priceLowToHigh}</option>
              <option value="price-desc">{t.properties.filters.priceHighToLow}</option>
              <option value="area-desc">{language === 'en' ? 'Area: Largest First' : 'المساحة: الأكبر أولاً'}</option>
              <option value="beds-desc">{language === 'en' ? 'Bedrooms: Most First' : 'غرف النوم: الأكثر أولاً'}</option>
            </select>
          </div>
        </div>

        {/* Interactive Price Range & Bedroom Controls */}
        <div className="pt-4 border-t border-slate-100 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Price Range Slider Section (7 cols) */}
          <div className="lg:col-span-7 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-blue-600" />
                {t.properties.filters.priceRange}:
              </span>
              <span className="font-bold text-blue-600 font-display-serif text-sm">
                {maxPrice >= 50000000
                  ? t.properties.filters.anyPrice
                  : `${language === 'en' ? 'Up to' : 'حتى'} ${(maxPrice / 1000000).toFixed(1)}M SAR`}
              </span>
            </div>

            {/* Interactive Slider */}
            <div className="space-y-1">
              <input
                type="range"
                min="500000"
                max="50000000"
                step="500000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>500k</span>
                <span>10M</span>
                <span>25M</span>
                <span>40M</span>
                <span>50M+ SAR</span>
              </div>
            </div>

            {/* Price Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {pricePresets.map((preset, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (preset.min) {
                      setMinPrice(preset.min);
                      setMaxPrice(preset.max);
                    } else {
                      setMinPrice(0);
                      setMaxPrice(preset.max);
                    }
                  }}
                  className={`text-[11px] px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                    maxPrice === preset.max && (preset.min ? minPrice === preset.min : minPrice === 0)
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bedroom Filter Chips (5 cols) */}
          <div className="lg:col-span-5 space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              {t.properties.filters.bedrooms}
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {['all', '1', '2', '3', '4', '5+'].map((beds) => {
                const isSelected = bedroomFilter === beds;
                return (
                  <button
                    key={beds}
                    onClick={() => setBedroomFilter(beds)}
                    className={`py-2 px-1 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {beds === 'all' ? (language === 'en' ? 'All' : 'الكل') : beds}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Active Filter Chips & Reset All Bar */}
        {activeFiltersCount > 0 && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-slate-400 font-medium me-1">
                {t.properties.filters.activeFilters} ({activeFiltersCount}):
              </span>

              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                  "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="cursor-pointer hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {typeFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-medium capitalize">
                  {t.properties.filters[typeFilter as keyof typeof t.properties.filters] || typeFilter}
                  <button onClick={() => setTypeFilter('all')} className="cursor-pointer hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {locationFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                  {locationFilter}
                  <button onClick={() => setLocationFilter('all')} className="cursor-pointer hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {statusFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                  {statusFilter === 'for-sale'
                    ? t.properties.filters.forSale
                    : statusFilter === 'for-rent'
                    ? t.properties.filters.forRent
                    : t.properties.filters.offPlan}
                  <button onClick={() => setStatusFilter('all')} className="cursor-pointer hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {bedroomFilter !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                  {bedroomFilter} {t.properties.beds}
                  <button onClick={() => setBedroomFilter('all')} className="cursor-pointer hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {maxPrice < 20000000 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                  &le; ${(maxPrice / 1000000).toFixed(1)}M
                  <button onClick={() => setMaxPrice(20000000)} className="cursor-pointer hover:text-blue-900">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>

            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer transition-colors px-2 py-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.properties.filters.clearAll}</span>
            </button>
          </div>
        )}
      </div>

      {/* Results Controls Bar: Results Count & View Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs sm:text-sm font-medium text-slate-600">
          {t.properties.filters.showing}{' '}
          <strong className="text-slate-900 font-bold text-base">{filteredProperties.length}</strong>{' '}
          {t.properties.filters.of} <strong className="text-slate-900">{liveProperties.length}</strong>{' '}
          {t.properties.filters.propertiesFound}
        </p>

        <div className="flex items-center gap-1 border border-slate-200 rounded-2xl p-1 bg-white shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
              viewMode === 'grid'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Grid View (3 Columns)"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'شبكة' : 'Grid'}</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
              viewMode === 'list'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="List View"
          >
            <List className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'قائمة' : 'List'}</span>
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
              viewMode === 'map'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
            }`}
            title="Google Maps API Integration"
          >
            <Compass className="w-3.5 h-3.5 text-sky-400" />
            <span>{language === 'ar' ? 'الخريطة' : 'Map View'}</span>
          </button>
        </div>
      </div>

      {/* Properties Output View (Map / Grid / List) */}
      {viewMode === 'map' ? (
        <PropertyMapView
          properties={filteredProperties}
          language={language}
          onSelectProperty={onSelectProperty}
          onOpenBookViewingModal={onOpenBookViewingModal}
        />
      ) : filteredProperties.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-4 max-w-md mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center mx-auto">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 font-display-serif">
            {t.properties.noResultsTitle}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            {t.properties.noResultsDesc}
          </p>
          <div className="pt-2">
            <Button variant="primary" onClick={handleResetFilters}>
              <RotateCcw className="w-4 h-4" />
              <span>{t.properties.filters.clearAll}</span>
            </Button>
          </div>
        </div>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'space-y-6'
          }
        >
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              language={language}
              onSelectProperty={onSelectProperty}
              onOpenBookViewingModal={onOpenBookViewingModal}
              layout={viewMode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
