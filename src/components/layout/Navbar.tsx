'use client';

import Link from 'next/link';
import { useState } from 'react';

export function Navbar() {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

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

  const handleMouseEnter = (dropdown: string) => {
    setOpenDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    setOpenDropdown(null);
  };

  const handleClick = (dropdown: string) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  return (
    <nav className="w-full border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
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
              className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Video Cosplay
            </Link>

            {/* Top Cosplay Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('top-cosplay')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => handleClick('top-cosplay')}
                className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                Top Cosplay ▼
              </button>
              {openDropdown === 'top-cosplay' && (
                <div className="absolute left-0 top-full z-50 mt-2 w-40 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  {topCosplayLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                      onClick={() => setOpenDropdown(null)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Level Cosplay Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMouseEnter('level-cosplay')}
              onMouseLeave={handleMouseLeave}
            >
              <button
                onClick={() => handleClick('level-cosplay')}
                className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                Level Cosplay ▼
              </button>
              {openDropdown === 'level-cosplay' && (
                <div className="absolute left-0 top-full z-50 mt-2 w-40 rounded-lg border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800">
                  {levelCosplayLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-700"
                      onClick={() => setOpenDropdown(null)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Explore Categories Link */}
            <Link
              href="/explore-categories"
              className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Explore Categories
            </Link>

            {/* Best Cosplayer Link */}
            <Link
              href="/best-cosplayer"
              className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              Best Cosplayer
            </Link>
          </div>

          {/* Right: Empty for now */}
          <div />
        </div>
      </div>
    </nav>
  );
}
