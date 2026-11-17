import { createClient } from 'npm:@supabase/supabase-js@2.112.4';

const site = 'https://ai-hard-real-estate.vercel.app';
const headers = {
  'Access-Control-Allow-Origin': site,
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Cache-Control': 'no-store',
};
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers });
const url = Deno.env.get('SUPABASE_URL')!;
const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const mailClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const idPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (request.method !== 'POST') return reply({ error: 'method' }, 405);
  const token = request.headers.get('Authorization')?.match(/^Bearer (\S+)$/i)?.[1];
  if (!token) return reply({ error: 'authorization_required' }, 401);

  try {
    const { data, error } = await admin.auth.getUser(token);
    if (error || !data.user) return reply({ error: 'invalid_session' }, 401);
    if (data.user.app_metadata.hard_role !== 'superadmin') return reply({ error: 'forbidden' }, 403);
    const input = await request.json().catch(() => null);
    if (!input || typeof input !== 'object') return reply({ error: 'invalid_request' }, 400);

    if (input.action === 'list') {
      const users = [];
      const perPage = 200;
      for (let page = 1; ; page++) {
        const result = await admin.auth.admin.listUsers({ page, perPage });
        if (result.error) return reply({ error: 'list_failed' }, 502);
        for (const user of result.data.users) {
          if (user.app_metadata.hard_role === 'superadmin') {
            users.push({ id: user.id, email: user.email, name: user.user_metadata?.name ?? '', confirmed: Boolean(user.email_confirmed_at) });
          }
        }
        if (!result.data.nextPage || result.data.users.length < perPage) break;
      }
      return reply({ users });
    }

    const name = typeof input.name === 'string' ? input.name.trim() : '';
    if (input.action === 'invite') {
      const email = typeof input.email === 'string' ? input.email.trim().toLowerCase() : '';
      if (email.length > 254 || !emailPattern.test(email) || !name || name.length > 100) {
        return reply({ error: 'invalid_fields' }, 400);
      }
      const invited = await admin.auth.admin.inviteUserByEmail(email, {
        data: { name },
        redirectTo: site + '/admin/password-reset?flow=invite',
      });
      if (invited.error || !invited.data.user) return reply({ error: 'invite_failed' }, 502);
      const role = await admin.auth.admin.updateUserById(invited.data.user.id, {
        app_metadata: { hard_role: 'superadmin' },
      });
      if (role.error) return reply({ error: 'role_assignment_failed' }, 502);
      return reply({ ok: true });
    }

    if (!['rename', 'reset'].includes(input.action) || typeof input.id !== 'string' || !idPattern.test(input.id)) {
      return reply({ error: 'invalid_request' }, 400);
    }
    const target = await admin.auth.admin.getUserById(input.id);
    const user = target.data?.user;
    if (target.error || user?.app_metadata.hard_role !== 'superadmin' || !user.email) {
      return reply({ error: 'admin_not_found' }, 404);
    }
    if (input.action === 'rename') {
      if (!name || name.length > 100) return reply({ error: 'invalid_fields' }, 400);
      const { error } = await admin.auth.admin.updateUserById(user.id, { user_metadata: { name } });
      return error ? reply({ error: 'update_failed' }, 502) : reply({ ok: true });
    }
    const reset = await mailClient.auth.resetPasswordForEmail(user.email, { redirectTo: site + '/admin/password-reset' });
    return reset.error ? reply({ error: 'reset_failed' }, 502) : reply({ ok: true });
  } catch {
    return reply({ error: 'operation_failed' }, 500);
  }
});
