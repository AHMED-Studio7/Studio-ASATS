import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
  },
});

export type Category = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
};

export type Source = {
  id: string;
  name: string;
  url: string | null;
  logo_url: string | null;
  created_at: string;
};

export type Editor = {
  id: string;
  name: string;
  avatar_url: string | null;
  role: string | null;
  bio: string | null;
  created_at: string;
};

export type Article = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  image_url: string | null;
  image_caption: string | null;
  category_id: string | null;
  source_id: string | null;
  editor_id: string | null;
  is_featured: boolean;
  is_live: boolean;
  views: number;
  published_at: string;
  created_at: string;
  category?: Category;
  source?: Source;
  editor?: Editor;
};

export type ArticleWithRelations = Article & {
  category?: Category;
  source?: Source;
  editor?: Editor;
};
