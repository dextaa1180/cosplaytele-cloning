'use client';

import Link from 'next/link';
import { ChevronDown, Menu, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

type DropdownName = 'top' | 'level';

export function Navbar() {
  const navRef = useRef<HTMLElement>(null);
  const [openDropdown, setOpenDropdown] = useState<DropdownName | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const topCosplayLinks = [
    { label: '24 Hours', href: '/24-hours' },
    { label: '3 Day', href: '/3-day' },
    { label: '7 Day', href: '/7-day' },
  ];

  const levelCosplayLinks = [
    { label: 'Cosplay', href: '/category/cosplay' },
    { label: 'Cosplay Ero', href: '/category/cosplay-ero' },
    { label: 'Nude', href: '/category/nude' },
  ];

  const closeMenus = useCallback(() => {
    setOpenDropdown(null);
    setMobileOpen(false);
  }, []);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!navRef.current?.contains(event.target as Node)) {
        closeMenus();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenus();
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMenus]);

  const toggleDropdown = (dropdown: DropdownName) => {
    setOpenDropdown((current) => (current === dropdown ? null : dropdown));
  };

  return (
    <nav
      ref={navRef}
      className="relative z-[100] w-full border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 py-4">
          <Link
            href="/"
            onClick={closeMenus}
            className="font-bold text-slate-900 hover:text-slate-700 dark:text-white dark:hover:text-slate-200"
          >
            Home
          </Link>

          <div className="hidden items-center gap-6 lg:flex">
            <Link
              href="/category/video-cosplayy"
              onClick={closeMenus}
              className="text-slate-900 hover:text-slate-700 dark:text-white dark:hover:text-slate-200"
            >
              Video Cosplay
            </Link>

            <div className="relative">
              <button
                type="button"
                aria-expanded={openDropdown === 'top'}
                aria-controls="top-cosplay-menu"
                onClick={() => toggleDropdown('top')}
                className="flex items-center gap-1 rounded-lg px-3 py-2 font-semibold text-slate-900 transition hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
              >
                Top Cosplay
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition',
                    openDropdown === 'top' && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </button>

              {openDropdown === 'top' && (
                <div
                  id="top-cosplay-menu"
                  className="absolute left-0 top-full z-[9999] mt-2 min-w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                >
                  {topCosplayLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenus}
                      className="block rounded-lg px-4 py-2 text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                aria-expanded={openDropdown === 'level'}
                aria-controls="level-cosplay-menu"
                onClick={() => toggleDropdown('level')}
                className="flex items-center gap-1 rounded-lg px-3 py-2 font-semibold text-slate-900 transition hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
              >
                Level Cosplay
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition',
                    openDropdown === 'level' && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </button>

              {openDropdown === 'level' && (
                <div
                  id="level-cosplay-menu"
                  className="absolute left-0 top-full z-[9999] mt-2 min-w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900"
                >
                  {levelCosplayLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenus}
                      className="block rounded-lg px-4 py-2 text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/explore-categories"
              onClick={closeMenus}
              className="text-slate-900 hover:text-slate-700 dark:text-white dark:hover:text-slate-200"
            >
              Explore Categories
            </Link>

            <Link
              href="/best-cosplayer"
              onClick={closeMenus}
              className="text-slate-900 hover:text-slate-700 dark:text-white dark:hover:text-slate-200"
            >
              Best Cosplayer
            </Link>
          </div>

          <button
            type="button"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
            onClick={() => setMobileOpen((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-900 transition hover:bg-slate-100 dark:border-slate-700 dark:text-white dark:hover:bg-slate-800 lg:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>

        {mobileOpen && (
          <div
            id="mobile-navigation"
            className="border-t border-slate-200 py-3 lg:hidden dark:border-slate-800"
          >
            <div className="flex flex-col gap-1">
              <Link
                href="/category/video-cosplayy"
                onClick={closeMenus}
                className="rounded-lg px-3 py-2 text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
              >
                Video Cosplay
              </Link>

              <button
                type="button"
                aria-expanded={openDropdown === 'top'}
                aria-controls="mobile-top-cosplay-menu"
                onClick={() => toggleDropdown('top')}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 font-semibold text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
              >
                Top Cosplay
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition',
                    openDropdown === 'top' && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </button>

              {openDropdown === 'top' && (
                <div id="mobile-top-cosplay-menu" className="pl-4">
                  {topCosplayLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenus}
                      className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}

              <button
                type="button"
                aria-expanded={openDropdown === 'level'}
                aria-controls="mobile-level-cosplay-menu"
                onClick={() => toggleDropdown('level')}
                className="flex w-full items-center justify-between rounded-lg px-3 py-2 font-semibold text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
              >
                Level Cosplay
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition',
                    openDropdown === 'level' && 'rotate-180',
                  )}
                  aria-hidden="true"
                />
              </button>

              {openDropdown === 'level' && (
                <div id="mobile-level-cosplay-menu" className="pl-4">
                  {levelCosplayLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenus}
                      className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}

              <Link
                href="/explore-categories"
                onClick={closeMenus}
                className="rounded-lg px-3 py-2 text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
              >
                Explore Categories
              </Link>

              <Link
                href="/best-cosplayer"
                onClick={closeMenus}
                className="rounded-lg px-3 py-2 text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
              >
                Best Cosplayer
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
