import React, { Children, isValidElement, useEffect, useId, useRef, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import { normalizePropertySearch } from '../../lib/propertySearch';
import { useTextOverride } from '../../context/TextOverrideContext';
import { displayDigits } from './LocalizedValue';

type Option = { value: string; label: React.ReactNode; text: string; disabled?: boolean };
function optionList(children: React.ReactNode, result: Option[] = []): Option[] {
  Children.forEach(children, (child) => {
    if (!isValidElement<{ value?: string | number; children?: React.ReactNode; disabled?: boolean }>(child)) return;
    if (child.type === 'option') result.push({ value: String(child.props.value ?? child.props.children ?? ''), label: child.props.children,
      text: Children.toArray(child.props.children).join(''), disabled: child.props.disabled });
    else if (child.props.children) optionList(child.props.children, result);
  });
  return result;
}

/** A searchable combobox retaining the native form value and required validation. */
export function SearchableSelect({ children, value, defaultValue, onChange, className, id, disabled, required, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  const generatedId = useId();
  const listId = generatedId + '-options';
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const native = useRef<HTMLSelectElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [internal, setInternal] = useState(String(defaultValue ?? ''));
  const [invalid, setInvalid] = useState(false);
  const { publicLanguage } = useTextOverride();
  const ar = publicLanguage === 'ar';
  const options = optionList(children);
  const selected = String(value ?? internal);
  const current = options.find((option) => option.value === selected) ?? options[0];
  const filtered = options.filter((option) => !query || normalizePropertySearch(option.text).includes(normalizePropertySearch(query)));
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (!open) { setQuery(''); return; }
    search.current?.focus();
    const close = (event: MouseEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [open]);
  useEffect(() => setActive(0), [query]);
  function choose(option: Option) {
    if (option.disabled || disabled) return;
    setInternal(option.value); setInvalid(false); setOpen(false);
    if (native.current) {
      native.current.value = option.value;
      onChange?.({ target: native.current, currentTarget: native.current } as React.ChangeEvent<HTMLSelectElement>);
    }
    trigger.current?.focus();
  }
  return <div ref={root} className="relative min-w-0">
    <select {...props} ref={native} value={selected} disabled={disabled} required={required} tabIndex={-1} aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-px w-full opacity-0" onChange={onChange ?? (() => {})}
      onInvalid={(event) => { event.preventDefault(); setInvalid(true); trigger.current?.focus(); }}>
      {children}
    </select>
    <button ref={trigger} id={id} type="button" role="combobox" disabled={disabled} aria-expanded={open} aria-controls={listId}
      aria-haspopup="listbox" aria-required={required} aria-invalid={invalid || undefined} aria-label={props['aria-label']}
      className={(className ?? 'w-full rounded-xl border border-slate-200 bg-white p-3 text-sm') + ' flex items-center justify-between gap-2 text-start disabled:opacity-50'}
      onClick={() => setOpen(!open)} onKeyDown={(event) => { if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true); } }}>
      <span className="min-w-0 flex-1 truncate">{typeof current?.label === 'string' ? displayDigits(current.label, publicLanguage) : current?.label ?? (ar ? 'اختر خيارًا' : 'Choose an option')}</span>
      <ChevronDown className="size-4 shrink-0" aria-hidden="true" />
    </button>
    {invalid && <p role="alert" className="mt-1 text-xs text-red-600">{ar ? 'يرجى اختيار قيمة لهذا الحقل.' : 'Please select an option.'}</p>}
    {open && <div className="absolute start-0 top-full z-[1000] mt-1 w-full min-w-48 rounded-xl border border-slate-200 bg-white text-slate-900 shadow-xl">
      <div className="relative border-b border-slate-100 p-2">
        <Search className="absolute start-4 top-4 size-4 text-slate-400" aria-hidden="true" />
        <input ref={search} aria-label={ar ? 'ابحث في الخيارات' : 'Search options'} value={query} onChange={(event) => setQuery(event.target.value)}
          placeholder={ar ? 'ابحث في الخيارات…' : 'Search options…'}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pe-2 ps-8 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-blue-500"
          onKeyDown={(event) => {
            if (event.key === 'Escape') { event.preventDefault(); setOpen(false); trigger.current?.focus(); }
            if (event.key === 'ArrowDown') { event.preventDefault(); setActive((index) => Math.min(index + 1, filtered.length - 1)); }
            if (event.key === 'ArrowUp') { event.preventDefault(); setActive((index) => Math.max(index - 1, 0)); }
            if (event.key === 'Enter') { event.preventDefault(); if (filtered[active]) choose(filtered[active]); }
            if (event.key === 'Tab') setOpen(false);
          }} />
      </div>
      <ul id={listId} role="listbox" className="max-h-60 overflow-auto py-1">
        {filtered.map((option, index) => <li key={option.value + index} role="option" aria-selected={selected === option.value} aria-disabled={option.disabled}>
          <button type="button" disabled={option.disabled} onMouseEnter={() => setActive(index)} onClick={() => choose(option)}
            className={'flex w-full items-center justify-between gap-2 px-3 py-2 text-start text-sm disabled:opacity-40 ' + (index === active ? 'bg-blue-50 text-blue-800' : 'hover:bg-slate-50')}>
            {typeof option.label === 'string' ? displayDigits(option.label, publicLanguage) : option.label}{selected === option.value && <Check className="size-4 shrink-0" />}
          </button>
        </li>)}
        {!filtered.length && <li className="px-3 py-4 text-sm text-slate-500">{ar ? 'لا توجد نتائج' : 'No results'}</li>}
      </ul>
    </div>}
  </div>;
}
