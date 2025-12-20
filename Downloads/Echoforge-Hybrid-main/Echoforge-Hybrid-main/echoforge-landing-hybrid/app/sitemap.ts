import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://echoforge.com';
  
  // Static pages
  const staticPages = [
    '',
    '/about',
    '/features',
    '/pricing',
    '/documentation',
    '/blog',
    '/contact',
    '/security',
    '/terms',
    '/privacy',
    '/get-access',
    '/signup',
    '/login',
  ];

  const routes = staticPages.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: route === '' || route === '/pricing' ? 'daily' : 'weekly' as 'daily' | 'weekly',
    priority: route === '' ? 1.0 : route === '/pricing' || route === '/get-access' ? 0.9 : 0.7,
  }));

  return routes;
}
