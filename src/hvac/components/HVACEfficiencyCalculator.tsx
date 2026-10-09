import React, { useState } from 'react';
import {
  Calculator,
  TrendingDown,
  Zap,
  Leaf,
  Coins,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { useHVAC } from '../context/HVACContext';
import { T, pick } from '../translations';
import { EfficiencyTier } from '../types';

export function HVACEfficiencyCalculator() {
  const { language, isAr, openBookingModal } = useHVAC();
  const [areaSqM, setAreaSqM] = useState<number>(100);
  const [tier, setTier] = useState<EfficiencyTier>('inverter_high');

  const ArrowIcon = isAr ? ArrowLeft : ArrowRight;

  // Calculation parameters calibrated to Saudi climate & SEC tariff
  const tierConfig: Record<
    EfficiencyTier,
    { label: string; savingsPercent: number; multiplier: number; rebatePerSqm: number; co2PerSqm: number }
  > = {
    split_standard: {
      label: pick(T.calculator.tierSplitStandard, language),
      savingsPercent: 18,
      multiplier: 12.5,
      rebatePerSqm: 8,
      co2PerSqm: 0.012,
    },
    inverter_high: {
      label: pick(T.calculator.tierInverterHigh, language),
      savingsPercent: 35,
      multiplier: 24.8,
      rebatePerSqm: 18,
      co2PerSqm: 0.024,
    },
    package_unit: {
      label: pick(T.calculator.tierPackage, language),
      savingsPercent: 28,
      multiplier: 21.0,
      rebatePerSqm: 15,
      co2PerSqm: 0.019,
    },
    vrf_central: {
      label: pick(T.calculator.tierVRF, language),
      savingsPercent: 44,
      multiplier: 32.4,
      rebatePerSqm: 25,
      co2PerSqm: 0.031,
    },
  };

  const selectedTierConfig = tierConfig[tier];

  // Calculated values
  const annualSavingsSAR = Math.round(areaSqM * selectedTierConfig.multiplier);
  const estimatedRebateSAR = Math.round(areaSqM * selectedTierConfig.rebatePerSqm);
  const co2ReductionTons = (areaSqM * selectedTierConfig.co2PerSqm).toFixed(1);

  return (
    <section id="calculator" className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3 mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0EA5E9]/10 text-[#0EA5E9] text-xs font-semibold">
            <Calculator className="w-3.5 h-3.5" />
            <span>{pick(T.calculator.eyebrow, language)}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-slate-900 tracking-tight">
            {pick(T.calculator.title, language)}
          </h2>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {pick(T.calculator.subtitle, language)}
          </p>
        </div>

        {/* Interactive Calculator Box */}
        <div className="bg-[#F8FAFC] border border-slate-200/80 rounded-2xl p-6 sm:p-10 shadow-xs max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-center">
            {/* Input Controls (6 cols) */}
            <div className="lg:col-span-6 space-y-7 text-start">
              {/* 1. Area Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs sm:text-sm font-semibold text-slate-800">
                    {pick(T.calculator.areaSliderLabel, language)}
                  </label>
                  <span className="px-3 py-1 rounded-lg bg-white border border-slate-200 text-sm font-bold text-[#0EA5E9] font-mono shadow-xs">
                    {areaSqM} m²
                  </span>
                </div>

                {/* Range Slider styled for RTL and LTR */}
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
                  <span>30 m² (Studio)</span>
                  <span>250 m² (Villa)</span>
                  <span>800 m² (Commercial)</span>
                </div>
              </div>

              {/* 2. System Tier Selector */}
              <div className="space-y-3">
                <label className="text-xs sm:text-sm font-semibold text-slate-800">
                  {pick(T.calculator.tierLabel, language)}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                      onClick={() => setTier(t)}
                      className={`p-3 rounded-xl text-xs font-semibold text-start border transition-all cursor-pointer ${
                        tier === t
                          ? 'bg-[#0EA5E9] text-white border-[#0EA5E9] shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{tierConfig[t].label}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded ${
                            tier === t
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-100 text-[#0EA5E9]'
                          }`}
                        >
                          +{tierConfig[t].savingsPercent}%
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {pick(T.calculator.disclaimer, language)}
              </p>
            </div>

            {/* Output Metric Cards (6 cols) */}
            <div className="lg:col-span-6 space-y-4">
              {/* Metric 1: Annual Electricity Savings */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-start flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>{pick(T.calculator.annualSavingsTitle, language)}</span>
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-slate-900 font-mono">
                    <bdi dir="ltr">{annualSavingsSAR.toLocaleString()}</bdi>
                    <span className="text-xs text-slate-500 font-normal ms-1">
                      {isAr ? 'ريال / سنوياً' : 'SAR / year'}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <TrendingDown className="w-6 h-6" />
                </div>
              </div>

              {/* Metric 2: Estimated Incentive / Rebate */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-start flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <Coins className="w-3.5 h-3.5 text-[#0EA5E9]" />
                    <span>{pick(T.calculator.incentiveEstimateTitle, language)}</span>
                  </span>
                  <div className="text-2xl sm:text-3xl font-bold text-[#0EA5E9] font-mono">
                    <bdi dir="ltr">{estimatedRebateSAR.toLocaleString()}</bdi>
                    <span className="text-xs text-slate-500 font-normal ms-1">
                      {isAr ? 'ريال قيمة تقديرية' : 'SAR est. value'}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-sky-50 text-[#0EA5E9] flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
              </div>

              {/* Metric 3: Carbon Offset */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs text-start flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                    <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{pick(T.calculator.carbonOffsetTitle, language)}</span>
                  </span>
                  <div className="text-xl sm:text-2xl font-bold text-emerald-700 font-mono">
                    <bdi dir="ltr">{co2ReductionTons}</bdi>
                    <span className="text-xs text-slate-500 font-normal ms-1">
                      {isAr ? 'طن انبعاثات سنوية' : 'Tons CO₂ / year'}
                    </span>
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Leaf className="w-6 h-6" />
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={() => openBookingModal('Energy Efficiency Audit & Tuning')}
                className="w-full py-3.5 rounded-xl bg-[#0EA5E9] hover:bg-[#0284C7] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer group"
              >
                <span>{pick(T.calculator.bookUpgradeBtn, language)}</span>
                <ArrowIcon className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
