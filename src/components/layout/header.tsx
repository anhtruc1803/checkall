'use client';
import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from '@/components/navigation/policy-link';
import { Activity, ChevronDown, Languages, Monitor, Moon, Sun, Calculator } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { writePreference } from '@/lib/storage/preferences';
import { usePreference } from '@/hooks/use-preference';
import type { Locale } from '@/lib/i18n/routing';
import { CommandSearch } from '@/components/navigation/command-search';
import { getSearchCategories, type ToolSearchEntry } from '@/lib/tools/search';
import { getToolGroup } from '@/lib/tools/groups';
import { CategoryIcon } from '@/components/tools/category-icon';
import styles from './header.module.css';

export function Header({ index }: { index: ToolSearchEntry[] }) {
  const deviceCategories = getSearchCategories(index).filter(
    (category) => getToolGroup(category) === 'device-tests',
  );
  const t = useTranslations(),
    locale = useLocale() as Locale,
    path = usePathname();
  const theme = usePreference<string>('theme', 'dark'),
    light = theme === 'light';
  const [open, setOpen] = useState(false);
  const deviceMenu = useRef<HTMLDivElement>(null);
  const deviceTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  useEffect(() => {
    if (!open) return;
    function dismissOutside(event: PointerEvent) {
      if (!deviceMenu.current?.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('pointerdown', dismissOutside);
    return () => document.removeEventListener('pointerdown', dismissOutside);
  }, [open]);
  function toggleTheme() {
    const next = light ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    writePreference('theme', next);
  }
  const other = locale === 'vi' ? 'en' : 'vi';
  const localePath = `/${other}${path.replace(/^\/(vi|en)/, '')}`;
  const activeCategory = path.split('/')[2];
  return (
    <>
      <a className="skip-link" href="#main">
        {t('skip')}
      </a>
      <header className={`site-header ${styles.header}`}>
        <Link href={`/${locale}`} className="brand">
          <span className="brand-mark">
            <Activity size={21} aria-hidden="true" />
          </span>
          <span>
            Device Lab<span className="brand-caption">{t('interface.brandCaption')}</span>
          </span>
        </Link>
        <nav
          className={`primary-nav ${styles.navigation}`}
          aria-label={t('homeDiscovery.navigation')}
        >
          <div
            ref={deviceMenu}
            className={styles.deviceMenu}
            onBlur={(event) => {
              if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget))
                setOpen(false);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape' && open) {
                event.preventDefault();
                setOpen(false);
                deviceTrigger.current?.focus();
              }
            }}
          >
            <Button
              ref={deviceTrigger}
              type="button"
              variant="ghost"
              className={styles.navItem}
              aria-expanded={open}
              aria-controls="device-nav"
              data-current={deviceCategories.some((category) => category === activeCategory)}
              onClick={() => setOpen(!open)}
            >
              <Monitor size={17} aria-hidden="true" />
              <span>{t('toolGroups.device-tests')}</span>
              <ChevronDown size={15} aria-hidden="true" />
            </Button>
            <ul id="device-nav" className={styles.deviceLinks} hidden={!open}>
              {deviceCategories.map((category) => (
                <li key={category}>
                  <Link
                    href={`/${locale}/${category}`}
                    prefetch={false}
                    tabIndex={0}
                    aria-current={activeCategory === category ? 'page' : undefined}
                    onClick={() => setOpen(false)}
                  >
                    <CategoryIcon category={category} size={17} />
                    <span>{t(category)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <Button variant="ghost" asChild className={styles.navItem}>
            <Link
              href={`/${locale}/utilities`}
              tabIndex={0}
              aria-current={activeCategory === 'utilities' ? 'page' : undefined}
            >
              <Calculator size={17} aria-hidden="true" />
              <span>{t('utilities')}</span>
            </Link>
          </Button>
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
        </div>
      </header>
    </>
  );
}
