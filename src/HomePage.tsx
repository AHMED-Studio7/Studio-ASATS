import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase, type ArticleWithRelations } from '@/lib/supabase';
import ArticleCard from '@/components/ArticleCard';
import { TrendingUp, Loader2 } from 'lucide-react';

export default function HomePage() {
  const [articles, setArticles] = useState<ArticleWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('articles')
        .select('*, category:categories(*), source:sources(*), editor:editors(*)')
        .order('published_at', { ascending: false });
      setArticles((data as ArticleWithRelations[]) || []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  const heroArticle = articles.find((a) => a.is_featured) || articles[0];
  const featuredArticles = articles.filter((a) => a.id !== heroArticle?.id && a.is_featured).slice(0, 2);
  const sideArticles = articles.filter((a) => a.id !== heroArticle?.id && !featuredArticles.find((f) => f.id === a.id)).slice(0, 5);
  const remainingArticles = articles.filter(
    (a) => a.id !== heroArticle?.id && !featuredArticles.find((f) => f.id === a.id) && !sideArticles.find((s) => s.id === a.id)
  );
  const mostViewed = [...articles].sort((a, b) => b.views - a.views).slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
      {/* Hero section */}
      {heroArticle && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2">
            <ArticleCard article={heroArticle} variant="hero" />
          </div>
          <div className="flex flex-col gap-4">
            {featuredArticles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="featured" />
            ))}
            {featuredArticles.length < 2 && sideArticles.slice(0, 2 - featuredArticles.length).map((article) => (
              <ArticleCard key={article.id} article={article} variant="featured" />
            ))}
          </div>
        </div>
      )}

      {/* Main content + sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main column */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-1 h-7 bg-accent rounded" />
            <h2 className="text-xl font-800 text-primary-c">أحدث الأخبار</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {remainingArticles.slice(0, 6).map((article) => (
              <ArticleCard key={article.id} article={article} variant="default" />
            ))}
          </div>

          {remainingArticles.length > 6 && (
            <>
              <div className="flex items-center gap-2 mb-5 mt-10">
                <div className="w-1 h-7 bg-accent rounded" />
                <h2 className="text-xl font-800 text-primary-c">تقارير ومتابعات</h2>
              </div>
              <div className="bg-card rounded-xl border border-default p-5">
                {remainingArticles.slice(6).map((article) => (
                  <ArticleCard key={article.id} article={article} variant="list" />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Most viewed */}
          <div className="bg-card rounded-xl border border-default p-5">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-accent" />
              <h3 className="text-lg font-800 text-primary-c">الأكثر قراءة</h3>
            </div>
            <div>
              {mostViewed.map((article, idx) => (
                <Link
                  key={article.id}
                  to={`/article/${article.id}`}
                  className="group flex gap-3 items-start py-3 border-b border-default last:border-0"
                >
                  <span className="text-3xl font-900 text-accent/30 leading-none flex-shrink-0 w-8">
                    {idx + 1}
                  </span>
                  <div>
                    <h4 className="text-sm font-600 text-primary-c leading-snug line-clamp-2 group-hover:text-accent transition-colors">
                      {article.title}
                    </h4>
                    <span className="text-xs text-muted-c mt-1 block">
                      {article.views} مشاهدة
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Latest sidebar */}
          <div className="bg-card rounded-xl border border-default p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1 h-6 bg-accent rounded" />
              <h3 className="text-lg font-800 text-primary-c">آخر اللحظات</h3>
            </div>
            {sideArticles.map((article) => (
              <ArticleCard key={article.id} article={article} variant="compact" />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
