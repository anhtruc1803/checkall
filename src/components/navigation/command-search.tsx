'use client';
import { useEffect, useRef, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { searchToolIndex, toolHref, type ToolSearchEntry } from '@/lib/tools/search';
import type { Locale } from '@/lib/i18n/routing';
export function CommandSearch({ index }: { index: ToolSearchEntry[] }) {
  const t = useTranslations(),
    locale = useLocale() as Locale;
  const dialog = useRef<HTMLDialogElement>(null),
    input = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(''),
    [opened, setOpened] = useState(false);
  const results = opened ? searchToolIndex(index, query) : [];
  function open() {
    setOpened(true);
    dialog.current?.showModal();
    input.current?.focus();
  }
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else {
          setOpened(true);
          dialog.current?.showModal();
          input.current?.focus();
        }
      }
    };
    document.addEventListener('keydown', shortcut);
    return () => document.removeEventListener('keydown', shortcut);
  }, []);
  return (
    <>
      <Button
        variant="outline"
        className="command-trigger"
        aria-label={t('searchLabel')}
        onClick={open}
      >
        <Search size={15} />
        <span>{t('search')}</span>
        <kbd>⌘K</kbd>
      </Button>
      <dialog
        ref={dialog}
        className="command-dialog"
        aria-label={t('searchLabel')}
        onClick={(e) => {
          if (e.target === e.currentTarget) dialog.current?.close();
        }}
      >
        <div className="command-panel">
          <div className="controls">
            <label className="field field-flex">
              <span className="sr-only">{t('searchLabel')}</span>
              <input
                ref={input}
                value={query}
                placeholder={t('search')}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    dialog.current?.querySelector<HTMLAnchorElement>('.command-results a')?.focus();
                  }
                }}
              />
            </label>
            <Button
              variant="ghost"
              size="icon"
              aria-label={t('close')}
              onClick={() => dialog.current?.close()}
            >
              <X size={18} />
            </Button>
          </div>
          <div
            className="command-results"
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
                e.preventDefault();
                const links = Array.from(
                  dialog.current?.querySelectorAll<HTMLAnchorElement>('.command-results a') ?? [],
                );
                const index = links.indexOf(document.activeElement as HTMLAnchorElement);
                links[
                  (index + (e.key === 'ArrowDown' ? 1 : links.length - 1)) % links.length
                ]?.focus();
              }
            }}
          >
            {results.map((tool) => (
              <Link
                key={tool.id}
                href={toolHref(tool, locale)}
                prefetch={false}
                onClick={() => dialog.current?.close()}
              >
                <span>{tool.name}</span>
                <small>{t(tool.category)}</small>
              </Link>
            ))}
            {opened && !results.length && <p>{t('noResults')}</p>}
          </div>
        </div>
      </dialog>
    </>
  );
}
