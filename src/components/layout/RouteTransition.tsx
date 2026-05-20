'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export function RouteTransition() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let timeoutId: number | undefined;

    if (isLoading) {
      timeoutId = window.setTimeout(() => {
        setIsLoading(false);
      }, 320);
    }

    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isLoading, pathname, searchParams]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) {
        return;
      }

      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest('a[href]');

      if (!(link instanceof HTMLAnchorElement)) {
        return;
      }

      if (link.target && link.target !== '_self') {
        return;
      }

      const nextUrl = new URL(link.href, window.location.href);

      if (nextUrl.origin !== window.location.origin) {
        return;
      }

      const nextPath = `${nextUrl.pathname}${nextUrl.search}`;
      const currentPath = `${window.location.pathname}${window.location.search}`;

      if (nextPath !== currentPath) {
        setIsLoading(true);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown, {
      capture: true,
    });

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, {
        capture: true,
      });
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={[
        'fixed left-0 top-0 z-[10000] h-1 origin-left bg-cyan-400 shadow-[0_0_18px_rgba(34,211,238,0.55)] transition-all duration-300 ease-out',
        isLoading
          ? 'w-full scale-x-100 opacity-100'
          : 'w-full scale-x-0 opacity-0',
      ].join(' ')}
    />
  );
}
