import { useState } from 'react';
import type { Language } from '../../types';
import type { SectorId } from '../../types/firestore-schema';
import { uploadMediaAsset } from '../../lib/cmsMediaLibrary';

export function CMSSectionImage({ label, url, onChange, sector, language }: {
  label: string;
  url: string;
  onChange: (url: string) => void;
  sector: SectorId;
  language: Language;
}) {
  const ar = language === 'ar';
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  return <div className="space-y-2 rounded-xl border p-3">
    <label className="block">{label}
      <input dir="ltr" type="text" className="block w-full rounded border p-2" value={url}
        disabled={busy} onChange={(event) => onChange(event.target.value)} />
    </label>
    <label className="block">{ar ? 'رفع صورة للمسودة' : 'Upload draft image'}
      <input type="file" className="block max-w-full" accept="image/jpeg,image/png,image/webp,image/avif,image/gif"
        disabled={busy} onChange={async (event) => {
          const input = event.currentTarget;
          const file = input.files?.[0];
          if (!file) return;
          setBusy(true);
          setMessage('');
          try {
            const asset = await uploadMediaAsset({ file, sector });
            onChange(asset.downloadUrl);
            setMessage(ar ? 'تم الرفع. اعتمد الإصدار لنشر الصورة.' : 'Uploaded. Approve the release to publish it.');
          } catch {
            setMessage(ar ? 'تعذر رفع الصورة.' : 'Unable to upload the image.');
          } finally {
            setBusy(false);
            input.value = '';
          }
        }} />
    </label>
    {message && <p role="status">{message}</p>}
  </div>;
}
