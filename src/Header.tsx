import { Newspaper, Moon, Sun, Search, Menu, X, Radio } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { Link, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'أخبار', slug: 'news' },
  { label: 'اقتصاد', slug: 'economy' },
  { label: 'تكنولوجيا', slug: 'technology' },
  { label: 'تحقيقات', slug: 'investigations' },
  { label: 'برامج', slug: 'programs' },
  { label: 'رياضة', slug: 'sports' },
  { label: 'صحة', slug: 'health' },
  { label: 'ثقافة', slug: 'culture' },
];

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  return (
    <>
      {/* Live ticker bar */}
      <div className="bg-ticker text-ticker overflow-hidden">
        <div className="flex items-center h-9">
          <div className="flex items-center gap-2 px-4 h-full bg-accent flex-shrink-0 z-10">
            <Radio className="w-4 h-4 text-white live-dot" />
            <span className="text-white text-xs font-bold whitespace-nowrap">البث المباشر</span>
          </div>
          <div className="overflow-hidden flex-1">
            <div className="flex ticker-animation whitespace-nowrap">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex items-center gap-8 px-6 text-xs">
                  <span className="text-ticker-text">قمة عربية طارئة غداً في القاهرة لبحث الأزمة الدبلوماسية</span>
                  <span className="text-red-500">●</span>
                  <span className="text-ticker-text">الأسواق العالمية تتراجع وسط مخاوف من ركود اقتصادي</span>
                  <span className="text-red-500">●</span>
                  <span className="text-ticker-text">اختراق علمي: ذكاء اصطناعي يكتشف أمراضاً نادرة بدقة قياسية</span>
                  <span className="text-red-500">●</span>
                  <span className="text-ticker-text">الذهب يسجل مستوى قياسياً جديداً وسط تراجع الدولار</span>
                  <span className="text-red-500">●</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className={`bg-header sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'shadow-lg' : ''}`}
        style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 -mr-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="القائمة"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center transition-transform group-hover:scale-105">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl lg:text-2xl font-800 tracking-tight text-primary-c">المشهد</span>
                <span className="text-[10px] text-muted-c -mt-1">إخباري عالمي</span>
              </div>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {NAV_ITEMS.map((item) => {
                const isActive = location.pathname === `/category/${item.slug}`;
                return (
                  <Link
                    key={item.slug}
                    to={`/category/${item.slug}`}
                    className={`px-3 py-2 text-sm font-600 rounded-md transition-colors relative group ${
                      isActive ? 'text-accent' : 'text-primary-c hover:text-accent'
                    }`}
                  >
                    {item.label}
                    <span className={`absolute bottom-0 right-1/2 translate-x-1/2 h-0.5 bg-accent transition-all duration-300 ${
                      isActive ? 'w-6' : 'w-0 group-hover:w-6'
                    }`} />
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-tertiary rounded-md transition-colors" aria-label="بحث">
                <Search className="w-5 h-5 text-secondary-c" />
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-tertiary rounded-md transition-colors"
                aria-label="تبديل الوضع"
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5 text-secondary-c" />
                ) : (
                  <Sun className="w-5 h-5 text-secondary-c" />
                )}
              </button>
              <Link
                to="/admin"
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 text-xs font-600 bg-tertiary hover:bg-accent hover:text-white text-secondary-c rounded-md transition-colors"
              >
                لوحة التحكم
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile navigation */}
        {mobileOpen && (
          <nav className="lg:hidden bg-header border-t border-default slide-up">
            <div className="max-w-7xl mx-auto px-4 py-3 grid grid-cols-2 gap-1">
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.slug}
                  to={`/category/${item.slug}`}
                  className={`px-3 py-2.5 text-sm font-600 rounded-md transition-colors ${
                    location.pathname === `/category/${item.slug}`
                      ? 'bg-accent text-white'
                      : 'text-primary-c hover:bg-tertiary'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/admin"
                className="px-3 py-2.5 text-sm font-600 rounded-md bg-tertiary text-secondary-c col-span-2 text-center mt-2"
              >
                لوحة التحكم
              </Link>
            </div>
          </nav>
        )}
      </header>
    </>
  );
}
