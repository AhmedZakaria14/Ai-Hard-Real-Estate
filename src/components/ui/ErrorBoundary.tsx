import { InterfaceText } from './InterfaceText';
import * as React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export interface ErrorBoundaryProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }

  public override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught React ErrorBoundary Exception:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  private handleResetState = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isAr = document.documentElement.lang === 'ar' || document.documentElement.dir === 'rtl';

      return (
        <div
          dir={isAr ? 'rtl' : 'ltr'}
          className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4 font-ui-sans"
        >
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 end-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center gap-4 border-b border-slate-800 pb-5">
              <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center shrink-0 shadow-lg">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-display-serif">
                  {isAr ? <InterfaceText id="realestate.ErrorBoundary.koe7sq7" source="تعذر تحميل هذه الصفحة مؤقتاً" /> : <InterfaceText id="realestate.ErrorBoundary.k1j5y128" source="Page temporarily unavailable" />}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {isAr
                    ? <InterfaceText id="realestate.ErrorBoundary.k10w6nhu" source="يرجى إعادة تحميل الصفحة للمحاولة مرة أخرى." />
                    : <InterfaceText id="realestate.ErrorBoundary.kj9j3rg" source="Please reload this page to try again." />}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={this.handleResetState}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{isAr ? <InterfaceText id="realestate.ErrorBoundary.k1u8dij2" source="إعادة تحميل التطبيق" /> : <InterfaceText id="realestate.ErrorBoundary.k1i1ube2" source="Reload Application" />}</span>
              </button>

              <a
                href="/"
                className="w-full py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-700"
              >
                <Home className="w-4 h-4 text-blue-400" />
                <span>{isAr ? <InterfaceText id="realestate.ErrorBoundary.k9hw6hk" source="العودة للرئيسية" /> : <InterfaceText id="realestate.ErrorBoundary.k1bede5e" source="Return to Portal" />}</span>
              </a>



            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
