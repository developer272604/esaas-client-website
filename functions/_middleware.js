export async function onRequestGet({ request, env, next }) {
  const url = new URL(request.url);
  if (url.pathname === '/store-catalog') {
    const snapshot = await env.ASSETS.fetch(new URL('/products.json', url));
    const { meta } = await snapshot.json();
    if (!meta?.store_slug || !meta.store_id) return new Response(null, { status: 404 });

    const api = (env.API_URL || env.NEXT_PUBLIC_API_URL || 'https://essas-api.devduox.in').replace(/\/+$/, '');
    try {
      return await fetch(`${api}/api/storefront/${encodeURIComponent(meta.store_slug)}/catalog`, {
        headers: { Accept: 'application/json' },
        cf: { cacheEverything: true, cacheTtlByStatus: { '200-299': 60, '300-599': 0 } },
      });
    } catch {
      return new Response(null, { status: 502 });
    }
  }

  const response = await next();
  if (!/^\/(product|category)\/[^/]+\/?$/.test(url.pathname) ||
      !request.headers.get('Accept')?.includes('text/html')) return response;

  // Serve the fallback document under the requested URL so it can look up its live slug.
  const document = response.status === 404
    ? await env.ASSETS.fetch(new URL('/catalog-entry', url))
    : response;
  const secured = new Response(document.body, document);
  secured.headers.set('Strict-Transport-Security', 'max-age=31536000');
  secured.headers.set('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'");
  secured.headers.set('X-Frame-Options', 'DENY');
  secured.headers.set('X-Content-Type-Options', 'nosniff');
  secured.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return secured;
}
