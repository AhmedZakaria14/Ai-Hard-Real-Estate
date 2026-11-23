import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, Eye, EyeOff, Building2, Sparkles, KeyRound, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';
import { Language } from '../types';
import { hardAdminClient, toHardAdmin } from '../lib/db/hardAdminClient';

interface CMSAuthProps {
  onCancel: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

export const CMSAuth: React.FC<CMSAuthProps> = ({
  onCancel,
  language,
  onLanguageChange,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Password reset flow states
  const [isResetMode, setIsResetMode] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  const isAr = language === 'ar';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const { data, error } = await hardAdminClient.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      if (!toHardAdmin(data.user)) {
        await hardAdminClient.auth.signOut({ scope: 'local' });
        setError(isAr ? 'الحساب لا يملك صلاحية الإدارة.' : 'This account does not have administrator access.');
      }
    } catch {
      setError(isAr ? 'تعذر تسجيل الدخول. تحقق من البريد وكلمة المرور.' : 'Sign-in failed. Check your email and password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError(null);
    setResetSuccess(null);
    setIsResetting(true);

    try {
      if (!resetEmail || !resetEmail.includes('@')) {
        throw new Error(isAr ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email address');
      }

      const { error } = await hardAdminClient.auth.resetPasswordForEmail(resetEmail.trim(), {
        redirectTo: window.location.origin + '/admin/password-reset',
      });
      if (error) throw error;
      setResetSuccess(
        isAr
          ? `تم إرسال رابط إعادة تعيين كلمة المرور بنجاح إلى ${resetEmail}. يرجى فحص صندوق الوارد.`
          : `Password reset instructions sent successfully to ${resetEmail}. Please check your inbox.`
      );
    } catch (err: any) {
      setResetError(
        err.message ||
          (isAr
            ? 'تعذر إرسال رابط إعادة التعيين. يرجى التأكد من البريد والمحاولة لاحقاً.'
            : 'Failed to send password reset email. Please verify your address.')
      );
    } finally {
      setIsResetting(false);
    }
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

      {/* Main Login or Password Reset Card */}
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10 space-y-6">
        {/* Header Branding */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 bg-gradient-to-tr from-blue-700 to-sky-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-blue-900/40 border border-blue-400/30">
            {isResetMode ? <KeyRound className="w-7 h-7 text-white" /> : <ShieldCheck className="w-7 h-7 text-white" />}
          </div>
          <div className="pt-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[11px] font-bold tracking-wider uppercase border border-blue-500/20 mb-2">
              <Sparkles className="w-3 h-3" />
              <span>{isAr ? 'بوابة إدارة المجموعة' : 'HARD Enterprise CMS'}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white font-display-serif">
              {isResetMode
                ? isAr ? 'استعادة كلمة المرور' : 'Reset Admin Password'
                : isAr ? 'دخول المسؤولين والمدراء' : 'Administrator Sign-In'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {isResetMode
                ? isAr
                  ? 'أدخل بريدك الإلكتروني المعتمد لإرسال تعليمات إعادة التعيين'
                  : 'Enter your registered email to receive reset instructions'
                : isAr
                  ? 'سجل دخولك المصرح للوصول إلى لوحة تحكم هارد'
                  : 'Sign in to manage portal content, real estate, and leads'}
            </p>
          </div>
        </div>

        {/* Normal Login Form */}
        {!isResetMode ? (
          <>
            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="cms-admin-email" className="block text-xs font-bold text-slate-200 mb-1.5 text-start">
                  {isAr ? 'البريد الإلكتروني المعتمد' : 'Authorized Admin Email'} *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5 pointer-events-none" />
                  <input
                    id="cms-admin-email"
                    type="email"
                    required
                    aria-required="true"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full ps-10 pe-4 py-2.5 bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-start"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="cms-admin-password" className="block text-xs font-bold text-slate-200 text-start">
                    {isAr ? 'كلمة المرور' : 'Password'} *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setIsResetMode(true);
                      setError(null);
                    }}
                    className="text-[11px] font-semibold text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                  >
                    {isAr ? 'نسيت كلمة المرور؟' : 'Forgot Password?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5 pointer-events-none" />
                  <input
                    id="cms-admin-password"
                    autoComplete="current-password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    aria-required="true"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full min-h-11 ps-10 pe-12 py-2.5 bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-start"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? (isAr ? 'إخفاء كلمة المرور' : 'Hide password') : (isAr ? 'إظهار كلمة المرور' : 'Show password')}
                    aria-controls="cms-admin-password"
                    className="absolute inset-y-0 end-0 flex w-11 items-center justify-center rounded-xl text-slate-300 transition-colors hover:bg-slate-700 hover:text-white focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-400 cursor-pointer"
                  >
                    {showPassword ? <EyeOff aria-hidden="true" className="size-5" /> : <Eye aria-hidden="true" className="size-5" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500 hover:brightness-110 active:scale-[0.99] text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-900/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>{isAr ? 'جاري التحقق من الحساب...' : 'Authenticating...'}</span>
                  </span>
                ) : (
                  <>
                    <span>{isAr ? 'تسجيل الدخول الآمن' : 'Secure Admin Sign-In'}</span>
                    <ArrowRight className={`w-4 h-4 ${isAr ? 'rotate-180' : ''}`} />
                  </>
                )}
              </button>
            </form>
          </>
        ) : (
          /* Password Reset Form */
          <div className="space-y-4">
            {resetSuccess && (
              <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{resetSuccess}</span>
              </div>
            )}

            {resetError && (
              <div className="p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{resetError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label htmlFor="reset-email" className="block text-xs font-bold text-slate-200 mb-1.5 text-start">
                  {isAr ? 'البريد الإلكتروني لإعادة التعيين' : 'Admin Email Address'} *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute top-3.5 start-3.5 pointer-events-none" />
                  <input
                    id="reset-email"
                    type="email"
                    required
                    aria-required="true"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full ps-10 pe-4 py-2.5 bg-slate-800/90 border border-slate-700 hover:border-slate-600 rounded-xl text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-start"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isResetting}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 active:scale-[0.99] text-white font-bold rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isResetting ? (
                  <span className="inline-flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>{isAr ? 'جاري إرسال الطلب...' : 'Sending Link...'}</span>
                  </span>
                ) : (
                  <span>{isAr ? 'إرسال رابط استعادة كلمة المرور' : 'Send Reset Link'}</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  setResetError(null);
                  setResetSuccess(null);
                }}
                className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
              >
                {isAr ? '← العودة لتسجيل الدخول' : '← Back to Sign-In'}
              </button>
            </form>
          </div>
        )}

        {/* Security Notice */}
        <div className="text-center pt-3 text-[11px] text-slate-500 border-t border-slate-800/80 space-y-1">
          <p>{isAr ? '🔒 منطقة محمية بمصادقة مشفرة' : '🔒 Environment protected by secure sign-in'}</p>
          <p className="text-[10px] text-slate-600">{isAr ? 'مقتصرة على المسؤوليين المعتمدين - يمنع تسجيل الزوار' : 'Restricted to pre-authorized administrative identities'}</p>
        </div>
      </div>
    </div>
  );
};
