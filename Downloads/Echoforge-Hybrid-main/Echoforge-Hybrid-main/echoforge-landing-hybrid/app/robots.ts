import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/_next/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/dashboard/'],
      },
    ],
    sitemap: 'https://echoforge.com/sitemap.xml',
  };
}
