import { hardAdminClient } from './hardAdminClient';

export type RequestMetrics = {
  requests: number;
  unarchived: number;
  pending: number;
  appointments: number;
  archived: number;
  subscribers: number;
};

export async function readRequestMetrics(days: number, signal: AbortSignal): Promise<RequestMetrics> {
  const { data, error } = await hardAdminClient.rpc('hard_operations_report', { p_days: days }).abortSignal(signal);
  if (error || !data) throw error ?? Error('Missing request metrics');
  return data;
}
