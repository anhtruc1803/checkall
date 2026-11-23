'use client';
import { useEffect, useRef } from 'react';
import Link from '@/components/navigation/policy-link';

export function ToolNavigation({
  items,
  currentId,
  label,
}: {
  items: { id: string; href: string; name: string }[];
  currentId: string;
  label: string;
}) {
  const container = useRef<HTMLElement>(null);
  useEffect(() => {
    const navigation = container.current;
    const selected = navigation?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!navigation || !selected) return;
    const reveal = () => {
      const focused = document.activeElement;
      const target = focused && navigation.contains(focused) ? focused : selected;
      const outer = navigation.getBoundingClientRect();
      const inner = target.getBoundingClientRect();
      // Scroll only the local strip; leave page position and keyboard focus untouched.
      if (inner.left < outer.left) navigation.scrollLeft -= outer.left - inner.left + 8;
      else if (inner.right > outer.right) navigation.scrollLeft += inner.right - outer.right + 8;
    };
    reveal();
    window.addEventListener('resize', reveal);
    return () => window.removeEventListener('resize', reveal);
  }, [currentId, items]);
  return (
    <nav className="tool-switcher" ref={container} aria-label={label}>
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          prefetch={false}
          aria-current={item.id === currentId ? 'page' : undefined}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}
