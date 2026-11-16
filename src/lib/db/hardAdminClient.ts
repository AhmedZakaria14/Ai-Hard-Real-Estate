import { createClient, type User } from '@supabase/supabase-js';
import { hardPublishableKey, hardSupabaseUrl } from './hardCatalog';

export const hardAdminClient = createClient(hardSupabaseUrl, hardPublishableKey, {
  auth: { storageKey: 'hard-admin-supabase-session' },
});

export function toHardAdmin(user: User | null) {
  if (!user?.email || user.app_metadata.hard_role !== 'superadmin') return null;
  const displayName = user.user_metadata?.name;
  return {
    name: typeof displayName === 'string' && displayName.trim() ? displayName : user.email,
    email: user.email,
    role: 'superadmin',
  };
}
