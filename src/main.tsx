import {lazy, StrictMode, Suspense} from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import { ErrorBoundary } from './components/ui/ErrorBoundary.tsx';

const legacyAdminPaths = new Set(['/cms', '/realestate/admin', '/realestate/cms', '/construction/cms', '/hvac/cms', '/admin/cms']);
const legacyAdminHashes = new Set(['admin', 'cms', 'realestate/admin', 'realestate/cms', 'construction/cms', 'hvac/cms']);
const currentPath = window.location.pathname.replace(/\/+$/, '') || '/';
const currentHash = window.location.hash.replace(/^#\/?/, '');
if (legacyAdminPaths.has(currentPath) || legacyAdminHashes.has(currentHash)) {
  window.location.replace('/admin' + window.location.search);
}

const Page = /^\/admin\/password-reset\/?$/.test(window.location.pathname)
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
