import { Link } from 'react-router-dom';
import { Clock, Eye, Radio } from 'lucide-react';
import type { ArticleWithRelations } from '@/lib/supabase';
import { formatRelativeTime } from '@/lib/utils';

type CardVariant = 'hero' | 'featured' | 'default' | 'compact' | 'list';

export default function ArticleCard({
  article,
  variant = 'default',
}: {
  article: ArticleWithRelations;
  variant?: CardVariant;
}) {
  const href = `/article/${article.id}`;

  if (variant === 'hero') {
    return (
      <Link to={href} className="group block relative overflow-hidden rounded-xl bg-card h-[400px] lg:h-[500px] fade-in">
        {article.image_url && (
          <img
            src={article.image_url}
            alt={article.title}
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <div className="absolute bottom-0 right-0 left-0 p-6 lg:p-8">
          {article.is_live && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-accent text-white text-xs font-700 rounded mb-3">
              <Radio className="w-3 h-3 live-dot" /> مباشر
            </span>
          )}
          {article.category && (
            <span className="inline-block px-2.5 py-1 bg-accent/90 text-white text-xs font-700 rounded mb-3 mr-2">
              {article.category.name}
            </span>
          )}
          <h2 className="text-white text-2xl lg:text-3xl font-800 leading-tight mb-2 group-hover:text-red-200 transition-colors">
            {article.title}
          </h2>
          <p className="text-gray-200 text-sm lg:text-base leading-relaxed line-clamp-2 mb-3">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-3 text-gray-300 text-xs">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatRelativeTime(article.published_at)}
            </span>
            {article.source && <span>• {article.source.name}</span>}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'featured') {
    return (
      <Link to={href} className="group block bg-card rounded-xl overflow-hidden border border-default hover:shadow-xl transition-all duration-300 fade-in">
        {article.image_url && (
          <div className="relative overflow-hidden h-56">
            <img
              src={article.image_url}
              alt={article.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {article.category && (
              <span className="absolute top-3 right-3 px-2.5 py-1 bg-accent text-white text-xs font-700 rounded">
                {article.category.name}
              </span>
            )}
          </div>
        )}
        <div className="p-5">
          <h3 className="text-lg font-700 text-primary-c leading-snug mb-2 group-hover:text-accent transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-sm text-secondary-c leading-relaxed line-clamp-2 mb-3">
            {article.excerpt}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-c">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatRelativeTime(article.published_at)}
            </span>
            {article.source && <span>• {article.source.name}</span>}
          </div>
        </div>
      </Link>
    );
  }

  if (variant === 'compact') {
    return (
      <Link to={href} className="group flex gap-3 items-start py-3 border-b border-default last:border-0">
        {article.image_url && (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          {article.category && (
            <span className="text-xs text-accent font-600">{article.category.name}</span>
          )}
          <h4 className="text-sm font-600 text-primary-c leading-snug line-clamp-2 group-hover:text-accent transition-colors mt-0.5">
            {article.title}
          </h4>
          <span className="text-xs text-muted-c flex items-center gap-1 mt-1">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(article.published_at)}
          </span>
        </div>
      </Link>
    );
  }

  if (variant === 'list') {
    return (
      <Link to={href} className="group flex gap-4 items-start py-4 border-b border-default last:border-0">
        {article.image_url && (
          <img
            src={article.image_url}
            alt={article.title}
            className="w-28 h-28 rounded-lg object-cover flex-shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          {article.category && (
            <span className="text-xs text-accent font-600">{article.category.name}</span>
          )}
          <h4 className="text-base font-700 text-primary-c leading-snug line-clamp-2 group-hover:text-accent transition-colors mt-1">
            {article.title}
          </h4>
          <p className="text-sm text-secondary-c line-clamp-2 mt-1">{article.excerpt}</p>
          <div className="flex items-center gap-3 text-xs text-muted-c mt-2">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {formatRelativeTime(article.published_at)}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              {article.views} مشاهدة
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // default
  return (
    <Link to={href} className="group block bg-card rounded-xl overflow-hidden border border-default hover:shadow-lg transition-all duration-300 fade-in">
      {article.image_url && (
        <div className="relative overflow-hidden h-48">
          <img
            src={article.image_url}
            alt={article.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {article.category && (
            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-accent text-white text-xs font-700 rounded">
              {article.category.name}
            </span>
          )}
        </div>
      )}
      <div className="p-4">
        <h3 className="text-base font-700 text-primary-c leading-snug mb-1.5 group-hover:text-accent transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-sm text-secondary-c leading-relaxed line-clamp-2 mb-2">
          {article.excerpt}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-c">
          <Clock className="w-3.5 h-3.5" />
          {formatRelativeTime(article.published_at)}
        </div>
      </div>
    </Link>
  );
}
