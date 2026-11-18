import { useEffect, useState } from 'react';
import { hardPublishableKey, hardSupabaseUrl } from '../../lib/db/hardCatalog';
import { DEFAULT_FORM_SCHEMAS, type FormSchemaConfig } from '../../lib/forms/formSchemaService';
import { FormValidationError, submitCustomerForm, type CustomerFormType, type FormSubmissionPayload } from '../../lib/forms/formSubmissionService';
import { SearchableSelect } from '../ui/SearchableSelect';
import { FileUploadZone } from './FileUploadZone';
import type { FormAttachmentMeta } from '../../types/backend-schema';

type Values = Record<string, string | boolean>;
export function useCustomerFormConfig(formType: CustomerFormType) {
  const [schema, setSchema] = useState<FormSchemaConfig>(DEFAULT_FORM_SCHEMAS[formType]);
  const [values, setValues] = useState<Values>({});
  const [attachments, setAttachments] = useState<FormAttachmentMeta[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    const refresh = async () => {
      try {
        const params = new URLSearchParams({form_type: 'eq.' + formType, select: 'body', limit: '1'});
        const response = await fetch(hardSupabaseUrl + '/rest/v1/hard_public_form_templates?' + params, {headers: {apikey: hardPublishableKey}, signal: controller.signal, cache: 'no-store'});
        if (!response.ok) return;
        const rows: {body: FormSchemaConfig}[] = await response.json();
        if (rows[0] && !controller.signal.aborted) setSchema({...DEFAULT_FORM_SCHEMAS[formType], ...rows[0].body});
      } catch { /* The current form stays usable during a configuration outage. */ }
    };
    void refresh();
    window.addEventListener('focus', refresh);
    return () => { controller.abort(); window.removeEventListener('focus', refresh); };
  }, [formType]);
  const fields = schema.fields.filter((field) => field.id.startsWith('field_'));
  const submit = async (payload: FormSubmissionPayload) => {
    const lang = payload.language ?? 'ar';
    const errors: Record<string, string> = {};
    for (const field of fields) {
      const value = values[field.id];
      if (field.required && field.type !== 'file_attachment' && !value) errors[field.id] = (lang === 'ar' ? 'الحقل مطلوب: ' : 'Required: ') + field.label[lang];
      if (field.required && field.type === 'file_attachment' && !attachments.length) errors[field.id] = lang === 'ar' ? 'أرفق الملف المطلوب.' : 'Please attach the required file.';
    }
    if (Object.keys(errors).length) throw new FormValidationError(Object.values(errors).join(' '), errors);
    const result = await submitCustomerForm({...payload, schemaVersion: schema.schemaVersion,
      details: {...payload.details, customFields: fields.filter((field) => field.type !== 'file_attachment').map((field) => ({id: field.id, label: field.label, value: values[field.id] ?? ''}))},
      attachments: [...(payload.attachments ?? []), ...attachments],
    });
    setValues({}); setAttachments([]);
    return result;
  };
  return {schema, fields, values, setValues, attachments, setAttachments, submit};
}

export function ConfiguredFormFields({ form, language }: { form: ReturnType<typeof useCustomerFormConfig>; language: 'ar' | 'en' }) {
  const defaults = DEFAULT_FORM_SCHEMAS[form.schema.formType];
  const inputClass = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-blue-500';
  return <div className="space-y-4 empty:hidden">
    {form.schema.title[language] !== defaults.title[language] && <h3 className="text-lg font-bold">{form.schema.title[language]}</h3>}
    {form.schema.description[language] !== defaults.description[language] && <p className="text-sm text-slate-600">{form.schema.description[language]}</p>}
    {form.fields.map((field) => <div key={field.id} className="space-y-1.5">
      <label htmlFor={'custom-' + field.id} className="block text-sm font-semibold">{field.label[language]} {field.required && <span className="text-red-600">*</span>}</label>
      {field.type === 'file_attachment' ? <FileUploadZone language={language} attachments={form.attachments} onChange={form.setAttachments} />
        : field.type === 'select' ? <SearchableSelect id={'custom-' + field.id} required={field.required} className={inputClass} value={String(form.values[field.id] ?? '')} onChange={(event) => form.setValues((previous) => ({...previous, [field.id]: event.target.value}))}>
          <option value="">{language === 'ar' ? 'اختر خيارًا' : 'Choose an option'}</option>
          {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label[language]}</option>)}
        </SearchableSelect>
        : field.type === 'textarea' ? <textarea id={'custom-' + field.id} className={inputClass} required={field.required} maxLength={6000} rows={3} placeholder={field.placeholder?.[language]} value={String(form.values[field.id] ?? '')} onChange={(event) => form.setValues((previous) => ({...previous, [field.id]: event.target.value}))} />
        : <input id={'custom-' + field.id} type={field.type === 'checkbox' ? 'checkbox' : field.type} required={field.required} maxLength={field.type === 'email' ? 254 : 500} className={field.type === 'checkbox' ? 'size-5 accent-blue-600' : inputClass}
          placeholder={field.placeholder?.[language]} checked={field.type === 'checkbox' ? Boolean(form.values[field.id]) : undefined}
          value={field.type === 'checkbox' ? undefined : String(form.values[field.id] ?? '')}
          onChange={(event) => form.setValues((previous) => ({...previous, [field.id]: field.type === 'checkbox' ? event.target.checked : event.target.value}))} />}
      {field.helpText?.[language] && <p className="text-xs text-slate-500">{field.helpText[language]}</p>}
    </div>)}
  </div>;
}
