import type { MetadataRoute } from 'next';

export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://shi-fpga-lab.shi-fpga-lab.workers.dev/sitemap.xml',
  };
}
