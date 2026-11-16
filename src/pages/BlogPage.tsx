import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Language, BlogPost } from '../types';
import { translations } from '../lib/translations';
import { blogCategories, blogCategoryKey, useCatalogBlogCategories } from '../lib/blogCategories';
import { loadPublishedArticles } from '../lib/db/hardCatalog';
import { Badge } from '../components/ui/Badge';
import { SafeRichContent } from '../components/blog/SafeRichContent';
import { getPageTitle, updateDocumentTitle } from '../lib/pageTitles';
import { getLocalizedText } from '../lib/utils';

const fallbackCover = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80';

export function BlogPage({ language, articleId }: { language: Language; articleId: string | null }) {
  const copy = translations[language].blog;
  const ar = language === 'ar';
  const ArrowIcon = ar ? ArrowLeft : ArrowRight;
  const { categories: configured } = useCatalogBlogCategories();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    const controller = new AbortController();
    loadPublishedArticles(controller.signal).then((rows) => {
      if (controller.signal.aborted) return;
      setPosts(rows.map(({ content }) => content).filter((post) => (post.status || 'published') === 'published'));
      setStatus('ready');
    }).catch(() => { if (!controller.signal.aborted) setStatus('error'); });
    return () => controller.abort();
  }, []);
  const article = articleId ? posts.find((post) => post.id === articleId || getLocalizedText(post.slug, language) === articleId) : undefined;
  useEffect(() => {
    updateDocumentTitle(getPageTitle({
      page: 'blog', language,
      articleTitle: article ? { ar: getLocalizedText(article.title, 'ar'), en: getLocalizedText(article.title, 'en') } : null,
    }));
  }, [article, language]);

  const categories = [{ key: 'all', label: { ar: 'الكل', en: 'All' } }, ...blogCategories(posts, configured)];
  const visible = posts.filter((post) => activeCategory === 'all' || blogCategoryKey(post) === activeCategory);
  const href = (post: BlogPost) => '/realestate/blog/' + encodeURIComponent(post.id);
  const label = (post: BlogPost) => categories.find((item) => item.key === blogCategoryKey(post))?.label[language] || getLocalizedText(post.category, language);
  const date = (post: BlogPost) => post.date || post.publishedAt?.slice(0, 10) || '';

  return <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
    {articleId && <a href="/realestate/blog" className="inline-block font-semibold text-blue-700 hover:underline">{ar ? 'العودة إلى المدونة' : 'Back to the blog'}</a>}
    {status === 'loading' && <p role="status">{ar ? 'جارٍ تحميل المقالات…' : 'Loading articles…'}</p>}
    {status === 'error' && <p role="alert">{ar ? 'تعذّر تحميل المقالات. أعد تحميل الصفحة للمحاولة مرة أخرى.' : 'Could not load articles. Reload the page to try again.'}</p>}
    {articleId ? article ? <article className="mx-auto max-w-4xl space-y-5">
      <Badge variant="primary">{label(article)}</Badge>
      <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">{getLocalizedText(article.title, language)}</h1>
      <p className="text-sm text-slate-600">{date(article)}</p>
      <img src={article.image || fallbackCover} alt={getLocalizedText(article.title, language)} className="aspect-video w-full rounded-2xl object-cover" />
      <p className="text-lg text-slate-700">{getLocalizedText(article.excerpt, language)}</p>
      <SafeRichContent content={getLocalizedText(article.content, language)} dir={ar ? 'rtl' : 'ltr'} />
    </article> : status === 'ready' && <h1>{ar ? 'المقال غير متاح' : 'Article unavailable'}</h1> : <>
      <div className="max-w-3xl space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">{copy.pageTitle}</h1>
        <p className="text-sm text-slate-600 sm:text-base">{copy.pageSubtitle}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => <button key={category.key} type="button" onClick={() => setActiveCategory(category.key)}
          aria-pressed={activeCategory === category.key}
          className={`rounded-xl border px-4 py-2 text-sm font-semibold ${activeCategory === category.key ? 'bg-blue-700 text-white' : 'bg-white text-slate-700'}`}>
          {category.label[language]}
        </button>)}
      </div>
      {status === 'ready' && !visible.length && <p role="status">{ar ? 'لا توجد مقالات منشورة في هذا التصنيف.' : 'No published articles in this category.'}</p>}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((post) => <article key={post.id} className="flex flex-col overflow-hidden rounded-3xl border bg-white shadow-sm">
          <a href={href(post)} aria-label={getLocalizedText(post.title, language)} className="relative block">
            <img src={post.image || fallbackCover} alt="" className="aspect-16/10 w-full object-cover" loading="lazy" />
            <div className="absolute start-3 top-3"><Badge variant="gradient">{label(post)}</Badge></div>
          </a>
          <div className="flex grow flex-col gap-3 p-6">
            <p className="text-xs text-slate-600">{date(post)}</p>
            <h2 className="text-lg font-bold"><a href={href(post)} className="hover:text-blue-700">{getLocalizedText(post.title, language)}</a></h2>
            <p className="grow text-sm text-slate-600">{getLocalizedText(post.excerpt, language)}</p>
            <a href={href(post)} className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline">
              {copy.readArticle}<ArrowIcon className="size-4" aria-hidden="true" />
            </a>
          </div>
        </article>)}
      </div>
    </>}
  </div>;
}
