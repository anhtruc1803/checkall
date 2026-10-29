import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './lib/i18n/routing';
const intl = createMiddleware(routing);
export default function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    const preferred = request.cookies.get('NEXT_LOCALE')?.value;
    return NextResponse.redirect(new URL(preferred === 'en' ? '/en' : '/vi', request.url));
  }
  return intl(request);
}
export const config = { matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'] };
