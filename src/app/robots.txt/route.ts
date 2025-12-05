// Dynamic robots.txt generator so sitemap URL can be based on environment
export async function GET() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';

    const lines = [
      'User-agent: googlebot, bingbot, slurp, duckduckbot, baiduspider, yandexbot, sogou, exabot, facebot, facebookexternalhit, twitterbot, linkedinbot, applebot, pinterestbot, petalbot, semrushbot, ahrefsbot, dotbot, mj12bot, seznambot, qwantify, alibaba, coccocbot, sogou web spider, yisou spider, 360spider, avgbot, megaindex, rogerbot, buzhash, wotbox, sitebot, linkpadbot, blexbot, ezooms, w3c_validator, archive.org_bot, magpie-crawler, oegp, trendictionbot, ucbrowser, yandeximages, sogou pic spider, googlebot-image, bingimagebot, facebot, pinterestbot, twitterbot, linkedinbot, applebot, petalbot, semrushbot, ahrefsbot, dotbot, mj12bot, seznambot, qwantify, alibaba, coccocbot, sogou web spider, yisou spider, 360spider, avgbot, megaindex, rogerbot, buzhash, wotbox, sitebot, linkpadbot, blexbot, ezooms, w3c_validator, archive.org_bot, magpie-crawler, oegp, trendictionbot, ucbrowser, yandeximages, sogou pic spider, googlebot-image',
      'Disallow: /api/admin',
      'Disallow: /api/',
      'Disallow: /_next',
      'Allow: /',
      `Sitemap: ${baseUrl}/sitemap.xml`
    ];

    return new Response(lines.join('\n'), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=0, s-maxage=3600' }
    });
  } catch (error) {
    console.error('Error generating robots.txt:', error);
    return new Response('User-agent: *\nDisallow: /admin', { status: 500 });
  }
}
