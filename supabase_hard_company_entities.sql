alter table public.hard_company_content
  drop constraint hard_company_content_kind_check,
  add constraint hard_company_content_kind_check
    check (kind in ('team','offices','statistics','partners','stories','faqs','certifications','enhanced_testimonials'));

create or replace view public.hard_public_company_content as
select kind,id,(
  select coalesce(jsonb_object_agg(key,value),'{}'::jsonb)
  from jsonb_each(body)
  where key = any(case kind
    when 'team' then array['id','name','role','avatar','sector','order']
    when 'offices' then array['id','name','city','address','image','sector','order']
    when 'statistics' then array['id','value','label','description','sector','order']
    when 'partners' then array['id','name','logoUrl','category','sector','order']
    when 'faqs' then array['id','question','answer','category','sector','order','status']
    when 'certifications' then array['id','title','issuer','issueDate','expiryDate','credentialId','credentialUrl','image','sector','order','status']
    when 'enhanced_testimonials' then array['id','name','role','location','avatar','rating','quote','dealHighlight','category','sector','order','featured','status','date']
    when 'stories' then array['id','name','role','location','avatar','rating','quote','dealHighlight','category','featured']
  end)
) as body
from public.hard_company_content
where case kind when 'stories' then true else body->>'status' = 'published' end;

create function public.hard_reset_company_entities(entity_kind text, entity_items jsonb)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or
    (select auth.jwt())->'app_metadata'->>'hard_role' is distinct from 'superadmin'
  then
    raise exception 'Administrator access required' using errcode = '42501';
  end if;
  if entity_kind is null or entity_kind not in ('faqs','certifications','enhanced_testimonials')
      or jsonb_typeof(entity_items) is distinct from 'array' then
    raise exception 'Invalid entity defaults' using errcode = '22023';
  end if;

  delete from public.hard_company_content where kind = entity_kind;
  insert into public.hard_company_content (kind, id, body)
  select entity_kind, item->>'id', item
  from jsonb_array_elements(entity_items) as items(item);
end;
$$;

revoke all on function public.hard_reset_company_entities(text,jsonb) from public, anon, authenticated;
grant execute on function public.hard_reset_company_entities(text,jsonb) to authenticated;

insert into public.hard_company_content (kind, id, body)
select 'faqs', item->>'id', item
from jsonb_array_elements($faq_defaults$[
  {
    "id": "faq-1",
    "question": {
      "en": "How do I book a private viewing or property consultation?",
      "ar": "كيف يمكنني حجز معاينة خاصة لعقار أو طلب استشارة؟"
    },
    "answer": {
      "en": "You can submit an inquiry directly on any property page, use the viewing modal, or contact our Senior Luxury Advisors directly via phone or WhatsApp.",
      "ar": "يمكنك تقديم طلب مباشرة من صفحة العقار عبر نموذج المعاينة، أو التواصل المباشر مع مستشارينا عبر الهاتف أو الواتساب."
    },
    "category": {
      "en": "Real Estate & Properties",
      "ar": "العقارات والمعاينات"
    },
    "sector": "realestate",
    "order": 1,
    "status": "published"
  },
  {
    "id": "faq-2",
    "question": {
      "en": "Are your development projects compliant with the Saudi Building Code (SBC)?",
      "ar": "هل مشاريع المقاولات والتطوير مطابقة لكود البناء السعودي؟"
    },
    "answer": {
      "en": "Yes. All HARD Group construction projects strictly enforce 100% SBC compliance, audited by certified independent engineering consultants.",
      "ar": "نعم. تلتزم كافة مشاريع هارد للمقاولات والتطوير بكود البناء السعودي (SBC) بنسبة 100% مع تدقيق مستمر من مكاتب هندسية معتمدة."
    },
    "category": {
      "en": "Construction & Engineering",
      "ar": "المقاولات والجودة"
    },
    "sector": "construction",
    "order": 2,
    "status": "published"
  },
  {
    "id": "faq-3",
    "question": {
      "en": "What warranty and maintenance options are provided for HVAC installations?",
      "ar": "ما هي الضمانات وخيارات الصيانة المقدمة لأنظمة التكييف؟"
    },
    "answer": {
      "en": "We offer comprehensive warranties up to 10 years on compressors and 2 to 5 years on overall system components, backed by 24/7 rapid emergency dispatch across Saudi Arabia.",
      "ar": "نقدم ضمانات شاملة تصل إلى 10 سنوات على الضواغط و2 إلى 5 سنوات على المكونات، مع صيانة طوارئ على مدار 24 ساعة."
    },
    "category": {
      "en": "HVAC & Services",
      "ar": "أنظمة التكييف والصيانة"
    },
    "sector": "hvac",
    "order": 3,
    "status": "published"
  },
  {
    "id": "faq-4",
    "question": {
      "en": "What is the corporate structure and regional reach of HARD Group?",
      "ar": "ما هي الهيكلية النطاق الجغرافي لمجموعة هارد؟"
    },
    "answer": {
      "en": "HARD Group operates three specialized sector divisions—Real Estate, Master Construction, and Enterprise HVAC—headquartered in Al Khobar with active regional operations in Riyadh and Jeddah.",
      "ar": "تضم المجموعة ثلاثة قطاعات متخصصة (العقارات، المقاولات العامة، وأنظمة التكييف) بالمقر الرئيسي بالخبر مع فروع وفروع تشغيلية بالرياض وجدة."
    },
    "category": {
      "en": "Group Governance",
      "ar": "عن المجموعة"
    },
    "sector": "group",
    "order": 4,
    "status": "published"
  }
]$faq_defaults$::jsonb) as defaults(item)
on conflict (kind,id) do nothing;
