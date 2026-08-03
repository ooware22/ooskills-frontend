import { NextResponse } from 'next/server';

export function middleware(request: Request) {
  // Generate a cryptographically secure hex nonce
  const nonce = Array.from(crypto.getRandomValues(new Uint8Array(16)))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-nonce', nonce);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const isDev = process.env.NODE_ENV !== "production";
  const devOrigins = isDev ? " http://localhost:8000 http://127.0.0.1:8000 ws://localhost:3000 ws://127.0.0.1:3000" : "";
  const scriptSrc = isDev
    ? `script-src 'self' 'unsafe-eval' 'unsafe-inline'${devOrigins}`
    : `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'`;

  const csp = [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    `img-src 'self' data: blob: https://images.unsplash.com https://cdn.worldvectorlogo.com https://api.ooskills.com https://randomuser.me https://pbwxwhkkjkshcsugaubp.supabase.co https://*.r2.dev https://*.r2.cloudflarestorage.com https://platform-lookaside.fbsbx.com https://lh3.googleusercontent.com${devOrigins}`,
    `media-src 'self' blob: https://*.r2.dev https://*.r2.cloudflarestorage.com${devOrigins}`,
    `connect-src 'self' https://api.ooskills.com https://upload.ooskills.com https://pbwxwhkkjkshcsugaubp.supabase.co https://*.r2.dev https://*.r2.cloudflarestorage.com${devOrigins}`,
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
