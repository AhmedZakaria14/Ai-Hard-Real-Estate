import { LocalizedValue } from '../components/ui/LocalizedValue';
import { InterfaceText } from '../components/ui/InterfaceText';
import { ManagedImg, ManagedA } from '../components/ui/ManagedElements';
import { usePageMedia } from '../lib/pageMedia';
import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Language, BlogPost } from '../types';
import { useTextOverride } from '../context/TextOverrideContext';
import { blogCategories, blogCategoryKey, useCatalogBlogCategories } from '../lib/blogCategories';
import { loadPublishedArticles } from '../lib/db/hardCatalog';
import { Badge } from '../components/ui/Badge';
import { SafeRichContent } from '../components/blog/SafeRichContent';
import { getPageTitle, updateDocumentTitle } from '../lib/pageTitles';
import { getLocalizedText } from '../lib/utils';
import { formatPublicationDate } from '../lib/publicDate';


export function BlogPage({ language, articleId }: { language: Language; articleId: string | null }) {
  const { propertyPlaceholderImage } = usePageMedia();
  const { translations } = useTextOverride();
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
  const date = (post: BlogPost) => formatPublicationDate(post.date || post.publishedAt, language);

  return <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
    {articleId && <a href="/realestate/blog" className="inline-block font-semibold text-blue-700 hover:underline">{ar ? <InterfaceText id="realestate.BlogPage.kf9mpyv" source="العودة إلى المدونة" /> : <InterfaceText id="realestate.BlogPage.k11o4pv0" source="Back to the blog" />}</a>}
    {status === 'loading' && <p role="status">{ar ? <InterfaceText id="realestate.BlogPage.k1mhc050" source="جارٍ تحميل المقالات…" /> : <InterfaceText id="realestate.BlogPage.k1qdushk" source="Loading articles…" />}</p>}
    {status === 'error' && <p role="alert">{ar ? <InterfaceText id="realestate.BlogPage.kmhvl4m" source="تعذّر تحميل المقالات. أعد تحميل الصفحة للمحاولة مرة أخرى." /> : <InterfaceText id="realestate.BlogPage.ksvhxkd" source="Could not load articles. Reload the page to try again." />}</p>}
    {articleId ? article ? <article className="mx-auto max-w-4xl space-y-5">
      <Badge variant="primary"><LocalizedValue value={label(article)} /></Badge>
      <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl"><LocalizedValue value={getLocalizedText(article.title, language)} /></h1>
      <p className="text-sm text-slate-600"><LocalizedValue value={date(article)} /></p>
      <ManagedImg copyScope="realestate.BlogPage" src={article.image || propertyPlaceholderImage} alt={getLocalizedText(article.title, language)} className="aspect-video w-full rounded-2xl object-cover" />
      <p className="text-lg text-slate-700"><LocalizedValue value={getLocalizedText(article.excerpt, language)} /></p>
      <SafeRichContent content={getLocalizedText(article.content, language)} dir={ar ? 'rtl' : 'ltr'} />
    </article> : status === 'ready' && <h1>{ar ? <InterfaceText id="realestate.BlogPage.kyewd5c" source="المقال غير متاح" /> : <InterfaceText id="realestate.BlogPage.k14so4sv" source="Article unavailable" />}</h1> : <>
      <div className="max-w-3xl space-y-3">
        <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl"><LocalizedValue value={copy.pageTitle} /></h1>
        <p className="text-sm text-slate-600 sm:text-base"><LocalizedValue value={copy.pageSubtitle} /></p>
      </div>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => <button key={category.key} type="button" onClick={() => setActiveCategory(category.key)}
          aria-pressed={activeCategory === category.key}
          className={`rounded-xl border px-4 py-2 text-sm font-semibold ${activeCategory === category.key ? 'bg-blue-700 text-white' : 'bg-white text-slate-700'}`}>
          <LocalizedValue value={category.label[language]} />
        </button>)}
      </div>
      {status === 'ready' && !visible.length && <p role="status">{ar ? <InterfaceText id="realestate.BlogPage.k1jpf9qh" source="لا توجد مقالات منشورة في هذا التصنيف." /> : <InterfaceText id="realestate.BlogPage.k50ge4g" source="No published articles in this category." />}</p>}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((post) => <article key={post.id} className="flex flex-col overflow-hidden rounded-3xl border bg-white shadow-sm">
          <ManagedA copyScope="realestate.BlogPage" href={href(post)} aria-label={getLocalizedText(post.title, language)} className="relative block">
            <ManagedImg copyScope="realestate.BlogPage" src={post.image || propertyPlaceholderImage} alt="" className="aspect-16/10 w-full object-cover" loading="lazy" />
            <div className="absolute start-3 top-3"><Badge variant="gradient"><LocalizedValue value={label(post)} /></Badge></div>
          </ManagedA>
          <div className="flex grow flex-col gap-3 p-6">
            <p className="text-xs text-slate-600"><LocalizedValue value={date(post)} /></p>
            <h2 className="text-lg font-bold"><a href={href(post)} className="hover:text-blue-700"><LocalizedValue value={getLocalizedText(post.title, language)} /></a></h2>
            <p className="grow text-sm text-slate-600"><LocalizedValue value={getLocalizedText(post.excerpt, language)} /></p>
            <a href={href(post)} className="inline-flex items-center gap-1 font-semibold text-blue-700 hover:underline">
              <LocalizedValue value={copy.readArticle} /><ArrowIcon className="size-4" aria-hidden="true" />
            </a>
          </div>
        </article>)}
      </div>
    </>}
  </div>;
}
