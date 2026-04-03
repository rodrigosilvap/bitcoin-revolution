import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import remarkHtml from 'remark-html';

const contentDir = path.join(process.cwd(), 'src/content/blog');

export interface PostFrontmatter {
  title: string;
  date: string;
  excerpt: string;
  image: string;
}

export interface PostData extends PostFrontmatter {
  slug: string;
  content: string;
}

export interface PostMeta extends PostFrontmatter {
  slug: string;
}

function getLocaleDir(locale: string): string {
  return path.join(contentDir, locale);
}

export function getAllSlugs(locale: string): string[] {
  const dir = getLocaleDir(locale);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.replace(/\.md$/, ''));
}

export function getPostBySlug(slug: string, locale: string): PostData {
  const dir = getLocaleDir(locale);
  let filePath = path.join(dir, `${slug}.md`);

  // Fallback to English if the translated version doesn't exist
  if (!fs.existsSync(filePath)) {
    filePath = path.join(getLocaleDir('en'), `${slug}.md`);
  }

  const raw = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(raw);

  return {
    slug,
    title: data.title ?? '',
    date: data.date ?? '',
    excerpt: data.excerpt ?? '',
    image: data.image ?? '',
    content,
  };
}

export function getAllPosts(locale: string): PostMeta[] {
  const slugs = getAllSlugs(locale);
  return slugs
    .map((slug) => {
      const { content: _content, ...meta } = getPostBySlug(slug, locale);
      return meta;
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}

export async function markdownToHtml(markdown: string): Promise<string> {
  // Replace custom [img]filename syntax with standard markdown images
  const processed = markdown.replace(
    /^\[img\](.+)$/gm,
    (_, filename) =>
      `![${filename}](/images/blog/${filename.replace(/^\/images\/blog\//, '')})`,
  );

  const result = await remark().use(remarkHtml, { sanitize: false }).process(processed);
  return result.toString();
}
