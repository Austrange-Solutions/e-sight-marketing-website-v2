import { connect } from '@/dbConfig/dbConfig';
import EventModel from '@/models/Event';

// Generates a sitemap.xml dynamically including some static routes and published events
export async function GET() {
  try {
    await connect();

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Static routes to include in the sitemap
    const staticRoutes = ['/', '/store', '/gallery', '/donate', '/contact', '/about', '/privacy', '/terms-of-use'];

    // Fetch published events to include in sitemap
    let events = [] as any[];
    try {
      events = await EventModel.find({ isPublished: true }).select('updatedAt date').lean();
    } catch (e) {
      // If DB read fails, continue with static routes only
      console.error('Failed to fetch events for sitemap:', e);
    }

    const urls: { loc: string; lastmod?: string }[] = [];

    for (const route of staticRoutes) {
      urls.push({ loc: `${baseUrl}${route}`, lastmod: undefined });
    }

    for (const ev of events) {
      const identifier = ev.slug || ev._id;
      const loc = `${baseUrl}/gallery/${identifier}`;
      const lastmod = ev.updatedAt ? new Date(ev.updatedAt).toISOString() : undefined;
      urls.push({ loc, lastmod });
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
      urls.map(u => {
        return `  <url>\n    <loc>${u.loc}</loc>` + (u.lastmod ? `\n    <lastmod>${u.lastmod}</lastmod>` : '') + `\n  </url>`;
      }).join('\n') +
      `\n</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=0, s-maxage=3600'
      }
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);
    return new Response('Error generating sitemap', { status: 500 });
  }
}
