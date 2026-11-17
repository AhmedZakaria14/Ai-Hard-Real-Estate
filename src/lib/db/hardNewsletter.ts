import { hardAdminClient } from './hardAdminClient';
import type { JoinListSubscriber } from '../../types';

const fields = 'id,received_at,status,payload,newsletter_notes';
type NewsletterRow = {
  id: string;
  received_at: string;
  status: string;
  payload: { email: string; details?: { source?: string } };
  newsletter_notes: string | null;
};

function subscriber(row: NewsletterRow): JoinListSubscriber {
  return {
    id: row.id, email: row.payload.email, createdAt: row.received_at,
    status: row.status === 'closed' ? 'unsubscribed' : 'active',
    source: row.payload.details?.source || 'Website Footer',
    notes: row.newsletter_notes ?? '',
  };
}

function currentSubscribers() {
  return hardAdminClient.from('hard_form_submissions').select(fields)
    .eq('form_type', 'newsletter_signup').is('archived_at', null);
}

export async function readSubscribers() {
  const results: JoinListSubscriber[] = [];
  const size = 200;
  for (let offset = 0; ; offset += size) {
    const { data, error } = await currentSubscribers()
      .order('received_at', { ascending: false }).order('id').range(offset, offset + size - 1);
    if (error) throw error;
    results.push(...data.map(subscriber));
    if (data.length < size) return results;
  }
}

export async function changeSubscriber(id: string, updates: Partial<JoinListSubscriber>) {
  const patch: { status?: string; newsletter_notes?: string } = {};
  if (updates.status !== undefined) patch.status = updates.status === 'active' ? 'new' : 'closed';
  if (updates.notes !== undefined) patch.newsletter_notes = updates.notes;
  const { data, error } = await hardAdminClient.from('hard_form_submissions').update(patch)
    .eq('id', id).eq('form_type', 'newsletter_signup').is('archived_at', null)
    .select(fields).single();
  if (error) throw error;
  return subscriber(data);
}

export async function archiveSubscriber(id: string) {
  const { error } = await hardAdminClient.from('hard_form_submissions')
    .update({ archived_at: new Date().toISOString() }).eq('id', id)
    .eq('form_type', 'newsletter_signup').is('archived_at', null).select('id').single();
  if (error) throw error;
  return true;
}

export async function findSubscriber(email: string) {
  const { data, error } = await currentSubscribers().eq('payload->>email', email).single();
  if (error) throw error;
  return subscriber(data);
}
