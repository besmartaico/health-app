import { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://healtheasy.co';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['', '/mens-health', '/consult', '/posters', '/signup'];
  return routes.map((path) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: 'weekly',
    priority: path === '' ? 1 : path === '/mens-health' ? 0.9 : 0.6,
  }));
}
