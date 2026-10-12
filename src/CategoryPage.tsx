import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase, type ArticleWithRelations, type Category } from '@/lib/supabase';
import ArticleCard from '@/components/ArticleCard';
import { Loader2, ChevronLeft } from 'lucide-react';

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [articles, setArticles] = useState<ArticleWithRelations[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      const { data: catData } = await supabase
        .from('categories')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      setCategory(catData as Category | null);

      if (catData) {
        const { data } = await supabase
          .from('articles')
          .select('*, category:categories(*), source:sources(*), editor:editors(*)')
          .eq('category_id', catData.id)
          .order('published_at', { ascending: false });
        setArticles((data as ArticleWithRelations[]) || []);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-lg text-secondary-c">لم يتم العثور على القسم</p>
        <Link to="/" className="px-4 py-2 bg-accent text-white rounded-lg hover-accent transition-colors">
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  const [hero, ...rest] = articles;

  return (
    <div className="fade-in">
      {/* Category header */}
      <div className="bg-secondary border-b border-default">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Link to="/" className="flex items-center gap-1 text-sm text-muted-c hover:text-accent transition-colors mb-3">
            <ChevronLeft className="w-4 h-4" />
            الرئيسية
          </Link>
          <h1 className="text-3xl lg:text-4xl font-900 text-primary-c mb-2">{category.name}</h1>
          <p className="text-sm text-muted-c">{articles.length} مقال في هذا القسم</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-secondary-c">لا توجد مقالات في هذا القسم حالياً</p>
          </div>
        ) : (
          <>
            {/* Hero + sidebar */}
            {hero && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                <div className="lg:col-span-2">
                  <ArticleCard article={hero} variant="hero" />
                </div>
                <div className="space-y-4">
                  {rest.slice(0, 4).map((a) => (
                    <ArticleCard key={a.id} article={a} variant="compact" />
                  ))}
                </div>
              </div>
            )}

            {/* Grid */}
            {rest.length > 4 && (
              <>
                <div className="flex items-center gap-2 mb-5">
                  <div className="w-1 h-7 bg-accent rounded" />
                  <h2 className="text-xl font-800 text-primary-c">المزيد من {category.name}</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {rest.slice(4).map((a) => (
                    <ArticleCard key={a.id} article={a} variant="default" />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
