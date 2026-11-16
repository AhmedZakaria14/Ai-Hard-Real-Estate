/**
 * HARD GROUP - CMS ATOMIC PUBLICATION & AUTHORIZATION SERVICE
 * 
 * Enforces publisher authorization rules (canPublish check), pre-publication policy
 * validation, atomic write batch execution, audit logging, and historical revisions.
 */

import { hardAdminClient } from '../db/hardAdminClient';
import { canPublish } from '../../types/firestore-schema';
import { PublicationParams, PublicationResult } from './publicationTypes';
import { validateEntityForPublish } from './publicationValidation';
import { generateCorrelationId, logProductionEvent } from '../monitoring/productionLogger';

export async function publishEntityWithAtomicBatch(params: PublicationParams): Promise<PublicationResult> {
  const { entityType, entityId, sector = 'portal', draftData, publisherUser } = params;
  const correlationId = generateCorrelationId('pub');

  // 1. Authorization Enforcement
  if (!canPublish(publisherUser.role)) {
    const errMsg = `PERMISSION_DENIED: Role '${publisherUser.role}' is not authorized to publish content.`;
    logProductionEvent({
      correlationId,
      level: 'WARN',
      category: 'publication_failure',
      errorCode: 'ERR_PUBLISH_PERMISSION_DENIED',
      component: 'publicationService',
      message: errMsg,
      statusClassification: 'DEFINITIVE_FAILURE',
      userRole: publisherUser.role,
      userEmail: publisherUser.email,
      meta: { entityType, entityId },
    }).catch(() => {});

    throw new Error(errMsg);
  }

  // 2. Pre-Publication Policy Validation
  const validation = validateEntityForPublish(entityType, draftData);
  if (!validation.isValid) {
    const errList = validation.errors.map((e) => `[${e.field}]: ${e.messageEn}`).join(' | ');
    logProductionEvent({
      correlationId,
      level: 'WARN',
      category: 'publication_failure',
      errorCode: 'ERR_PUBLISH_VALIDATION_FAILED',
      component: 'publicationService',
      message: `Publication validation failed for ${entityType} ${entityId}: ${errList}`,
      statusClassification: 'DEFINITIVE_FAILURE',
      userRole: publisherUser.role,
      userEmail: publisherUser.email,
      meta: { entityType, entityId, errors: validation.errors },
    }).catch(() => {});

    throw new Error(`PUBLICATION_VALIDATION_FAILED: ${errList}`);
  }

  if (entityType !== 'page_document' && entityType !== 'form_schema') {
    throw new Error('هذا النوع غير مدعوم في مسار النشر الجديد.');
  }
  const { data: release, error } = await hardAdminClient.rpc('hard_publish_cms', {
    p_type: entityType, p_id: entityId, p_sector: sector, p_body: draftData,
  });
  if (error) throw error;
  if (!release?.version || !release?.eventId) throw new Error('Supabase did not confirm the release.');
  return {
    success: true,
    publishedVersion: release.version,
    publishedAt: release.publishedAt,
    auditEventId: release.eventId,
    messageAr: `حُفظ إصدار المحتوى رقم ${release.version} في Supabase.`,
    messageEn: `Content release v${release.version} saved in Supabase.`,
  };
}
