import { LocalizedValue } from '../../components/ui/LocalizedValue';
import { SearchableSelect } from '../../components/ui/SearchableSelect';
import { InterfaceText } from '../../components/ui/InterfaceText';
import { useTextOverride } from '../../context/TextOverrideContext';
import React, { useState, useEffect } from 'react';
import {
  Calculator,
  TrendingDown,
  Zap,
  Leaf,
  ArrowRight,
  ArrowLeft,
  Gauge,
  Info,
  Clock,
  Building2,
  Calendar,
  Layers,
  ShieldAlert,
} from 'lucide-react';
import { useHVAC } from '../context/HVACContext';
import { pick } from '../translations';
import { EfficiencyTier } from '../types';
import { subscribeToPublishedCalculatorConfig } from '../../lib/calculators/calculatorConfigService';
import { calculateHVACEfficiencyWithConfig } from '../../lib/calculators/calculatorEngine';
import { HVACCalculatorConfigDoc } from '../../lib/calculators/calculatorTypes';

export function HVACEfficiencyCalculator() {
  const { hvac: T } = useTextOverride();
  const { language, isAr, openBookingModal } = useHVAC();

  const [publishedConfig, setPublishedConfig] = useState<HVACCalculatorConfigDoc | null>(null);

  useEffect(() => {
    const unsub = subscribeToPublishedCalculatorConfig('hvac', (docData) => {
      setPublishedConfig(docData as HVACCalculatorConfigDoc);
    });
    return () => unsub();
  }, []);

  // Explicit User Inputs
  const [areaSqM, setAreaSqM] = useState<number>(150);
  const [baselineSeer, setBaselineSeer] = useState<number>(10.5);
  const [targetTier, setTargetTier] = useState<EfficiencyTier>('inverter_high');
  const [dailyHours, setDailyHours] = useState<number>(12);
  const [tariffRate, setTariffRate] = useState<number>(0.18);
  const [horizonYears, setHorizonYears] = useState<number>(1);

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  // Upgraded target tier configurations (SEER ratings grounded in Saudi SASO / SEEC standards)
  const targetTierConfig: Record<
    EfficiencyTier,
    { label: string; seer: number; seerDisplay: string }
  > = {
    split_standard: {
      label: pick(T.calculator.tierSplitStandard, language),
      seer: 13.5,
      seerDisplay: '13.5 SEER',
    },
    inverter_high: {
      label: pick(T.calculator.tierInverterHigh, language),
      seer: 18.0,
      seerDisplay: '18.0 SEER (Inverter)',
    },
    package_unit: {
      label: pick(T.calculator.tierPackage, language),
      seer: 15.5,
      seerDisplay: '15.5 SEER',
    },
    vrf_central: {
      label: pick(T.calculator.tierVRF, language),
      seer: 21.0,
      seerDisplay: '21.0+ SEER (Smart VRF)',
    },
  };

  const calcResult = calculateHVACEfficiencyWithConfig(
    {
      areaSqM,
      baselineSeer,
      targetTier,
      dailyHours,
      tariffRate,
      horizonYears,
    },
    publishedConfig?.coefficients
  );

  const estimatedTR = calcResult.estimatedTR;
  const coolingLoadBTUh = calcResult.coolingLoadBTUh;
  const annualOperatingHours = calcResult.annualOperatingHours;
  const totalFinancialSavingsSAR = calcResult.totalFinancialSavingsSAR;
  const totalCo2OffsetTons = calcResult.totalCo2OffsetTons;
  const totalKWhSaved = calcResult.totalKWhSaved;
  const efficiencyGainPercent = calcResult.efficiencyGainPercent;

  // Realistic Precision Formatting
  const formattedFinancialSavings = (Math.round((totalFinancialSavingsSAR || 0) / 10) * 10).toLocaleString();
  const formattedKWhSaved = (Math.round((totalKWhSaved || 0) / 100) * 100).toLocaleString();
  const formattedCo2Tons = (totalCo2OffsetTons || 0).toFixed(1);

  return (
    <section id="calculator" className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] text-xs font-semibold">
            <Calculator className="w-3.5 h-3.5" />
            <span><LocalizedValue value={pick(T.calculator.eyebrow, language)} /></span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight">
            <LocalizedValue value={pick(T.calculator.title, language)} />
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            <LocalizedValue value={pick(T.calculator.subtitle, language)} />
          </p>

          {/* Illustrative Simulation Tag */}
          <div className="pt-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md bg-amber-50 border border-amber-200/80 text-amber-900 text-xs font-medium">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span><LocalizedValue value={pick(T.calculator.illustrativeTag, language)} /></span>
            </span>
          </div>
        </div>

        {/* Main Interactive Box */}
        <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xs max-w-5xl mx-auto space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (6 cols): Input Parameters */}
            <div className="lg:col-span-6 space-y-6 text-start">
              {/* 1. Area Slider */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#0EA5E9]" />
                    <span><LocalizedValue value={pick(T.calculator.areaSliderLabel, language)} /></span>
                  </label>
                  <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-xs sm:text-sm font-bold text-[#0EA5E9] font-mono shadow-xs">
                    <LocalizedValue value={areaSqM} /><InterfaceText id="hvac.HVACEfficiencyCalculator.kw8a2ae" source="m² (" /><LocalizedValue value={estimatedTR.toFixed(1)} /><InterfaceText id="hvac.HVACEfficiencyCalculator.k19hbviy" source="TR) " /></span>
                </div>
                <input
                  type="range"
                  min={30}
                  max={800}
                  step={10}
                  value={areaSqM}
                  onChange={(e) => setAreaSqM(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0EA5E9]"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span><InterfaceText id="hvac.HVACEfficiencyCalculator.krc3r1" source="30 m²" /></span>
                  <span><InterfaceText id="hvac.HVACEfficiencyCalculator.k113vtvo" source="250 m² (Villa)" /></span>
                  <span><InterfaceText id="hvac.HVACEfficiencyCalculator.k1e5il37" source="800 m² (Commercial)" /></span>
                </div>
              </div>

              {/* 2. Existing Baseline Efficiency Dropdown */}
              <div className="space-y-2">
                <label className="block text-xs sm:text-sm font-semibold text-slate-800">
                  <LocalizedValue value={pick(T.calculator.baselineLabel, language)} />
                </label>
                <SearchableSelect
                  value={baselineSeer}
                  onChange={(e) => setBaselineSeer(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] cursor-pointer"
                >
                  <option value={10.5}>{pick(T.calculator.baselineLegacy, language)}</option>
                  <option value={11.5}>{pick(T.calculator.baselineStandardCentral, language)}</option>
                  <option value={10.0}>{pick(T.calculator.baselineChiller, language)}</option>
                </SearchableSelect>
              </div>

              {/* 3. Upgraded Target System Selector */}
              <div className="space-y-2.5">
                <label className="block text-xs sm:text-sm font-semibold text-slate-800">
                  <LocalizedValue value={pick(T.calculator.tierLabel, language)} />
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(
                    [
                      'split_standard',
                      'inverter_high',
                      'package_unit',
                      'vrf_central',
                    ] as EfficiencyTier[]
                  ).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTargetTier(t)}
                      className={`p-2.5 rounded-xl text-xs font-semibold text-start border transition-all cursor-pointer ${
                        targetTier === t
                          ? 'bg-[#0EA5E9] text-white border-[#0EA5E9] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate"><LocalizedValue value={targetTierConfig[t].label} /></span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                            targetTier === t
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 text-[#0EA5E9]'
                          }`}
                        >
                          <LocalizedValue value={targetTierConfig[t].seerDisplay} />
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Daily Operating Hours Selector */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#0EA5E9]" />
                  <span><LocalizedValue value={pick(T.calculator.hoursLabel, language)} /></span>
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs font-semibold">
                  {[8, 12, 16, 24].map((hrs) => (
                    <button
                      key={hrs}
                      type="button"
                      onClick={() => setDailyHours(hrs)}
                      className={`py-2 rounded-xl border transition-all cursor-pointer ${
                        dailyHours === hrs
                          ? 'bg-[#002B49] text-white border-[#002B49]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <LocalizedValue value={hrs} /> {isAr ? <InterfaceText id="hvac.HVACEfficiencyCalculator.k1osetvj" source="ساعات" /> : <InterfaceText id="hvac.HVACEfficiencyCalculator.k1wwytft" source="hrs/day" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. SEC Electricity Tariff Category Dropdown */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#0EA5E9]" />
                  <span><LocalizedValue value={pick(T.calculator.tariffLabel, language)} /></span>
                </label>
                <SearchableSelect
                  value={tariffRate}
                  onChange={(e) => setTariffRate(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white text-slate-800 focus:outline-none focus:border-[#0EA5E9] focus:ring-1 focus:ring-[#0EA5E9] cursor-pointer"
                >
                  <option value={0.18}>{pick(T.calculator.tariffResidential, language)}</option>
                  <option value={0.30}>{pick(T.calculator.tariffResidentialTier2, language)}</option>
                  <option value={0.20}>{pick(T.calculator.tariffCommercial, language)}</option>
                  <option value={0.26}>{pick(T.calculator.tariffGovernment, language)}</option>
                </SearchableSelect>
              </div>

              {/* 6. Calculation Horizon Period Buttons */}
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-[#0EA5E9]" />
                  <span><LocalizedValue value={pick(T.calculator.periodLabel, language)} /></span>
                </label>
                <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
                  {[
                    { yrs: 1, key: 'period1Yr' },
                    { yrs: 3, key: 'period3Yr' },
                    { yrs: 5, key: 'period5Yr' },
                  ].map((p) => (
                    <button
                      key={p.yrs}
                      type="button"
                      onClick={() => setHorizonYears(p.yrs)}
                      className={`py-2 px-2 rounded-xl border transition-all cursor-pointer text-center ${
                        horizonYears === p.yrs
                          ? 'bg-[#0EA5E9] text-white border-[#0EA5E9]'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <LocalizedValue value={pick(T.calculator[p.key as keyof typeof T.calculator], language)} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (6 cols): Output Metrics & Model Parameters */}
            <div className="lg:col-span-6 space-y-4">
              {/* Metric 1: Financial Savings */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-start flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span><LocalizedValue value={pick(T.calculator.annualSavingsTitle, language)} /> (<LocalizedValue value={horizonYears} /> {isAr ? <InterfaceText id="hvac.HVACEfficiencyCalculator.ksjmyv3" source="سنة" /> : <InterfaceText id="hvac.HVACEfficiencyCalculator.kldtb0y" source="Yr" />})</span>
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
                    <bdi dir="ltr"><LocalizedValue value={formattedFinancialSavings} /></bdi>
                    <span className="text-xs text-slate-500 font-normal ms-1">
                      {isAr ? <InterfaceText id="hvac.HVACEfficiencyCalculator.k1jw21zb" source="ريال وفر مالي" /> : <InterfaceText id="hvac.HVACEfficiencyCalculator.k1qu3az2" source="SAR savings" />}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <TrendingDown className="w-6 h-6" />
                </div>
              </div>

              {/* Metric 2: Electrical Energy Saved (kWh) */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-start flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-[#0EA5E9]" />
                    <span><LocalizedValue value={pick(T.calculator.kwhSavedTitle, language)} /></span>
                  </span>
                  <div className="text-xl sm:text-2xl font-bold text-[#0EA5E9] font-mono">
                    <bdi dir="ltr"><LocalizedValue value={formattedKWhSaved} /></bdi>
                    <span className="text-xs text-slate-500 font-normal ms-1"><InterfaceText id="hvac.HVACEfficiencyCalculator.ko1q7tp" source="kWh (" /><LocalizedValue value={efficiencyGainPercent > 0 ? `+${efficiencyGainPercent}%` : ''} /><InterfaceText id="hvac.HVACEfficiencyCalculator.k130u8gn" source="SEER) " /></span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#0EA5E9] flex items-center justify-center shrink-0">
                  <Gauge className="w-6 h-6" />
                </div>
              </div>

              {/* Metric 3: Carbon Offset */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-start flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                    <span><LocalizedValue value={pick(T.calculator.carbonOffsetTitle, language)} /></span>
                  </span>
                  <div className="text-xl sm:text-2xl font-bold text-emerald-700 font-mono">
                    <bdi dir="ltr"><LocalizedValue value={formattedCo2Tons} /></bdi>
                    <span className="text-xs text-slate-500 font-normal ms-1">
                      {isAr ? <InterfaceText id="hvac.HVACEfficiencyCalculator.ky9z8st" source="طن انبعاثات" /> : <InterfaceText id="hvac.HVACEfficiencyCalculator.k1ft2ea7" source="Tons CO₂" />}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Leaf className="w-6 h-6" />
                </div>
              </div>

              {/* Model Assumptions Summary Box */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 text-xs text-start space-y-2 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 border-b border-slate-100 pb-2">
                  <Info className="w-4 h-4 text-[#0EA5E9]" />
                  <span><LocalizedValue value={pick(T.calculator.assumptionsCardTitle, language)} /></span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-600 pt-1 font-mono">
                  <div>
                    <span className="text-slate-400 block">{isAr ? <InterfaceText id="hvac.HVACEfficiencyCalculator.kyvo0m0" source="حمل التبريد:" /> : <InterfaceText id="hvac.HVACEfficiencyCalculator.k1ht3uti" source="Cooling Load:" />}</span>
                    <span className="font-semibold text-slate-800"><LocalizedValue value={(estimatedTR || 0).toFixed(1)} /><InterfaceText id="hvac.HVACEfficiencyCalculator.k14guqxv" source="TR (" /><LocalizedValue value={Number(coolingLoadBTUh || 0).toLocaleString()} /><InterfaceText id="hvac.HVACEfficiencyCalculator.kfuip0s" source="BTU/h)" /></span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{isAr ? <InterfaceText id="hvac.HVACEfficiencyCalculator.k7nk0e8" source="كفاءة النظام الحالي:" /> : <InterfaceText id="hvac.HVACEfficiencyCalculator.k1pouvnf" source="Baseline Efficiency:" />}</span>
                    <span className="font-semibold text-slate-800"><LocalizedValue value={baselineSeer} /><InterfaceText id="hvac.HVACEfficiencyCalculator.k17cei5y" source="SEER" /></span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{isAr ? <InterfaceText id="hvac.HVACEfficiencyCalculator.kkiwcw8" source="كفاءة النظام الجديد:" /> : <InterfaceText id="hvac.HVACEfficiencyCalculator.k1umjdy1" source="Target Efficiency:" />}</span>
                    <span className="font-semibold text-[#0EA5E9]"><LocalizedValue value={calcResult.targetSeer} /><InterfaceText id="hvac.HVACEfficiencyCalculator.k1ymo4u6" source="SEER (" /><LocalizedValue value={calcResult.targetLabel} />)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{isAr ? <InterfaceText id="hvac.HVACEfficiencyCalculator.klmoqv2" source="ساعات التشغيل:" /> : <InterfaceText id="hvac.HVACEfficiencyCalculator.k1x6l70n" source="Operating Hours:" />}</span>
                    <span className="font-semibold text-slate-800"><LocalizedValue value={dailyHours} /><InterfaceText id="hvac.HVACEfficiencyCalculator.k10v74bw" source="h/d (" /><LocalizedValue value={Number(annualOperatingHours || 0).toLocaleString()} /><InterfaceText id="hvac.HVACEfficiencyCalculator.k1939k8u" source="h/yr)" /></span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{isAr ? <InterfaceText id="hvac.HVACEfficiencyCalculator.k14kuep3" source="تعرفة الكهرباء:" /> : <InterfaceText id="hvac.HVACEfficiencyCalculator.k1mq9ego" source="SEC Tariff Rate:" />}</span>
                    <span className="font-semibold text-slate-800"><LocalizedValue value={tariffRate} /><InterfaceText id="hvac.HVACEfficiencyCalculator.k16fyuu4" source="SAR/kWh" /></span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">{isAr ? <InterfaceText id="hvac.HVACEfficiencyCalculator.kl3qnhi" source="مدة الحساب:" /> : <InterfaceText id="hvac.HVACEfficiencyCalculator.k1jzhz55" source="Horizon Period:" />}</span>
                    <span className="font-semibold text-slate-800"><LocalizedValue value={horizonYears} /> {isAr ? <InterfaceText id="hvac.HVACEfficiencyCalculator.kl57q12" source="سنة/سنوات" /> : <InterfaceText id="hvac.HVACEfficiencyCalculator.k1rcqbmy" source="Yr(s)" />}</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 pt-1 border-t border-slate-100 leading-normal">
                  <LocalizedValue value={pick(T.calculator.methodologyDesc, language)} />
                </p>
              </div>

              {/* Measured M&V Protocol Notice */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-amber-900 text-[11px] leading-relaxed flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p><LocalizedValue value={pick(T.calculator.measuredSavingsNotice, language)} /></p>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => openBookingModal('Energy Efficiency Audit & Tuning')}
                className="w-full py-3.5 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer group"
              >
                <span><LocalizedValue value={pick(T.calculator.bookUpgradeBtn, language)} /></span>
                <ArrowIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
