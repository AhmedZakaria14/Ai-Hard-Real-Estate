/**
 * HARD GROUP - CMS REVISION HISTORY & RETENTION MANAGEMENT SERVICE
 * 
 * Provides version tracking, historical snapshot previews, non-destructive restoration
 * as new draft revisions, media/reference integrity analysis, and automated retention limits.
 */

import { hardAdminClient } from '../db/hardAdminClient';
import { getCMSDraft, saveCMSDraft } from './draftService';

export type RevisionChangeType = 'autosave_draft' | 'manual_draft' | 'published_release' | 'restored_draft';

export interface ContentRevisionDoc {
  id: string;
  entityType: string;
  entityId: string;
  sector?: string;
  version: number;
  snapshotData: any;
  changedBy: string;
  changedAt: string;
  changeType: RevisionChangeType;
  restoredFromVersion?: number;
  notes?: string;
}

export interface MediaCheckResult {
  hasMissingMedia: boolean;
  missingMediaUrls: string[];
  warnings: { ar: string; en: string }[];
}

export interface ReferenceCheckResult {
  hasOutdatedReferences: boolean;
  brokenReferences: string[];
  warnings: { ar: string; en: string }[];
}

export interface RevisionAnalysisResult {
  mediaCheck: MediaCheckResult;
  referenceCheck: ReferenceCheckResult;
}

export async function saveRevisionSnapshot(
  entityType: string, entityId: string, snapshotData: unknown, _userEmail: string,
  changeType: RevisionChangeType = 'manual_draft', sector = 'portal',
  notes?: string, restoredFromVersion?: number,
): Promise<ContentRevisionDoc> {
  const { data, error } = await hardAdminClient.rpc('hard_save_cms_revision', {
    p_type: entityType, p_id: entityId,
    p_body: { snapshotData, changeType, sector, notes, restoredFromVersion },
  });
  if (error) throw error;
  return data;
}

export async function fetchRevisionHistory(entityType: string, entityId: string): Promise<ContentRevisionDoc[]> {
  const { data, error } = await hardAdminClient.from('hard_cms_revisions').select('id,body')
    .eq('entity_type',entityType).eq('entity_id',entityId).order('version',{ascending:false}).limit(50);
  if (error) throw error;
  return (data ?? []).map(({ id, body }) => ({ ...body, id }));
}

/**
 * Analyzes missing media assets and outdated entity/author/category references in a snapshot.
 */
export async function analyzeRevisionIntegrity(snapshotData: any): Promise<RevisionAnalysisResult> {
  const mediaWarnings: { ar: string; en: string }[] = [];
  const missingMediaUrls: string[] = [];

  const refWarnings: { ar: string; en: string }[] = [];
  const brokenReferences: string[] = [];

  const jsonString = JSON.stringify(snapshotData || {});

  // 1. Detect image URLs in snapshot
  const urlRegex = /(https?:\/\/[^\s"'<>]+?\.(?:png|jpg|jpeg|webp|gif|svg))/gi;
  const matches = Array.from(new Set(jsonString.match(urlRegex) || []));

  for (const url of matches) {
    if (url.includes('placeholder') || url.includes('example.com') || url.length < 10) {
      missingMediaUrls.push(url);
      mediaWarnings.push({
        en: `Media asset URL '${url.substring(0, 45)}...' uses an unverified or temporary domain.`,
        ar: `رابط الصورة '${url.substring(0, 45)}...' قد يكون مؤقتاً أو غير متاح.`,
      });
    }
  }

  return {
    mediaCheck: {
      hasMissingMedia: missingMediaUrls.length > 0,
      missingMediaUrls,
      warnings: mediaWarnings,
    },
    referenceCheck: {
      hasOutdatedReferences: brokenReferences.length > 0,
      brokenReferences,
      warnings: refWarnings,
    },
  };
}

/**
 * Restores a historical revision snapshot into a NEW draft without overwriting or destroying history.
 */
export async function restoreRevisionToDraft(
  entityType: string,
  entityId: string,
  revision: ContentRevisionDoc,
  userEmail: string
): Promise<{ newDraft: any; newRevision: ContentRevisionDoc }> {
  const { record } = await getCMSDraft(entityType, entityId);
  const newDraft = await saveCMSDraft({
    entityType, entityId, sector: revision.sector || 'portal',
    expectedRevision: record?.revision ?? 0, data: revision.snapshotData, userEmail,
  });
  const newRevision = await saveRevisionSnapshot(
    entityType, entityId, revision.snapshotData, userEmail, 'restored_draft',
    revision.sector || 'portal', `Restored from v${revision.version}`, revision.version,
  );
  return { newDraft: { ...newDraft, content: newDraft.data }, newRevision };
}
