import { createClient } from 'npm:@supabase/supabase-js@2.112.4';

const siteOrigin = 'https://ai-hard-real-estate.vercel.app';
const publishableKey = 'sb_publishable_jam6dG2vyvPi65DHUEgqXQ_4YZfJGxF';
const bucket = 'hard-form-attachments';
const maxBytes = 10 * 1024 * 1024;
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const headers = {
  'Access-Control-Allow-Origin': siteOrigin,
  'Access-Control-Allow-Headers': 'apikey, content-type, x-file-name',
  'Access-Control-Allow-Methods': 'POST, DELETE, OPTIONS',
  'Cache-Control': 'no-store',
  'Content-Type': 'application/json',
  Vary: 'Origin',
};

function reply(status: number, value: object) {
  return new Response(JSON.stringify(value), { status, headers });
}

const mimeChecks: Record<string, (b: Uint8Array) => boolean> = {
  'application/pdf': (b) => String.fromCharCode(...b.slice(0, 5)) === '%PDF-',
  'image/jpeg': (b) => b[0] === 255 && b[1] === 216 && b[2] === 255,
  'image/png': (b) => [137,80,78,71,13,10,26,10].every((v, i) => b[i] === v),
  'image/webp': (b) => String.fromCharCode(...b.slice(0, 4)) === 'RIFF' &&
    String.fromCharCode(...b.slice(8, 12)) === 'WEBP',
};

async function readFile(req: Request): Promise<Uint8Array | null> {
  const reader = req.body?.getReader();
  if (!reader) return null;
  const chunks: Uint8Array[] = [];
  let size = 0;
  for (;;) {
    const result = await reader.read();
    if (result.done) break;
    size += result.value.length;
    if (size > maxBytes) {
      await reader.cancel();
      return null;
    }
    chunks.push(result.value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}

async function cleanupExpired() {
  const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
  const { data: expired } = await db.from('hard_attachment_uploads')
    .select('id').in('state', ['reserved', 'uploaded']).lt('created_at', cutoff).limit(20);
  if (!expired?.length) return;
  const { data: removed } = await db.from('hard_attachment_uploads')
    .update({ state: 'removed' }).in('id', expired.map(({ id }) => id))
    .in('state', ['reserved', 'uploaded']).select('path');
  if (removed?.length) await db.storage.from(bucket).remove(removed.map(({ path }) => path));
}

Deno.serve(async (req) => {
  const origin = req.headers.get('origin');
  if (origin !== siteOrigin) return reply(403, { error: 'Origin not allowed' });
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers });
  if (req.headers.get('apikey') !== publishableKey) return reply(401, { error: 'Invalid API key' });

  try {
    if (req.method === 'DELETE') {
      const len = Number(req.headers.get('content-length'));
      if (len > 1024) return reply(413, { error: 'Invalid upload ticket' });
      const requestUrl = new URL(req.url);
      const id = requestUrl.searchParams.get('id');
      const ticket = req.headers.get('x-file-name');
      const uuid = /^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i;
      if (!id || !ticket || !uuid.test(id) || !uuid.test(ticket)) return reply(400, { error: 'Invalid upload ticket' });
      const { data, error } = await db.from('hard_attachment_uploads')
        .update({ state: 'removed' }).eq('id', id).eq('ticket', ticket)
        .in('state', ['uploaded', 'removed']).select('path').maybeSingle();
      if (error) throw error;
      if (data) {
        const { error: removeError } = await db.storage.from(bucket).remove([data.path]);
        if (removeError) throw removeError;
      }
      return reply(200, { success: true });
    }
    if (req.method !== 'POST') return reply(405, { error: 'Method not allowed' });
    const mime = req.headers.get('content-type') || '';
    if (!Object.hasOwn(mimeChecks, mime)) return reply(415, { error: 'Unsupported file format' });
    if (Number(req.headers.get('content-length')) > maxBytes) return reply(413, { error: 'Maximum attachment size is 10 MB' });
    const bytes = await readFile(req);
    if (!bytes?.length) return reply(413, { error: 'Invalid file size' });
    if (!mimeChecks[mime](bytes)) return reply(415, { error: 'File does not match its media type' });

    const rawName = req.headers.get('x-file-name') || 'attachment';
    let fileName = 'attachment';
    try { fileName = decodeURIComponent(rawName).replace(/[\u0000-\u001f\u007f]/g, '').slice(0, 180) || fileName; } catch { /* use default */ }
    const id = crypto.randomUUID();
    const ticket = crypto.randomUUID();
    const path = 'submissions/' + id;
    const forwarded = (req.headers.get('x-forwarded-for') || 'unknown').slice(0, 120);
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(forwarded));
    const clientHash = Array.from(new Uint8Array(digest), (n) => n.toString(16).padStart(2, '0')).join('');
    const { data: reserved, error: reserveError } = await db.rpc('hard_reserve_attachment', {
      p_id: id, p_ticket: ticket, p_path: path, p_filename: fileName, p_mime: mime, p_size: bytes.length, p_client: clientHash,
    });
    if (reserveError) throw reserveError;
    if (!reserved) return reply(429, { error: 'Upload limit reached. Try again later.' });
    const { error: uploadError } = await db.storage.from(bucket).upload(path, bytes, { contentType: mime, upsert: false });
    if (uploadError) throw uploadError;
    const { error: updateError } = await db.from('hard_attachment_uploads').update({ state: 'uploaded' })
      .eq('id', id).eq('state', 'reserved').select('id').single();
    if (updateError) {
      await db.storage.from(bucket).remove([path]);
      throw updateError;
    }
    EdgeRuntime.waitUntil(cleanupExpired().catch(() => {}));
    return reply(201, { id, ticket, fileName, mimeType: mime, fileSizeBytes: bytes.length });
  } catch {
    return reply(500, { error: 'Attachment operation failed' });
  }
});
