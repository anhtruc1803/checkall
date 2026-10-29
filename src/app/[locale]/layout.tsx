import type { Metadata } from 'next';
import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import '../globals.css';
import { getToolSearchIndex } from '@/lib/tools/registry';
export const dynamicParams = false;
export const metadata: Metadata = {
  title: { default: 'Device Lab', template: '%s | Device Lab' },
  description: 'Device Lab',
  metadataBase: new URL(process.env.SITE_URL ?? 'http://localhost:3000'),
};
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>
          <div className="container">
            <Header index={getToolSearchIndex(locale)} />
            {children}
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
