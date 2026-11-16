import {lazy, StrictMode, Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import { ErrorBoundary } from './components/ui/ErrorBoundary.tsx';

const Page = /^\/admin\/supabase-inbox\/?$/.test(window.location.pathname)
  ? lazy(() => import('./cms/leads/SupabaseInbox'))
  : /^\/admin\/password-reset\/?$/.test(window.location.pathname)
    ? lazy(() => import('./cms/CMSPasswordReset'))
    : lazy(() => import('./App'));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<p role="status">جارٍ التحميل…</p>}>
        <Page />
      </Suspense>
    </ErrorBoundary>
  </StrictMode>,
);
