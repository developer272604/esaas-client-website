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
  const catalogPath = /^\/(product|category)\/[^/]+\/?$/.test(url.pathname);
  // Serve the fallback document under the requested URL so it can look up its live slug.
  const document = response.status === 404 && catalogPath && request.headers.get('Accept')?.includes('text/html')
    ? await env.ASSETS.fetch(new URL('/catalog-entry', url))
    : response;

  if (!document.headers.get('Content-Type')?.includes('text/html')) return document;

  // Some Pages builds call Next directly and leave its bootstrap scripts inline.
  // Authorize the script bodies in the trusted static export with CSP hashes.
  const html = await document.text();
  const scripts = [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)]
    .filter(([, attrs, code]) => code.trim() && !/\bsrc\s*=|\btype\s*=\s*["']application\/ld\+json["']/i.test(attrs));
  const hashes = await Promise.all(scripts.map(async ([, , code]) => {
    const bytes = new TextEncoder().encode(code.replace(/\r\n?/g, '\n'));
    const digest = new Uint8Array(await crypto.subtle.digest('SHA-256', bytes));
    return `'sha256-${btoa(String.fromCharCode(...digest))}'`;
  }));
  const scriptSources = ["'self'", ...new Set(hashes)].join(' ');
  const secured = new Response(html, document);
  secured.headers.delete('Content-Length');
  secured.headers.set('Strict-Transport-Security', 'max-age=31536000');
  secured.headers.set('Content-Security-Policy', `default-src 'self'; script-src ${scriptSources}; style-src 'self' 'unsafe-inline'; img-src 'self' https: data: blob:; font-src 'self'; connect-src 'self'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'`);
  secured.headers.set('X-Frame-Options', 'DENY');
  secured.headers.set('X-Content-Type-Options', 'nosniff');
  secured.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  return secured;
}
