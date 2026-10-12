import { useState, useRef, useEffect } from 'react';
import { Bot, X, Send, Sparkles, Loader2 } from 'lucide-react';
import { supabase, type ArticleWithRelations } from '@/lib/supabase';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  articleId?: string;
};

const SUGGESTIONS = [
  'ما أبرز الأخبار اليوم؟',
  'حدثني عن آخر الأخبار الاقتصادية',
  'ما جديد التكنولوجيا والذكاء الاصطناعي؟',
  'ما هي أخبار الرياضة؟',
];

export default function AIAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'مرحباً! أنا مساعدك الذكي للأخبار. يمكنك سؤالي عن أي خبر، خلفية حدث، أو أحدث المستجدات. كيف أساعدك اليوم؟',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState<ArticleWithRelations[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('articles')
        .select('*, category:categories(*), source:sources(*)')
        .order('published_at', { ascending: false })
        .limit(20);
      setArticles((data as ArticleWithRelations[]) || []);
    })();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const generateResponse = (query: string): Message => {
    const lower = query.toLowerCase();
    let matched: ArticleWithRelations[] = [];

    if (lower.includes('اقتصاد') || lower.includes('مال') || lower.includes('سوق') || lower.includes('ذهب') || lower.includes('أسعار')) {
      matched = articles.filter((a) => a.category?.slug === 'economy');
    } else if (lower.includes('تكنولوجيا') || lower.includes('تقنية') || lower.includes('ذكاء') || lower.includes('اصطناعي')) {
      matched = articles.filter((a) => a.category?.slug === 'technology');
    } else if (lower.includes('رياضة') || lower.includes('كرة') || lower.includes('بطولة')) {
      matched = articles.filter((a) => a.category?.slug === 'sports');
    } else if (lower.includes('صحة') || lower.includes('طب') || lower.includes('مرض')) {
      matched = articles.filter((a) => a.category?.slug === 'health');
    } else if (lower.includes('ثقافة') || lower.includes('فن') || lower.includes('متحف')) {
      matched = articles.filter((a) => a.category?.slug === 'culture');
    } else if (lower.includes('تحقيق') || lower.includes('استقصاء')) {
      matched = articles.filter((a) => a.category?.slug === 'investigations');
    } else if (lower.includes('برنامج') || lower.includes('وثائقي') || lower.includes('حوار')) {
      matched = articles.filter((a) => a.category?.slug === 'programs');
    } else if (lower.includes('أخبار') || lower.includes('خبر') || lower.includes('جديد') || lower.includes('اليوم') || lower.includes('أحدث') || lower.includes('آخر')) {
      matched = articles;
    } else {
      matched = articles.filter((a) =>
        a.title.includes(query) || a.excerpt.includes(query) || a.content.includes(query)
      );
    }

    if (matched.length === 0) {
      return {
        role: 'assistant',
        content: 'لم أجد أخباراً مطابقة لاستفسارك حالياً. جرب صياغة أخرى أو اسأل عن قسم محدد مثل: أخبار، اقتصاد، تكنولوجيا، رياضة، صحة، أو ثقافة.',
      };
    }

    const top = matched.slice(0, 3);
    let response = '';
    if (lower.includes('أبرز') || lower.includes('حدثني') || lower.includes('ما') || lower.includes('جديد') || lower.includes('أحدث') || lower.includes('آخر')) {
      response = `إليك أبرز ما وجدته:\n\n`;
    } else {
      response = `بناءً على سؤالك، إليك ما توصلت إليه:\n\n`;
    }

    top.forEach((a, i) => {
      response += `${i + 1}. **${a.title}**\n${a.excerpt}\n`;
      if (i < top.length - 1) response += '\n';
    });

    return { role: 'assistant', content: response };
  };

  const handleSend = (text?: string) => {
    const query = (text || input).trim();
    if (!query || loading) return;

    setMessages((prev) => [...prev, { role: 'user', content: query }]);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const response = generateResponse(query);
      setMessages((prev) => [...prev, response]);
      setLoading(false);
    }, 800);
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 left-6 z-50 flex items-center gap-2 px-4 py-3 bg-accent text-white rounded-full shadow-xl hover-accent transition-all duration-300 group"
        aria-label="المساعد الذكي"
      >
        <Bot className="w-5 h-5" />
        <span className="text-sm font-700 hidden sm:inline">المساعد الذكي</span>
        <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-50 w-[calc(100vw-3rem)] sm:w-96 bg-card border border-default rounded-2xl shadow-2xl flex flex-col slide-up" style={{ maxHeight: '70vh' }}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-default">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-800 text-primary-c">المساعد الذكي للأخبار</h3>
            <span className="text-xs text-muted-c flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full" /> متصل
            </span>
          </div>
        </div>
        <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-tertiary rounded-lg transition-colors">
          <X className="w-5 h-5 text-secondary-c" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '200px' }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}>
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                msg.role === 'user'
                  ? 'bg-accent text-white rounded-tr-sm'
                  : 'bg-tertiary text-primary-c rounded-tl-sm'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-end">
            <div className="bg-tertiary rounded-2xl rounded-tl-sm px-3.5 py-2.5">
              <Loader2 className="w-4 h-4 text-accent animate-spin" />
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="text-xs px-2.5 py-1.5 bg-tertiary text-secondary-c rounded-full hover:bg-accent hover:text-white transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-3 border-t border-default">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="اسأل عن أي خبر..."
            className="flex-1 bg-tertiary text-sm text-primary-c rounded-lg px-3 py-2 outline-none placeholder:text-muted-c focus:ring-2 ring-accent/30"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="w-9 h-9 flex items-center justify-center bg-accent text-white rounded-lg hover-accent transition-colors disabled:opacity-40"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
