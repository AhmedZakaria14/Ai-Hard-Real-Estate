create table public.hard_blog_categories (
  id text primary key check (id ~ '^[a-z0-9][a-z0-9-]{0,79}$'),
  name_ar text not null check (char_length(btrim(name_ar)) between 1 and 100),
  name_en text not null check (char_length(btrim(name_en)) between 1 and 100),
  sort_order integer not null default 100
);
create unique index hard_blog_categories_normalized_ar on public.hard_blog_categories (lower(btrim(name_ar)));
create unique index hard_blog_categories_normalized_en on public.hard_blog_categories (lower(btrim(name_en)));
alter table public.hard_blog_categories enable row level security;
revoke all on public.hard_blog_categories from public, anon, authenticated;
grant select on public.hard_blog_categories to anon, authenticated;
grant insert, delete on public.hard_blog_categories to authenticated;
create policy hard_blog_categories_read on public.hard_blog_categories for select to anon, authenticated using (true);
create policy hard_blog_categories_admin on public.hard_blog_categories for all to authenticated
using ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin')
with check ((select auth.uid()) is not null and (select auth.jwt())->'app_metadata'->>'hard_role'='superadmin');

insert into public.hard_blog_categories (id,name_ar,name_en,sort_order) values
  ('market-studies','دراسات واتجاهات السوق','Market Studies and Trends',1),
  ('residential-guide','دليل العقار السكني','Residential Property Guide',2),
  ('investment-strategy','استراتيجية الاستثمار','Investment Strategy',3),
  ('development','التطوير العقاري','Real Estate Development',4),
  ('financial-solutions','الحلول المالية العقارية','Real Estate Financial Solutions',5);

update public.hard_catalog as post
set content=post.content || jsonb_build_object('categoryId',category.id,'category',jsonb_build_object('ar',category.name_ar,'en',category.name_en)), updated_at=now()
from public.hard_blog_categories as category
where post.collection='blog_posts' and category.id=case lower(post.content#>>'{category,en}')
  when 'market intelligence' then 'market-studies'
  when 'regulatory insights' then 'residential-guide'
  when 'investment strategy' then 'investment-strategy'
end;

alter table public.hard_catalog add column blog_category_id text
  generated always as (case when collection='blog_posts' then content->>'categoryId' end) stored;
alter table public.hard_catalog add constraint hard_catalog_blog_category_fkey
  foreign key (blog_category_id) references public.hard_blog_categories(id) on delete restrict;
create index hard_catalog_blog_category_idx on public.hard_catalog (blog_category_id) where blog_category_id is not null;
