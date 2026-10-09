import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff, Building2, Sparkles } from 'lucide-react';
import { Language } from '../types';

interface CMSAuthProps {
  onLoginSuccess: (user: { name: string; email: string; role: string }) => void;
  onCancel: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const CMSAuth: React.FC<CMSAuthProps> = ({
  onLoginSuccess,
  onCancel,
  language,
  onLanguageChange,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isAr = language === 'ar';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      // Standard credentials check (accepts admin@hard.sa or any valid format for easy testing)
      const validEmails = ['admin@hard.sa', 'admin@hard-re.com', 'admin@hard.com', 'admin'];
      const isEmailValid = validEmails.includes(email.trim().toLowerCase()) || email.includes('@');
      
      if (isEmailValid && (password.trim() === 'admin' || password.trim() === 'Hard2026!' || password.length >= 4)) {
        onLoginSuccess({
          name: isAr ? 'مدير النظام' : 'Executive Admin',
          email: email.trim().toLowerCase() || 'admin@hard.sa',
          role: isAr ? 'مسؤول النظام الرئيسي' : 'Super Administrator',
        });
      } else {
        setError(
          isAr
            ? 'بيانات الدخول غير صحيحة. يرجى التأكد من البريد الإلكتروني وكلمة المرور.'
            : 'Invalid credentials. Please verify your email and password.'
        );
      }
      setIsLoading(false);
    }, 450);
  };

  const handleFillDemo = () => {
    setEmail('admin@hard.sa');
    setPassword('admin');
    setError(null);
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-ui-sans selection:bg-blue-600 selection:text-white"
    >
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -start-48 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -end-48 w-96 h-96 bg-sky-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Language Toggle & Back to Site */}
      <div className="absolute top-6 start-6 end-6 flex items-center justify-between z-10 max-w-5xl mx-auto w-full">
        <button
          onClick={onCancel}
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors cursor-pointer px-3 py-1.5 rounded-lg hover:bg-white/5"
        >
          <Building2 className="w-4 h-4 text-blue-400" />
          <span>{isAr ? '← العودة للموقع الرئيسي' : '← Return to Main Site'}</span>
        </button>

        <button
          onClick={() => onLanguageChange(isAr ? 'en' : 'ar')}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-slate-200 transition-colors cursor-pointer"
        >
          {isAr ? 'English' : 'العربية'}
        </button>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-700 to-sky-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-900/40 border border-blue-400/30">
            <ShieldCheck className="w-7 h-7 text-white" />
          </div>
          <div className="pt-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[11px] font-bold tracking-wider uppercase border border-blue-500/20 mb-2">
              <Sparkles className="w-3 h-3" />
              <span>{isAr ? 'لوحة إدارة المحتوى' : 'Content Management System'}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white font-display-serif">
              {isAr ? 'بوابة إدارة هارد العقارية' : 'HARD Real Estate CMS'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {isAr
                ? 'سجل دخولك للوصول إلى إدارة العقارات والطلبات والبيانات'
                : 'Sign in to access property management, leads, and analytics'}
            </p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium animate-in fade-in">
            {error}
          </div>
        )}

        {/* Credentials Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 text-start">
              {isAr ? 'البريد الإلكتروني للإدارة' : 'Admin Email Address'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5 pointer-events-none" />
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isAr ? 'admin@hard.sa' : 'admin@hard.sa'}
                className="w-full ps-10 pe-4 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-start"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-300 text-start">
                {isAr ? 'كلمة المرور' : 'Password'}
              </label>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full ps-10 pe-11 py-2.5 bg-slate-800/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-start"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-3 end-3 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Quick Demo Credentials Autofill Helper */}
          <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-800/30 flex items-center justify-between text-xs">
            <div className="space-y-0.5 text-start">
              <span className="text-slate-400 block text-[11px]">{isAr ? 'بيانات التجربة السريعة:' : 'Demo Access:'}</span>
              <span className="font-mono text-blue-300 text-[11px]">admin@hard.sa / admin</span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-xs font-semibold text-blue-400 hover:text-blue-300 underline underline-offset-2 cursor-pointer"
            >
              {isAr ? 'تعبئة تلقائية' : 'Auto Fill'}
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 hover:brightness-110 active:scale-[0.99] text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-flex items-center gap-2">
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                <span>{isAr ? 'جاري التحقق...' : 'Authenticating...'}</span>
              </span>
            ) : (
              <>
                <span>{isAr ? 'دخول إلى لوحة التحكم' : 'Access CMS Portal'}</span>
                <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>
        </form>

        {/* Footer Note */}
        <div className="text-center pt-2 text-[11px] text-slate-500 border-t border-slate-800/80">
          {isAr
            ? 'نظام الإدارة الآمن - شركة هارد العقارية © 2026'
            : 'Secure Enterprise Management System - HARD Real Estate © 2026'}
        </div>
      </div>
    </div>
  );
};
