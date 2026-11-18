import { useTextOverride } from '../../context/TextOverrideContext';
import { displayDigits } from './LocalizedValue';

export function interfaceCopyId(scope: string, text: string) {
  let hash = 2166136261;
  for (const char of text) { hash ^= char.charCodeAt(0); hash = Math.imul(hash, 16777619); }
  return scope + '.k' + (hash >>> 0).toString(36);
}

export function useInterfaceCopy(scope: string) {
  const { interfaceCopy, publicLanguage } = useTextOverride();
  return (text: string) => interfaceCopy[publicLanguage]?.[interfaceCopyId(scope, text)] ?? text;
}

/** Text only: editing through the dashboard never inserts a public editing control. */
export function InterfaceText({ id, source }: { id: string; source: string }) {
  const { interfaceCopy, publicLanguage } = useTextOverride();
  const text = displayDigits(interfaceCopy[publicLanguage]?.[id] ?? source, publicLanguage);
  return /\s\*$/.test(text) ? <>{text.slice(0, -1)}<span className="text-red-600">*</span></> : <>{text}</>;
}
