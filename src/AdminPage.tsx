import { useEffect, useState } from 'react';
import { supabase, type ArticleWithRelations, type Category, type Editor, type Source } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';
import {
  LayoutDashboard, FileText, Users, Radio, TrendingUp,
  Plus, Edit3, Trash2, X, Loader2, Eye, Search, ExternalLink,
} from 'lucide-react';

type Tab = 'overview' | 'articles' | 'editors' | 'sources';

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('overview');
  const [articles, setArticles] = useState<ArticleWithRelations[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editors, setEditors] = useState<Editor[]>([]);
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArticleModal, setShowArticleModal] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleWithRelations | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const [arts, cats, eds, srcs] = await Promise.all([
        supabase.from('articles').select('*, category:categories(*), source:sources(*), editor:editors(*)').order('published_at', { ascending: false }),
        supabase.from('categories').select('*').order('name'),
        supabase.from('editors').select('*').order('name'),
        supabase.from('sources').select('*').order('name'),
      ]);
      setArticles((arts.data as ArticleWithRelations[]) || []);
      setCategories((cats.data as Category[]) || []);
      setEditors((eds.data as Editor[]) || []);
      setSources((srcs.data as Source[]) || []);
      setLoading(false);
    })();
  }, []);

  const refreshArticles = async () => {
    const { data } = await supabase
      .from('articles')
      .select('*, category:categories(*), source:sources(*), editor:editors(*)')
      .order('published_at', { ascending: false });
    setArticles((data as ArticleWithRelations[]) || []);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من حذف هذا المقال؟')) return;
    await supabase.from('articles').delete().eq('id', id);
    refreshArticles();
  };

  const toggleLive = async (article: ArticleWithRelations) => {
    await supabase.from('articles').update({ is_live: !article.is_live }).eq('id', article.id);
    refreshArticles();
  };

  const filteredArticles = articles.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalViews = articles.reduce((sum, a) => sum + (a.views || 0), 0);
  const liveCount = articles.filter((a) => a.is_live).length;
  const featuredCount = articles.filter((a) => a.is_featured).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-900 text-primary-c">لوحة التحكم</h1>
          <p className="text-sm text-muted-c mt-1">إدارة المحتوى والمحررين ومصادر الأخبار</p>
        </div>
        <button
          onClick={() => { setEditingArticle(null); setShowArticleModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-700 rounded-lg hover-accent transition-colors"
        >
          <Plus className="w-4 h-4" />
          مقال جديد
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 mb-6 bg-secondary p-1 rounded-lg overflow-x-auto">
        {[
          { id: 'overview' as Tab, label: 'نظرة عامة', icon: LayoutDashboard },
          { id: 'articles' as Tab, label: 'المقالات', icon: FileText },
          { id: 'editors' as Tab, label: 'المحررون', icon: Users },
          { id: 'sources' as Tab, label: 'المصادر', icon: Radio },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-600 rounded-md transition-colors whitespace-nowrap ${
              tab === t.id ? 'bg-accent text-white' : 'text-secondary-c hover:bg-tertiary'
            }`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div className="space-y-6 fade-in">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'إجمالي المقالات', value: articles.length, icon: FileText, color: 'bg-blue-500/10 text-blue-500' },
              { label: 'إجمالي المشاهدات', value: totalViews.toLocaleString(), icon: Eye, color: 'bg-green-500/10 text-green-500' },
              { label: 'مقالات مباشرة', value: liveCount, icon: Radio, color: 'bg-red-500/10 text-red-500' },
              { label: 'مقالات مميزة', value: featuredCount, icon: TrendingUp, color: 'bg-amber-500/10 text-amber-500' },
            ].map((stat) => (
              <div key={stat.label} className="bg-card border border-default rounded-xl p-5">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-900 text-primary-c">{stat.value}</p>
                <p className="text-xs text-muted-c mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          {/* Category distribution */}
          <div className="bg-card border border-default rounded-xl p-5">
            <h3 className="text-sm font-800 text-primary-c mb-4">توزيع المقالات حسب القسم</h3>
            <div className="space-y-3">
              {categories.map((cat) => {
                const count = articles.filter((a) => a.category_id === cat.id).length;
                const pct = articles.length > 0 ? (count / articles.length) * 100 : 0;
                return (
                  <div key={cat.id} className="flex items-center gap-3">
                    <span className="text-sm text-secondary-c w-20 flex-shrink-0">{cat.name}</span>
                    <div className="flex-1 h-2 bg-tertiary rounded-full overflow-hidden">
                      <div className="h-full bg-accent rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-sm font-700 text-primary-c w-8 text-left">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent articles */}
          <div className="bg-card border border-default rounded-xl p-5">
            <h3 className="text-sm font-800 text-primary-c mb-4">أحدث المقالات</h3>
            <div className="space-y-2">
              {articles.slice(0, 5).map((a) => (
                <div key={a.id} className="flex items-center justify-between py-2 border-b border-default last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-600 text-primary-c truncate">{a.title}</p>
                    <p className="text-xs text-muted-c">{a.category?.name} • {formatRelativeTime(a.published_at)}</p>
                  </div>
                  <span className="text-xs text-muted-c flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" />
                    {a.views}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Articles tab */}
      {tab === 'articles' && (
        <div className="fade-in">
          <div className="flex items-center gap-2 mb-4 bg-card border border-default rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-muted-c" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن مقال..."
              className="flex-1 bg-transparent text-sm text-primary-c outline-none placeholder:text-muted-c"
            />
          </div>

          <div className="bg-card border border-default rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-default bg-secondary">
                  <th className="text-right p-3 text-xs font-700 text-muted-c">العنوان</th>
                  <th className="text-right p-3 text-xs font-700 text-muted-c hidden sm:table-cell">القسم</th>
                  <th className="text-right p-3 text-xs font-700 text-muted-c hidden md:table-cell">المشاهدات</th>
                  <th className="text-right p-3 text-xs font-700 text-muted-c hidden lg:table-cell">التاريخ</th>
                  <th className="text-center p-3 text-xs font-700 text-muted-c">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((a) => (
                  <tr key={a.id} className="border-b border-default last:border-0 hover:bg-secondary transition-colors">
                    <td className="p-3">
                      <p className="text-sm font-600 text-primary-c line-clamp-1 max-w-xs">{a.title}</p>
                      {a.is_live && (
                        <span className="inline-flex items-center gap-1 text-xs text-accent font-600 mt-0.5">
                          <Radio className="w-3 h-3 live-dot" /> مباشر
                        </span>
                      )}
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      <span className="text-xs text-secondary-c">{a.category?.name || '—'}</span>
                    </td>
                    <td className="p-3 hidden md:table-cell">
                      <span className="text-xs text-secondary-c flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />{a.views}
                      </span>
                    </td>
                    <td className="p-3 hidden lg:table-cell">
                      <span className="text-xs text-muted-c">{formatRelativeTime(a.published_at)}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => toggleLive(a)}
                          className={`p-1.5 rounded-md transition-colors ${a.is_live ? 'bg-accent/10 text-accent' : 'text-muted-c hover:bg-tertiary'}`}
                          title="بث مباشر"
                        >
                          <Radio className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => { setEditingArticle(a); setShowArticleModal(true); }}
                          className="p-1.5 text-muted-c hover:text-accent hover:bg-tertiary rounded-md transition-colors"
                          title="تعديل"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          className="p-1.5 text-muted-c hover:text-red-500 hover:bg-tertiary rounded-md transition-colors"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Editors tab */}
      {tab === 'editors' && (
        <div className="fade-in grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {editors.map((ed) => (
            <div key={ed.id} className="bg-card border border-default rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-lg font-800 text-accent">{ed.name.charAt(0)}</span>
                </div>
                <div>
                  <h4 className="font-700 text-primary-c text-sm">{ed.name}</h4>
                  <p className="text-xs text-muted-c">{ed.role}</p>
                </div>
              </div>
              {ed.bio && <p className="text-xs text-secondary-c leading-relaxed">{ed.bio}</p>}
              <p className="text-xs text-muted-c mt-3">
                {articles.filter((a) => a.editor_id === ed.id).length} مقال
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Sources tab */}
      {tab === 'sources' && (
        <div className="fade-in space-y-3">
          {sources.map((src) => (
            <div key={src.id} className="bg-card border border-default rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-tertiary flex items-center justify-center">
                  <Radio className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h4 className="font-700 text-primary-c text-sm">{src.name}</h4>
                  <p className="text-xs text-muted-c">
                    {articles.filter((a) => a.source_id === src.id).length} مقال من هذا المصدر
                  </p>
                </div>
              </div>
              {src.url && (
                <a href={src.url} target="_blank" rel="noopener noreferrer" className="text-muted-c hover:text-accent transition-colors">
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Article modal */}
      {showArticleModal && (
        <ArticleModal
          article={editingArticle}
          categories={categories}
          editors={editors}
          sources={sources}
          onClose={() => setShowArticleModal(false)}
          onSaved={() => { refreshArticles(); setShowArticleModal(false); }}
        />
      )}
    </div>
  );
}

function ArticleModal({
  article,
  categories,
  editors,
  sources,
  onClose,
  onSaved,
}: {
  article: ArticleWithRelations | null;
  categories: Category[];
  editors: Editor[];
  sources: Source[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title: article?.title || '',
    excerpt: article?.excerpt || '',
    content: article?.content || '',
    image_url: article?.image_url || '',
    image_caption: article?.image_caption || '',
    category_id: article?.category_id || '',
    editor_id: article?.editor_id || '',
    source_id: article?.source_id || '',
    is_featured: article?.is_featured || false,
    is_live: article?.is_live || false,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const payload = {
      title: form.title,
      excerpt: form.excerpt,
      content: form.content,
      image_url: form.image_url || null,
      image_caption: form.image_caption || null,
      category_id: form.category_id || null,
      editor_id: form.editor_id || null,
      source_id: form.source_id || null,
      is_featured: form.is_featured,
      is_live: form.is_live,
    };

    if (article) {
      await supabase.from('articles').update(payload).eq('id', article.id);
    } else {
      await supabase.from('articles').insert(payload);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 fade-in" onClick={onClose}>
      <div
        className="bg-card rounded-2xl border border-default w-full max-w-2xl max-h-[90vh] overflow-y-auto slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-default sticky top-0 bg-card z-10">
          <h3 className="font-800 text-primary-c">{article ? 'تعديل مقال' : 'مقال جديد'}</h3>
          <button onClick={onClose} className="p-1.5 hover:bg-tertiary rounded-lg transition-colors">
            <X className="w-5 h-5 text-secondary-c" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <Field label="العنوان">
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="input-base"
            />
          </Field>

          <Field label="الملخص التعريفي">
            <textarea
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
              rows={2}
              className="input-base resize-none"
            />
          </Field>

          <Field label="المحتوى الكامل">
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={8}
              className="input-base resize-none"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="رابط الصورة">
              <input
                type="text"
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="input-base"
                placeholder="https://..."
              />
            </Field>
            <Field label="وصف الصورة">
              <input
                type="text"
                value={form.image_caption}
                onChange={(e) => setForm({ ...form, image_caption: e.target.value })}
                className="input-base"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="القسم">
              <select value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="input-base">
                <option value="">—</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </Field>
            <Field label="المحرر">
              <select value={form.editor_id} onChange={(e) => setForm({ ...form, editor_id: e.target.value })} className="input-base">
                <option value="">—</option>
                {editors.map((ed) => (
                  <option key={ed.id} value={ed.id}>{ed.name}</option>
                ))}
              </select>
            </Field>
            <Field label="المصدر">
              <select value={form.source_id} onChange={(e) => setForm({ ...form, source_id: e.target.value })} className="input-base">
                <option value="">—</option>
                {sources.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => setForm({ ...form, is_featured: e.target.checked })}
                className="w-4 h-4 accent-red-600"
              />
              <span className="text-sm text-secondary-c">مقال مميز</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_live}
                onChange={(e) => setForm({ ...form, is_live: e.target.checked })}
                className="w-4 h-4 accent-red-600"
              />
              <span className="text-sm text-secondary-c">بث مباشر</span>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 p-4 border-t border-default sticky bottom-0 bg-card">
          <button onClick={onClose} className="px-4 py-2 text-sm font-600 text-secondary-c bg-tertiary rounded-lg hover:bg-default transition-colors">
            إلغاء
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !form.title || !form.excerpt || !form.content}
            className="flex items-center gap-2 px-4 py-2 text-sm font-700 bg-accent text-white rounded-lg hover-accent transition-colors disabled:opacity-40"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {article ? 'حفظ التغييرات' : 'نشر المقال'}
          </button>
        </div>
      </div>

      <style>{`
        .input-base {
          width: 100%;
          background-color: var(--bg-tertiary);
          color: var(--text-primary);
          border: 1px solid var(--border);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
        }
        .input-base:focus {
          border-color: var(--accent);
          box-shadow: 0 0 0 2px rgba(185, 28, 28, 0.15);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-700 text-secondary-c mb-1.5">{label}</label>
      {children}
    </div>
  );
}
