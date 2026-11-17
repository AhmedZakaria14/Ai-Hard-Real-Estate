import { next } from '@vercel/functions';
import { hardPublishableKey, hardSupabaseUrl } from './src/lib/db/hardCatalog';

const internalPath = /^\/[a-z0-9][a-z0-9/-]*$/;
const protectedPath = /^\/(?:admin|login|api|static|assets|cms|realestate\/(?:admin|cms)|construction\/(?:admin|cms)|hvac\/(?:admin|cms))(?:\/|$)/;

function eligible(path: string) {
  return path.length <= 500 && internalPath.test(path) && !path.includes('//') && !protectedPath.test(path);
}

export const config = {
  matcher: ['/((?!_next/|_vercel/|assets/|static/|api/|.*\\.).*)'],
};

export default async function middleware(request: Request) {
  if (request.method !== 'GET' && request.method !== 'HEAD') return next();
  const url = new URL(request.url);
  const path = url.pathname.toLowerCase().replace(/\/+$/, '');
  if (!eligible(path)) return next();

  try {
    const response = await fetch(hardSupabaseUrl + '/rest/v1/rpc/hard_resolve_redirect', {
      method: 'POST',
      headers: { apikey: hardPublishableKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ p_path: path }),
      signal: AbortSignal.timeout(700),
    });
    if (!response.ok) return next();
    const [rule] = await response.json() as { target_path: string; status_code: number }[];
    if (!rule || (rule.status_code !== 301 && rule.status_code !== 302)
      || !eligible(rule.target_path) || rule.target_path === path) return next();

    return new Response(null, {
      status: rule.status_code,
      headers: { Location: rule.target_path + url.search, 'Cache-Control': 'no-store' },
    });
  } catch {
    return next();
  }
}
