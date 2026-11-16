import { hardAdminClient, toHardAdmin } from './db/hardAdminClient';

export interface AdminUser {
  name: string;
  email: string;
  role: string;
}

let verifiedAdmin: AdminUser | null = null;
let generation = 0;
let resolved = false;

export function hasResolvedAdmin() { return resolved; }

export function getAdminUser(): AdminUser | null {
  return verifiedAdmin;
}

export function isAuthorizedAdmin(): boolean {
  return verifiedAdmin?.role === 'superadmin';
}

export function notifyAdminAuthChange(): void {
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('cms-auth-change'));
}

hardAdminClient.auth.onAuthStateChange((event, session) => {
  const current = ++generation;
  if (!session || event === 'PASSWORD_RECOVERY') {
    verifiedAdmin = null;
    resolved = true;
    notifyAdminAuthChange();
    return;
  }
  void hardAdminClient.auth.getUser(session.access_token).then(({ data, error }) => {
    if (current !== generation) return;
    verifiedAdmin = error ? null : toHardAdmin(data.user);
    resolved = true;
    notifyAdminAuthChange();
  }).catch(() => {
    if (current !== generation) return;
    verifiedAdmin = null;
    resolved = true;
    notifyAdminAuthChange();
  });
});
