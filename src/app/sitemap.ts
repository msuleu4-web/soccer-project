import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://goal-labo.com';
  return [
    { url: base,               lastModified: new Date(), changeFrequency: 'daily',   priority: 1 },
    { url: `${base}/news`,     lastModified: new Date(), changeFrequency: 'hourly',  priority: 0.9 },
    { url: `${base}/standings`,lastModified: new Date(), changeFrequency: 'daily',   priority: 0.8 },
    { url: `${base}/simulator`,lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: `${base}/board`,    lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
    { url: `${base}/manu`,     lastModified: new Date(), changeFrequency: 'daily',   priority: 0.6 },
    { url: `${base}/about`,    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
  ];
}
