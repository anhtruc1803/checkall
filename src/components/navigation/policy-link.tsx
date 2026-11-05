'use client';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import type { ComponentProps } from 'react';
import { requiresDocumentNavigation } from '@/lib/browser/navigation-policy';
type Props = ComponentProps<'a'> & { href: string; prefetch?: boolean };
/** Document policy cannot be relaxed or narrowed by an App Router soft navigation. */
export default function PolicyLink({ href, prefetch, ...props }: Props) {
  const pathname = usePathname();
  return requiresDocumentNavigation(pathname, href) ? (
    <a href={href} {...props} />
  ) : (
    <NextLink href={href} prefetch={prefetch} {...props} />
  );
}
