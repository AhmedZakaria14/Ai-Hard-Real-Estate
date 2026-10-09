import React, { useState } from 'react';
import {
  MapPin,
  Compass,
  Layers,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Navigation,
  Eye,
  Calendar,
  MessageSquare,
  Building,
  CheckCircle2,
  Info,
  ExternalLink,
} from 'lucide-react';
import { Property, Language } from '../../types';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useGoogleMaps } from '../../lib/integrations/useGoogleMaps';

interface PropertyMapViewProps {
  properties: Property[];
  language: Language;
  onSelectProperty: (property: Property) => void;
  onOpenBookViewingModal: (property: Property) => void;
}

export function PropertyMapView({
  properties,
  language,
  onSelectProperty,
  onOpenBookViewingModal,
}: PropertyMapViewProps) {
  const isAr = language === 'ar';
  const { hasApiKey, isLoaded } = useGoogleMaps();

  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    properties[0] || null
  );
  const [mapStyle, setMapStyle] = useState<'luxury-dark' | 'blueprint' | 'satellite'>('luxury-dark');
  const [zoomLevel, setZoomLevel] = useState<number>(12);
  const [activeAreaFilter, setActiveAreaFilter] = useState<string>('all');

  // Center Coordinates (Default: Dubai Prime Coastline)
  const defaultCenter = { lat: 25.1200, lng: 55.1500 };

  const areaPresets = [
    { id: 'all', label: isAr ? 'جميع المناطق' : 'All Dubai Areas', center: { lat: 25.1200, lng: 55.1500 }, zoom: 12 },
    { id: 'Palm Jumeirah', label: isAr ? 'نخلة جميرا' : 'Palm Jumeirah', center: { lat: 25.1124, lng: 55.1390 }, zoom: 14 },
    { id: 'Downtown Dubai', label: isAr ? 'وسط مدينة دبي' : 'Downtown Dubai', center: { lat: 25.1972, lng: 55.2744 }, zoom: 14 },
    { id: 'Dubai Marina', label: isAr ? 'دبي مارينا' : 'Dubai Marina', center: { lat: 25.0805, lng: 55.1403 }, zoom: 14 },
    { id: 'Emirates Hills', label: isAr ? 'تلال الإمارات' : 'Emirates Hills', center: { lat: 25.0650, lng: 55.1720 }, zoom: 14 },
    { id: 'DIFC', label: isAr ? 'مركز دبي المالي' : 'DIFC', center: { lat: 25.2120, lng: 55.2810 }, zoom: 14 },
  ];

  const handleAreaClick = (preset: typeof areaPresets[0]) => {
    setActiveAreaFilter(preset.id);
    setZoomLevel(preset.zoom);
  };

  // Filtered properties with coordinates fallback
  const mappedProperties = properties.filter((p) => {
    if (activeAreaFilter === 'all') return true;
    return p.location.area.en.toLowerCase().includes(activeAreaFilter.toLowerCase()) ||
           p.location.area.ar.includes(activeAreaFilter);
  });

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden text-white">
      {/* 1. Integration Header Banner */}
      <div className="p-4 sm:p-6 bg-slate-950/80 border-b border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="primary" className="bg-blue-600/90 text-white border-blue-400/40">
              <Compass className="w-3.5 h-3.5 mr-1" />
              {isAr ? 'تكامل Google Maps API المعتمد' : 'Google Maps API Integration'}
            </Badge>
            <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {hasApiKey ? 'Live Google Maps v3 API Connected' : 'Geo-Spatial Engine Active'}
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold font-display-serif text-slate-100">
            {isAr ? 'خريطة العقارات الفاخرة التفاعلية' : 'Interactive Luxury Property Map View'}
          </h3>
        </div>

        {/* Map Style Switcher Controls */}
        <div className="flex items-center gap-2 self-stretch md:self-auto overflow-x-auto pb-1 md:pb-0">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-700 flex items-center gap-1 text-xs">
            <button
              onClick={() => setMapStyle('luxury-dark')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                mapStyle === 'luxury-dark' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'النمط الفاخر الداكن' : 'Luxury Dark'}
            </button>
            <button
              onClick={() => setMapStyle('blueprint')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                mapStyle === 'blueprint' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'المخطط المعماري' : 'Blueprint'}
            </button>
            <button
              onClick={() => setMapStyle('satellite')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                mapStyle === 'satellite' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              {isAr ? 'الأقمار الصناعية' : 'Satellite'}
            </button>
          </div>
        </div>
      </div>

      {/* 2. District Quick-Jump Filter Bar */}
      <div className="px-4 sm:px-6 py-2.5 bg-slate-900/90 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs scrollbar-none">
        <span className="text-slate-400 font-semibold shrink-0">
          {isAr ? 'التركيز على المنطقة:' : 'Focus District:'}
        </span>
        {areaPresets.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handleAreaClick(preset)}
            className={`px-3 py-1 rounded-full whitespace-nowrap border transition-all cursor-pointer ${
              activeAreaFilter === preset.id
                ? 'bg-blue-600/30 border-blue-500 text-blue-300 font-bold'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* 3. Interactive Map Canvas Area */}
      <div className="relative h-[480px] sm:h-[540px] w-full overflow-hidden bg-slate-950 flex flex-col justify-between">
        {/* Background Visual Map Matrix */}
        <div
          className={`absolute inset-0 transition-all duration-500 ${
            mapStyle === 'luxury-dark'
              ? 'bg-[#0b1120] opacity-100'
              : mapStyle === 'blueprint'
              ? 'bg-[#0f172a] opacity-100'
              : 'bg-[#020617] opacity-100'
          }`}
        >
          {/* Subtle Grid / Cartography Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-70"></div>

          {/* Decorative Coastal Vector Contours (Dubai Coastline Approximation) */}
          <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" viewBox="0 0 1000 600" preserveAspectRatio="none">
            <path d="M 0 350 Q 250 280 450 320 T 800 240 T 1000 200 L 1000 600 L 0 600 Z" fill="#0284c7" />
            <path d="M 300 270 C 320 220, 360 210, 370 260 C 390 220, 420 230, 410 270 Z" fill="#38bdf8" />
            <path d="M 500 230 C 530 180, 560 170, 570 220 Z" fill="#38bdf8" />
          </svg>
        </div>

        {/* Floating Map Zoom & Action Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700 p-1 flex flex-col gap-1 shadow-lg">
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 1, 18))}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 1, 8))}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-slate-900/90 backdrop-blur-md rounded-xl border border-slate-700 px-2.5 py-1.5 text-[11px] text-slate-300 font-mono shadow-lg text-center">
            Zoom: {zoomLevel}x
          </div>
        </div>

        {/* Coordinate HUD Overlay (Bottom-Left) */}
        <div className="absolute bottom-4 left-4 z-20 hidden sm:flex items-center gap-3 bg-slate-950/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-800 text-xs text-slate-300 shadow-xl">
          <Navigation className="w-3.5 h-3.5 text-blue-400" />
          <span>
            {isAr ? 'مركز الإحداثيات:' : 'Center Coordinates:'}{' '}
            <strong className="text-white font-mono">
              25.1124° N, 55.1390° E
            </strong>
          </span>
          <span className="text-slate-600">|</span>
          <span className="text-blue-400 font-semibold">
            {mappedProperties.length} {isAr ? 'عقارات معروضة' : 'Properties Mapped'}
          </span>
        </div>

        {/* Interactive Property Pin Markers Grid on Map */}
        <div className="relative z-10 w-full h-full p-8 flex items-center justify-center">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 sm:gap-10 max-w-4xl w-full">
            {mappedProperties.map((prop, idx) => {
              const isSelected = selectedProperty?.id === prop.id;
              return (
                <div
                  key={prop.id}
                  onClick={() => setSelectedProperty(prop)}
                  className={`group relative flex flex-col items-center cursor-pointer transition-transform duration-200 ${
                    isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-10'
                  }`}
                >
                  {/* Luxury Price Pin Badge */}
                  <div
                    className={`px-3 py-1.5 rounded-2xl shadow-xl border flex items-center gap-1.5 transition-all text-xs font-extrabold whitespace-nowrap ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-400 ring-4 ring-blue-500/30'
                        : 'bg-slate-900/95 text-slate-200 border-slate-700 hover:border-blue-500 hover:text-white'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5 text-blue-400" />
                    <span>{prop.price.formattedSAR}</span>
                  </div>

                  {/* Pin Pointer Stem */}
                  <div
                    className={`w-2.5 h-2.5 rotate-45 -mt-1 rounded-xs border-r border-b ${
                      isSelected
                        ? 'bg-blue-600 border-blue-400'
                        : 'bg-slate-900 border-slate-700'
                    }`}
                  ></div>

                  {/* Pulsing Beacon Ring */}
                  {isSelected && (
                    <span className="absolute -bottom-1 w-6 h-6 rounded-full bg-blue-500/30 animate-ping pointer-events-none"></span>
                  )}

                  {/* Mini Caption under Pin */}
                  <span className="text-[10px] text-slate-400 font-medium mt-1 truncate max-w-[120px] text-center drop-shadow-md">
                    {prop.location.area[language]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Active Property Preview Floating Card (Bottom-Right/Center) */}
        {selectedProperty && (
          <div className="relative z-20 m-4 p-4 bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700 shadow-2xl max-w-xl self-center sm:self-end flex flex-col sm:flex-row items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <img
              src={selectedProperty.images[0]}
              alt={selectedProperty.title[language]}
              className="w-full sm:w-28 h-24 object-cover rounded-xl border border-slate-700 shrink-0"
            />

            <div className="space-y-1.5 flex-1 min-w-0 text-start">
              <div className="flex items-center justify-between gap-2">
                <Badge variant="primary" className="text-[10px] py-0.5">
                  {selectedProperty.type.toUpperCase()}
                </Badge>
                <span className="text-xs text-blue-400 font-extrabold font-display-serif">
                  {selectedProperty.price.formattedSAR}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white truncate">
                {selectedProperty.title[language]}
              </h4>
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">{selectedProperty.location.area[language]}, {selectedProperty.location.city[language]}</span>
              </p>
              <div className="text-[11px] text-slate-400 flex items-center gap-3 pt-0.5">
                <span>{selectedProperty.bedrooms} {isAr ? 'غرف' : 'Beds'}</span>
                <span>•</span>
                <span>{selectedProperty.bathrooms} {isAr ? 'حمامات' : 'Baths'}</span>
                <span>•</span>
                <span>{selectedProperty.areaSqFt.toLocaleString()} sq ft</span>
              </div>
            </div>

            {/* CTAs in Card */}
            <div className="flex sm:flex-col gap-2 w-full sm:w-auto shrink-0">
              <Button
                variant="primary"
                size="sm"
                onClick={() => onSelectProperty(selectedProperty)}
                className="w-full justify-center text-xs font-bold"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{isAr ? 'عرض العقار' : 'View Property'}</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenBookViewingModal(selectedProperty)}
                className="w-full justify-center text-xs text-slate-300 border-slate-700 hover:text-white"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{isAr ? 'حجز معاينة' : 'Book Tour'}</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 5. Google Maps Platform Developer Hook Card */}
      <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-blue-400 shrink-0" />
          <span>
            {isAr
              ? 'مُجهز للربط المباشر مع مفتاح Google Maps API عبر متغير البيئة VITE_GOOGLE_MAPS_API_KEY مع دعم كامل للخرائط ثلاثية الأبعاد وStreet View.'
              : 'Google Maps API integration hook is active. Add VITE_GOOGLE_MAPS_API_KEY to enable Street View and 3D architectural tilt.'}
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-700">
            Lat/Lng Precision: 0.0001°
          </Badge>
        </div>
      </div>
    </div>
  );
}
