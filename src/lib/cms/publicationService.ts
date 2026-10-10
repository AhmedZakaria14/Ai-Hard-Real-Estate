/**
 * HARD GROUP - CMS ATOMIC PUBLICATION & AUTHORIZATION SERVICE
 * 
 * Enforces publisher authorization rules (canPublish check), pre-publication policy
 * validation, atomic write batch execution, audit logging, and historical revisions.
 */

import { doc, getDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { canPublish } from '../../types/firestore-schema';
import { PublicationParams, PublicationResult } from './publicationTypes';
import { validateEntityForPublish } from './publicationValidation';

export async function publishEntityWithAtomicBatch(params: PublicationParams): Promise<PublicationResult> {
  const { entityType, entityId, sector = 'portal', draftData, publisherUser, targetCollectionName } = params;

  // 1. Authorization Enforcement
  if (!canPublish(publisherUser.role)) {
    throw new Error(
      `PERMISSION_DENIED: Role '${publisherUser.role}' is not authorized to publish content. Only Super Admins and Publishers can perform publication.`
    );
  }

  // 2. Pre-Publication Policy Validation
  const validation = validateEntityForPublish(entityType, draftData);
  if (!validation.isValid) {
    const errList = validation.errors.map((e) => `[${e.field}]: ${e.messageEn}`).join(' | ');
    throw new Error(`PUBLICATION_VALIDATION_FAILED: ${errList}`);
  }

  // Determine target collection
  let collectionName = targetCollectionName;
  if (!collectionName) {
    if (entityType === 'page_document') collectionName = 'pages';
    else if (entityType === 'property') collectionName = 'properties';
    else if (entityType === 'project') collectionName = 'construction_projects';
    else if (entityType === 'form_schema') collectionName = 'forms';
    else collectionName = 'site_content';
  }

  const now = new Date().toISOString();
  const targetDocRef = doc(db, collectionName, entityId);
  const draftDocRef = doc(db, 'cms_drafts', `${entityType}_${entityId}`);

  // Determine publication version number
  let newVersion = 1;
  try {
    const snap = await getDoc(targetDocRef);
    if (snap.exists()) {
      const existing = snap.data();
      if (typeof existing.publicationVersion === 'number') {
        newVersion = existing.publicationVersion + 1;
      } else if (typeof existing.schemaVersion === 'number') {
        newVersion = existing.schemaVersion + 1;
      }
    }
  } catch (err) {
    console.warn('[PublicationService] Failed to read existing published doc for version counter:', err);
  }

  const auditEventId = `audit_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const auditDocRef = doc(db, 'audit_events', auditEventId);

  const revisionId = `rev_${entityType}_${entityId}_v${newVersion}`;
  const revisionDocRef = doc(db, 'revisions', revisionId);

  const publishedPayload = {
    ...draftData,
    id: entityId,
    sector,
    publicationStatus: 'published',
    publicationVersion: newVersion,
    publishedAt: now,
    publishedBy: publisherUser.email || publisherUser.uid,
    updatedAt: now,
  };

  const auditPayload = {
    id: auditEventId,
    eventType: 'CONTENT_PUBLISHED',
    entityType,
    entityId,
    sector,
    publicationVersion: newVersion,
    actorUid: publisherUser.uid,
    actorEmail: publisherUser.email,
    actorRole: publisherUser.role,
    createdAt: now,
  };

  const revisionPayload = {
    id: revisionId,
    entityType,
    entityId,
    sector,
    version: newVersion,
    snapshotData: draftData,
    publishedBy: publisherUser.email,
    publishedAt: now,
  };

  // 3. Perform Atomic Batch Write
  const batch = writeBatch(db);

  // A: Write to public published collection
  batch.set(targetDocRef, publishedPayload, { merge: true });

  // B: Update draft document status in cms_drafts
  batch.set(
    draftDocRef,
    {
      status: 'published',
      publishedVersion: newVersion,
      updatedAt: now,
      updatedByEmail: publisherUser.email,
    },
    { merge: true }
  );

  // C: Record immutable Audit Event
  batch.set(auditDocRef, auditPayload);

  // D: Record historical Revision Snapshot
  batch.set(revisionDocRef, revisionPayload);

  // Execute batch atomically
  await batch.commit();

  return {
    success: true,
    publishedVersion: newVersion,
    publishedAt: now,
    auditEventId,
    messageAr: `تم نشر المحتوى بنجاح كإصدار مباشر رقم v${newVersion}!`,
    messageEn: `Content published live successfully as version v${newVersion}!`,
  };
}
