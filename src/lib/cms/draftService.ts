/**
 * HARD GROUP - CMS DRAFT PERSISTENCE & CONCURRENCY SERVICE
 * 
 * Provides debounced draft storage in Supabase (`cms_drafts` collection).
 * Prevents silent overwrites via numeric revision concurrency control.
 * Stores local emergency backup buffers when offline.
 * Ensures autosaving NEVER publishes draft edits to live public visitors.
 */

import { hardAdminClient } from '../db/hardAdminClient';
import { CMSDraftRecord, RevisionConflictError } from './draftTypes';

const LOCAL_DRAFT_PREFIX = 'hard_cms_offline_draft_v1';

function getLocalBufferKey(entityType: string, entityId: string): string {
  return `${LOCAL_DRAFT_PREFIX}_${entityType}_${entityId}`;
}

export function saveLocalDraftBuffer<T>(entityType: string, entityId: string, record: CMSDraftRecord<T>): void {
  try {
    const key = getLocalBufferKey(entityType, entityId);
    localStorage.setItem(key, JSON.stringify(record));
  } catch (err) {
    console.warn('[DraftService] Failed to save local offline draft buffer:', err);
  }
}

export function getLocalDraftBuffer<T>(entityType: string, entityId: string): CMSDraftRecord<T> | null {
  try {
    const key = getLocalBufferKey(entityType, entityId);
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as CMSDraftRecord<T>;
  } catch {
    return null;
  }
}

export function clearLocalDraftBuffer(entityType: string, entityId: string): void {
  try {
    const key = getLocalBufferKey(entityType, entityId);
    localStorage.removeItem(key);
  } catch (err) {
    console.warn('[DraftService] Failed to clear local offline draft buffer:', err);
  }
}

/**
 * Loads current draft from Supabase, with local offline buffer fallback.
 */
export async function getCMSDraft<T = any>(
  entityType: string,
  entityId: string
): Promise<{ record: CMSDraftRecord<T> | null; isFromOfflineBuffer: boolean }> {
  const docId = `${entityType}_${entityId}`;

  try {
    const { data, error } = await hardAdminClient.from('hard_cms_workspaces')
      .select('draft,revision,updated_at').eq('entity_type',entityType).eq('entity_id',entityId).maybeSingle();
    if (error) throw error;
    if (data?.draft) {
      const serverRecord: CMSDraftRecord<T> = {
        id: docId, entityType, entityId, sector: 'portal', updatedByEmail: '',
        ...data.draft, revision: data.revision, updatedAt: data.updated_at,
      };
      const localBuffer = getLocalDraftBuffer<T>(entityType, entityId);

      // If local offline buffer has a higher revision or newer timestamp, inform caller
      if (localBuffer && localBuffer.revision > serverRecord.revision) {
        return { record: localBuffer, isFromOfflineBuffer: true };
      }

      return { record: serverRecord, isFromOfflineBuffer: false };
    }
  } catch (err) {
    console.warn(`[DraftService] the database fetch error for ${docId}, checking offline buffer:`, err);
  }

  const localBuffer = getLocalDraftBuffer<T>(entityType, entityId);
  return { record: localBuffer, isFromOfflineBuffer: Boolean(localBuffer) };
}

/**
 * Saves draft to Supabase with revision concurrency checking.
 */
export async function saveCMSDraft<T = any>(params: {
  entityType: string;
  entityId: string;
  sector?: string;
  data: T;
  expectedRevision: number;
  userEmail: string;
  forceOverwrite?: boolean;
}): Promise<CMSDraftRecord<T>> {
  const {
    entityType,
    entityId,
    sector = 'portal',
    data,
    expectedRevision,
    userEmail,
    forceOverwrite = false,
  } = params;

  const docId = `${entityType}_${entityId}`;

  // 1. Check network connectivity
  if (!navigator.onLine) {
    const nextRevision = expectedRevision + 1;
    const offlineRecord: CMSDraftRecord<T> = {
      id: docId,
      entityType,
      entityId,
      sector,
      data,
      revision: nextRevision,
      updatedAt: new Date().toISOString(),
      updatedByEmail: userEmail,
      status: 'draft',
    };
    saveLocalDraftBuffer(entityType, entityId, offlineRecord);
    throw new Error('OFFLINE_SAVED_LOCALLY');
  }

  // 3. Prepare next revision doc
  const nextRevision = expectedRevision + 1;
  const newRecord: CMSDraftRecord<T> = {
    id: docId,
    entityType,
    entityId,
    sector,
    data,
    revision: nextRevision,
    updatedAt: new Date().toISOString(),
    updatedByEmail: userEmail,
    status: 'draft',
  };

  try {
    const { data: result, error } = await hardAdminClient.rpc('hard_save_cms_draft', {
      p_type: entityType, p_id: entityId, p_expected: expectedRevision, p_record: newRecord, p_force: forceOverwrite,
    });
    if (error) throw error;
    if (result?.conflict) {
      throw new RevisionConflictError(expectedRevision, result.revision, result.record);
    }
    if (!result?.record) throw new Error('the database did not confirm the draft.');
    clearLocalDraftBuffer(entityType, entityId);
    return result.record;
  } catch (err) {
    // If network or permission error, cache to local buffer
    if (!(err instanceof RevisionConflictError)) saveLocalDraftBuffer(entityType, entityId, newRecord);
    throw err;
  }
}
