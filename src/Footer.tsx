import { Newspaper, Twitter, Youtube, Instagram, Facebook, Rss } from 'lucide-react';
import { Link } from 'react-router-dom';

const FOOTER_SECTIONS = [
  {
    title: 'الأقسام',
    links: [
      { label: 'أخبار', slug: 'news' },
      { label: 'اقتصاد', slug: 'economy' },
      { label: 'تكنولوجيا', slug: 'technology' },
      { label: 'تحقيقات', slug: 'investigations' },
    ],
  },
  {
    title: 'المزيد',
    links: [
      { label: 'برامج', slug: 'programs' },
      { label: 'رياضة', slug: 'sports' },
      { label: 'صحة', slug: 'health' },
      { label: 'ثقافة', slug: 'culture' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-header border-t border-default mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-lg bg-accent flex items-center justify-center">
                <Newspaper className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-800 text-primary-c">المشهد</span>
                <span className="text-[10px] text-muted-c -mt-1">إخباري عالمي</span>
              </div>
            </div>
            <p className="text-sm text-secondary-c leading-relaxed max-w-md mb-4">
              منصة إخبارية عالمية شاملة تقدم آخر الأخبار والتحليلات والتقارير من المصادر الأصلية،
              بصوت مهني محترف وصدقية عالية. نلتزم بنقل الحقيقة كما هي من المصدر.
            </p>
            <div className="flex items-center gap-3">
              {[Twitter, Youtube, Instagram, Facebook, Rss].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-tertiary flex items-center justify-center hover:bg-accent transition-colors group"
                  aria-label="تواصل اجتماعي"
                >
                  <Icon className="w-4 h-4 text-secondary-c group-hover:text-white transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Link sections */}
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-700 text-primary-c mb-4">{section.title}</h3>
              <ul className="space-y-2.5">
                {section.links.map((link) => (
                  <li key={link.slug}>
                    <Link
                      to={`/category/${link.slug}`}
                      className="text-sm text-secondary-c hover:text-accent transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-default mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-c">
            © 2026 المشهد — جميع الحقوق محفوظة
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-c">
            <a href="#" className="hover:text-accent transition-colors">سياسة الخصوصية</a>
            <a href="#" className="hover:text-accent transition-colors">شروط الاستخدام</a>
            <a href="#" className="hover:text-accent transition-colors">اتصل بنا</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
