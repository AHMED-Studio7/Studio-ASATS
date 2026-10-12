import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase, type ArticleWithRelations } from '@/lib/supabase';
import { formatFullDate, formatTime, getReadingTime, formatRelativeTime } from '@/lib/utils';
import ArticleCard from '@/components/ArticleCard';
import {
  Clock, Eye, Share2, Printer, ChevronLeft, Radio,
  User, Tag, Loader2, Sparkles, ArrowRight,
} from 'lucide-react';

export default function ArticlePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<ArticleWithRelations | null>(null);
  const [related, setRelated] = useState<ArticleWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizing, setSummarizing] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('articles')
        .select('*, category:categories(*), source:sources(*), editor:editors(*)')
        .eq('id', id)
        .maybeSingle();

      if (data) {
        setArticle(data as ArticleWithRelations);
        supabase.from('articles').update({ views: (data.views || 0) + 1 }).eq('id', id);

        if ((data as ArticleWithRelations).category_id) {
          const { data: relData } = await supabase
            .from('articles')
            .select('*, category:categories(*), source:sources(*), editor:editors(*)')
            .eq('category_id', data.category_id)
            .neq('id', id)
            .order('published_at', { ascending: false })
            .limit(3);
          setRelated((relData as ArticleWithRelations[]) || []);
        }
      }
      setLoading(false);
    })();
  }, [id]);

  const handleSummarize = () => {
    if (!article) return;
    setSummarizing(true);
    setSummary(null);
    setTimeout(() => {
      const sentences = article.content.split(/[.!?؟]/).filter((s) => s.trim().length > 20);
      const summaryText = sentences.slice(0, 4).map((s) => s.trim()).join('. ') + '.';
      setSummary(summaryText);
      setSummarizing(false);
    }, 1200);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: article?.title, url: window.location.href });
      } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-lg text-secondary-c">لم يتم العثور على المقال</p>
        <Link to="/" className="px-4 py-2 bg-accent text-white rounded-lg hover-accent transition-colors">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const paragraphs = article.content.split('\n\n').filter((p) => p.trim());

  return (
    <article className="fade-in">
      {/* Breadcrumb */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-muted-c hover:text-accent transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          رجوع
        </button>
        {article.category && (
          <Link
            to={`/category/${article.category.slug}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent/10 text-accent text-sm font-700 rounded-md mb-4 hover:bg-accent hover:text-white transition-colors"
          >
            <Tag className="w-3.5 h-3.5" />
            {article.category.name}
          </Link>
        )}
      </div>

      {/* Title + excerpt */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {article.is_live && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent text-white text-xs font-700 rounded mb-4">
            <Radio className="w-3 h-3 live-dot" /> مباشر
          </span>
        )}
        <h1 className="text-3xl lg:text-4xl font-900 text-primary-c leading-tight mb-4">
          {article.title}
        </h1>
        <p className="lead-paragraph mb-6">{article.excerpt}</p>

        {/* Meta bar */}
        <div className="flex flex-wrap items-center gap-4 pb-4 mb-6 border-b border-default text-sm text-muted-c">
          {article.editor && (
            <span className="flex items-center gap-1.5">
              <User className="w-4 h-4" />
              <span className="text-secondary-c font-600">{article.editor.name}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            {formatFullDate(article.published_at)} - {formatTime(article.published_at)}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="w-4 h-4" />
            {article.views} مشاهدة
          </span>
          <span className="text-accent font-600">{getReadingTime(article.content)}</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={handleSummarize}
            className="flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent text-sm font-700 rounded-lg hover:bg-accent hover:text-white transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            تلخيص بالذكاء الاصطناعي
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-2 bg-tertiary text-secondary-c text-sm font-600 rounded-lg hover:bg-accent hover:text-white transition-colors"
          >
            <Share2 className="w-4 h-4" />
            مشاركة
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3 py-2 bg-tertiary text-secondary-c text-sm font-600 rounded-lg hover:bg-accent hover:text-white transition-colors"
          >
            <Printer className="w-4 h-4" />
            طباعة
          </button>
        </div>
      </div>

      {/* AI Summary box */}
      {summarizing && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="flex items-center gap-3 p-4 bg-accent/5 border border-accent/20 rounded-lg">
            <Sparkles className="w-5 h-5 text-accent animate-pulse" />
            <span className="text-sm text-secondary-c">جاري تلخيص المقال...</span>
          </div>
        </div>
      )}
      {summary && !summarizing && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 slide-up">
          <div className="p-5 bg-accent/5 border-r-4 border-accent rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-accent" />
              <h3 className="text-sm font-800 text-accent">ملخص الذكاء الاصطناعي</h3>
            </div>
            <p className="text-sm text-primary-c leading-relaxed">{summary}</p>
          </div>
        </div>
      )}

      {/* Hero image */}
      {article.image_url && (
        <figure className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="rounded-xl overflow-hidden">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full max-h-[520px] object-cover"
            />
          </div>
          {article.image_caption && (
            <figcaption className="text-sm text-muted-c mt-3 text-center leading-relaxed">
              {article.image_caption}
            </figcaption>
          )}
        </figure>
      )}

      {/* Article body */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="article-body">
          {paragraphs.map((para, idx) => (
            <p key={idx}>{para.trim()}</p>
          ))}
        </div>

        {/* Source attribution */}
        {article.source && (
          <div className="mt-8 p-4 bg-tertiary rounded-lg flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
              <Tag className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-c">المصدر الأصلي</p>
              <p className="text-sm font-700 text-primary-c">{article.source.name}</p>
            </div>
          </div>
        )}

        {/* Editor bio */}
        {article.editor && (
          <div className="mt-6 p-5 bg-card border border-default rounded-xl flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-800 text-accent">
                {article.editor.name.charAt(0)}
              </span>
            </div>
            <div>
              <p className="font-700 text-primary-c">{article.editor.name}</p>
              <p className="text-sm text-muted-c">{article.editor.role}</p>
              {article.editor.bio && (
                <p className="text-sm text-secondary-c mt-1 leading-relaxed">{article.editor.bio}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-7 bg-accent rounded" />
            <h2 className="text-xl font-800 text-primary-c">أخبار ذات صلة</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {related.map((rel) => (
              <ArticleCard key={rel.id} article={rel} variant="featured" />
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
