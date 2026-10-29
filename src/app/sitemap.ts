import type { MetadataRoute } from 'next';
import { tools, categories } from '@/lib/tools/registry';
import { routing } from '@/lib/i18n/routing';
export default function sitemap(): MetadataRoute.Sitemap {
  const site = (process.env.SITE_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  const paths = [
    '',
    '/privacy',
    ...categories.map((category) => `/${category}`),
    ...tools
      .filter((tool) => tool.status === 'published' && tool.seo.index)
      .map((tool) => `/${tool.category}/${tool.slug}`),
  ];
  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${site}/${locale}${path}`,
      alternates: { languages: { vi: `${site}/vi${path}`, en: `${site}/en${path}` } },
      changeFrequency: 'monthly' as const,
      priority: path === '' ? 1 : 0.7,
    })),
  );
}
