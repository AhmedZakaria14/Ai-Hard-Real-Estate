import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
const hardSupabaseUrl = 'https://vlpdiyicmupghfcualoe.supabase.co';
const hardPublishableKey = 'sb_publishable_jam6dG2vyvPi65DHUEgqXQ_4YZfJGxF';

const internalPath = /^\/[a-z0-9][a-z0-9/-]*$/;
const protectedPath = /^\/(?:admin|login|api|static|assets|cms|realestate\/(?:admin|cms)|construction\/(?:admin|cms)|hvac\/(?:admin|cms))(?:\/|$)/;
const routeParameter = '__hard_path';

function eligible(path) {
  return path.length <= 500 && internalPath.test(path) && !path.includes('//') && !protectedPath.test(path);
}

export default async function handler(request, response) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.setHeader('Allow', 'GET, HEAD');
    response.statusCode = 405;
    response.end();
    return;
  }
  const url = new URL(request.url ?? '/', 'https://hard.invalid');
  const path = '/' + (url.searchParams.get(routeParameter) ?? '').toLowerCase().replace(/\/+$/, '');
  url.searchParams.delete(routeParameter);
  if (eligible(path)) {
    try {
      const result = await fetch(hardSupabaseUrl + '/rest/v1/rpc/hard_resolve_redirect', {
        method: 'POST',
        headers: { apikey: hardPublishableKey, 'Content-Type': 'application/json' },
        body: JSON.stringify({ p_path: path }),
        signal: AbortSignal.timeout(1200),
      });
      if (result.ok) {
        const [rule] = await result.json();
        if (rule && (rule.status_code === 301 || rule.status_code === 302)
          && eligible(rule.target_path) && rule.target_path !== path) {
          response.statusCode = rule.status_code;
          response.setHeader('Location', rule.target_path + url.search);
          response.setHeader('Cache-Control', 'no-store');
          response.end();
          return;
        }
      }
    } catch {
      // Keep unmatched pages available when Supabase is temporarily unavailable.
    }
  }
  const html = await readFile(join(process.cwd(), 'dist', 'index.html'));
  response.setHeader('Content-Type', 'text/html; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(request.method === 'HEAD' ? undefined : html);
}
