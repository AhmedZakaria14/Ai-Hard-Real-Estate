import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { hardAdminClient } from '../../lib/db/hardAdminClient';
import type { Language } from '../../types';

type Admin = { id: string; email: string; name: string; confirmed: boolean };

export function CMSAdminManagement({ language }: { language: Language }) {
  const ar = language === 'ar';
  const [users, setUsers] = useState<Admin[]>([]);
  const [editing, setEditing] = useState<Admin | null>(null);
  const [busy, setBusy] = useState(true);
  const [notice, setNotice] = useState('');

  const load = useCallback(async () => {
    const { data, error } = await hardAdminClient.functions.invoke<{ users: Admin[] }>('hard-admin-users', {
      body: { action: 'list' },
    });
    if (error || !data) throw error ?? Error('Missing response');
    setUsers(data.users);
  }, []);

  useEffect(() => {
    void load().catch(() => setNotice(ar ? 'تعذر تحميل المستخدمين.' : 'Could not load administrators.')).finally(() => setBusy(false));
  }, [load, ar]);

  async function change(body: object, success: string) {
    if (busy) return;
    setBusy(true);
    setNotice('');
    try {
      const { data, error } = await hardAdminClient.functions.invoke<{ ok: boolean }>('hard-admin-users', { body });
      if (error || !data?.ok) throw error ?? Error('Operation failed');
      setEditing(null);
      setNotice(success);
      await load();
    } catch {
      setNotice(ar ? 'تعذر إكمال العملية. حدّث القائمة قبل المحاولة مرة أخرى.' : 'The operation could not be confirmed. Refresh the list before retrying.');
    } finally {
      setBusy(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = new FormData(form);
    const name = String(fields.get('name') ?? '');
    if (editing) await change({ action: 'rename', id: editing.id, name }, ar ? 'حُفظ الاسم.' : 'Name saved.');
    else {
      const email = String(fields.get('email') ?? '');
      if (!window.confirm(ar ? 'إرسال دعوة بصلاحيات مدير كامل إلى ' + email + '؟' : 'Invite ' + email + ' as a full administrator?')) return;
      await change({ action: 'invite', name, email }, ar ? 'أُرسلت الدعوة.' : 'Invitation sent.');
    }
  }

  return <section className="space-y-4 rounded-xl border bg-white p-5">
    <h2 className="text-lg font-bold">{ar ? 'حسابات إدارة هارد' : 'HARD administrator accounts'}</h2>
    {notice && <p role="status">{notice}</p>}
    <ul className="space-y-3">
      {users.map((user) => <li key={user.id} className="flex flex-wrap items-center gap-3 border-b pb-3">
        <span>{user.name || user.email}</span>
        <span dir="ltr">{user.email}</span>
        {!user.confirmed && <span>{ar ? 'بانتظار قبول الدعوة' : 'Invitation pending'}</span>}
        <button className="rounded border px-2 py-1" type="button" disabled={busy} onClick={() => setEditing(user)}>{ar ? 'تعديل الاسم' : 'Edit name'}</button>
        <button className="rounded border px-2 py-1" type="button" disabled={busy || !user.confirmed} onClick={() => {
          if (window.confirm(ar ? 'إرسال رابط استعادة كلمة المرور إلى ' + user.email + '؟' : 'Send a recovery link to ' + user.email + '?')) {
            void change({ action: 'reset', id: user.id }, ar ? 'أُرسل رابط الاستعادة.' : 'Recovery link sent.');
          }
        }}>{ar ? 'استعادة كلمة المرور' : 'Send password recovery'}</button>
      </li>)}
    </ul>
    <form key={editing?.id ?? 'new'} onSubmit={save} className="grid gap-3 sm:max-w-md">
      <label>{ar ? 'الاسم' : 'Name'}<input className="block w-full rounded border p-2" name="name" defaultValue={editing?.name} maxLength={100} required /></label>
      {!editing && <label>{ar ? 'البريد الإلكتروني' : 'Email'}<input className="block w-full rounded border p-2" name="email" type="email" dir="ltr" required /></label>}
      <button disabled={busy} className="rounded bg-blue-800 p-2 text-white">{editing ? (ar ? 'حفظ الاسم' : 'Save name') : (ar ? 'دعوة مدير كامل' : 'Invite administrator')}</button>
      {editing && <button type="button" onClick={() => setEditing(null)}>{ar ? 'إلغاء' : 'Cancel'}</button>}
    </form>
  </section>;
}
