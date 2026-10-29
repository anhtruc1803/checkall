'use client';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Activity, Sun, Moon, Menu, X, Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { writePreference } from '@/lib/storage/preferences';
import { usePreference } from '@/hooks/use-preference';
import type { Locale } from '@/lib/i18n/routing';
import { CommandSearch } from '@/components/navigation/command-search';
import { getSearchCategories, type ToolSearchEntry } from '@/lib/tools/search';
export function Header({ index }: { index: ToolSearchEntry[] }) {
  const categories = getSearchCategories(index);
  const t = useTranslations(),
    locale = useLocale() as Locale,
    path = usePathname();
  const theme = usePreference<string>('theme', 'dark'),
    light = theme === 'light';
  const [open, setOpen] = useState(false);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  function toggleTheme() {
    const next = light ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    writePreference('theme', next);
  }
  const other = locale === 'vi' ? 'en' : 'vi';
  const localePath = `/${other}${path.replace(/^\/(vi|en)/, '')}`;
  return (
    <>
      <a className="skip-link" href="#main">
        {t('skip')}
      </a>
      <header className="site-header">
        <Link href={`/${locale}`} className="brand" aria-label="Device Lab">
          <span className="brand-mark">
            <Activity size={21} />
          </span>
          Device Lab<span className="small">/</span>
        </Link>
        <nav className="desktop-nav" aria-label={t('allTools')}>
          {categories.map((category) => (
            <Link key={category} href={`/${locale}/${category}`}>
              {t(category)}
            </Link>
          ))}
        </nav>
        <div className="header-actions">
          <CommandSearch index={index} />
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={t('theme')}>
            {light ? <Moon size={18} /> : <Sun size={18} />}
          </Button>
          <Button variant="ghost" asChild size="sm">
            <Link
              href={localePath}
              aria-label={`${other.toUpperCase()} — ${t('language')}`}
              onClick={() => {
                writePreference('locale', other);
                document.cookie = `NEXT_LOCALE=${other}; Path=/; Max-Age=31536000; SameSite=Lax`;
              }}
            >
              <Languages size={16} />
              {other.toUpperCase()}
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="menu-toggle"
            aria-label={open ? t('close') : t('menu')}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={19} /> : <Menu size={19} />}
          </Button>
        </div>
      </header>
      {open && (
        <nav id="mobile-nav" className="mobile-nav" aria-label={t('menu')}>
          {categories.map((category) => (
            <Link key={category} href={`/${locale}/${category}`} onClick={() => setOpen(false)}>
              {t(category)}
            </Link>
          ))}
          <Link href={`/${locale}/privacy`} onClick={() => setOpen(false)}>
            {t('privacyLink')}
          </Link>
        </nav>
      )}
    </>
  );
}
