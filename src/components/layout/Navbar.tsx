'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';

export function Navbar() {
  const topDropdownRef = useRef<HTMLDetailsElement>(null);
  const levelDropdownRef = useRef<HTMLDetailsElement>(null);

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

  // Auto-close other dropdown when one opens
  useEffect(() => {
    const handleTopToggle = () => {
      if (topDropdownRef.current?.open && levelDropdownRef.current?.open) {
        levelDropdownRef.current.open = false;
      }
    };

    const handleLevelToggle = () => {
      if (levelDropdownRef.current?.open && topDropdownRef.current?.open) {
        topDropdownRef.current.open = false;
      }
    };

    const topElement = topDropdownRef.current;
    const levelElement = levelDropdownRef.current;

    topElement?.addEventListener('toggle', handleTopToggle);
    levelElement?.addEventListener('toggle', handleLevelToggle);

    return () => {
      topElement?.removeEventListener('toggle', handleTopToggle);
      levelElement?.removeEventListener('toggle', handleLevelToggle);
    };
  }, []);

  return (
    <nav className="relative z-[100] w-full border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Left: Logo/Home */}
          <Link
            href="/"
            className="font-bold text-slate-900 hover:text-slate-700 dark:text-white dark:hover:text-slate-200"
          >
            Home
          </Link>

          {/* Center: Navigation Links */}
          <div className="flex items-center gap-6">
            {/* Video Cosplay - Direct Link */}
            <Link
              href="/category/video-cosplayy"
              className="text-slate-900 hover:text-slate-700 dark:text-white dark:hover:text-slate-200"
            >
              Video Cosplay
            </Link>

            {/* Top Cosplay Dropdown */}
            <details ref={topDropdownRef} className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg px-3 py-2 font-semibold text-slate-900 transition hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800">
                Top Cosplay
                <span className="transition group-open:rotate-180">▾</span>
              </summary>

              <div className="absolute left-0 top-full z-[9999] mt-2 min-w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                {topCosplayLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-lg px-4 py-2 text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </details>

            {/* Level Cosplay Dropdown */}
            <details ref={levelDropdownRef} className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg px-3 py-2 font-semibold text-slate-900 transition hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800">
                Level Cosplay
                <span className="transition group-open:rotate-180">▾</span>
              </summary>

              <div className="absolute left-0 top-full z-[9999] mt-2 min-w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-xl dark:border-slate-700 dark:bg-slate-900">
                {levelCosplayLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-lg px-4 py-2 text-slate-900 hover:bg-slate-100 dark:text-white dark:hover:bg-slate-800"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </details>

            {/* Explore Categories Link */}
            <Link
              href="/explore-categories"
              className="text-slate-900 hover:text-slate-700 dark:text-white dark:hover:text-slate-200"
            >
              Explore Categories
            </Link>

            {/* Best Cosplayer Link */}
            <Link
              href="/best-cosplayer"
              className="text-slate-900 hover:text-slate-700 dark:text-white dark:hover:text-slate-200"
            >
              Best Cosplayer
            </Link>
          </div>

          {/* Right: Empty for now */}
          <div />
        </div>
      </div>

      <style jsx>{`
        summary::-webkit-details-marker {
          display: none;
        }
      `}</style>
    </nav>
  );
}
