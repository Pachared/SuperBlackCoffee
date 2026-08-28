import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://superblackcoffee.co.th';
  return [
    '',
    '/about',
    '/menu',
    '/branches',
    '/franchise',
    '/services',
    '/news',
    '/contact',
    '/privacy',
    '/terms',
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : 0.7,
  }));
}
