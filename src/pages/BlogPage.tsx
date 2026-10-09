import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  User,
  ArrowRight,
  ArrowLeft,
  Search,
} from 'lucide-react';
import { Language, PageId, BlogPost } from '../types';
import { translations } from '../lib/translations';
import { useData } from '../context/DataContext';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';

interface BlogPageProps {
  onNavigate: (page: PageId) => void;
  language: Language;
}

export function BlogPage({ onNavigate, language }: BlogPageProps) {
  const t = translations[language];
  const { blogPosts } = useData();
  const ArrowIcon = language === 'ar' ? ArrowLeft : ArrowRight;
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  // Show published posts only on public site
  const livePosts = blogPosts.filter((p) => (p.status || 'published') === 'published');

  const filteredPosts = livePosts.filter((post) => {
    if (activeCategory === 'All' || activeCategory === 'الكل') return true;
    return post.category.en.includes(activeCategory) || post.category.ar.includes(activeCategory);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="space-y-3 max-w-3xl">
        <Badge variant="primary">{language === 'en' ? 'Market Intelligence' : 'تقارير وتحليلات السوق'}</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-display-serif tracking-tight">
          {t.blog.pageTitle}
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          {t.blog.pageSubtitle}
        </p>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {t.blog.categories.map((cat, idx) => (
          <button
            key={idx}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeCategory === cat
                ? 'bg-hard-gradient text-white shadow-xs'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPosts.map((post) => (
          <article
            key={post.id}
            onClick={() => setSelectedPost(post)}
            className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group cursor-pointer"
          >
            <div className="space-y-4">
              <div className="relative aspect-16/10 overflow-hidden bg-slate-900">
                <img
                  src={post.image}
                  alt={post.title[language]}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 start-3">
                  <Badge variant="gradient">{post.category[language]}</Badge>
                </div>
              </div>

              <div className="px-6 space-y-2">
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span>{post.date}</span>
                  <span>•</span>
                  <span>{post.readTime[language]}</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 font-display-serif group-hover:text-blue-600 transition-colors line-clamp-2">
                  {post.title[language]}
                </h3>

                <p className="text-xs sm:text-sm text-slate-500 line-clamp-3 leading-relaxed">
                  {post.excerpt[language]}
                </p>
              </div>
            </div>

            <div className="p-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-blue-600">
              <span>{post.author[language]}</span>
              <span className="flex items-center gap-1 group-hover:gap-1.5 transition-all">
                {t.blog.readArticle} <ArrowIcon className="w-3.5 h-3.5" />
              </span>
            </div>
          </article>
        ))}
      </div>

      {/* Article Detail Modal */}
      {selectedPost && (
        <Modal
          isOpen={!!selectedPost}
          onClose={() => setSelectedPost(null)}
          title={selectedPost.title[language]}
          subtitle={`${selectedPost.author[language]} • ${selectedPost.date}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="relative aspect-16/9 rounded-2xl overflow-hidden bg-slate-900">
              <img
                src={selectedPost.image}
                alt={selectedPost.title[language]}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {selectedPost.excerpt[language]}
            </p>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {selectedPost.content[language]}
            </p>
            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedPost(null)}>
                {language === 'en' ? 'Close' : 'إغلاق'}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
