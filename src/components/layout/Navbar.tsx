'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';

export function Navbar() {
  const [openDropdown, setOpenDropdown] = useState<'top' | 'level' | null>(null);
  const navRef = useRef<HTMLDivElement>(null);

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

  const handleDropdownToggle = (dropdown: 'top' | 'level') => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        closeDropdown();
      }
    };

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdown]);

  // Close dropdown on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeDropdown();
      }
    };

    if (openDropdown) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [openDropdown]);

  return (
    <nav
      ref={navRef}
      className="w-full border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
    >
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
            <div className="relative">
              <button
                type="button"
                onClick={() => handleDropdownToggle('top')}
                className="flex items-center gap-1 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                aria-expanded={openDropdown === 'top'}
                aria-haspopup="true"
              >
                Top Cosplay
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openDropdown === 'top' && (
                <div className="pointer-events-auto absolute left-0 top-full z-[9999] mt-2 min-w-[12rem] rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                  {topCosplayLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-100 first:rounded-t-xl last:rounded-b-xl dark:text-slate-300 dark:hover:bg-slate-700"
                      onClick={closeDropdown}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Level Cosplay Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => handleDropdownToggle('level')}
                className="flex items-center gap-1 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                aria-expanded={openDropdown === 'level'}
                aria-haspopup="true"
              >
                Level Cosplay
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              {openDropdown === 'level' && (
                <div className="pointer-events-auto absolute left-0 top-full z-[9999] mt-2 min-w-[12rem] rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800">
                  {levelCosplayLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2 text-slate-700 hover:bg-slate-100 first:rounded-t-xl last:rounded-b-xl dark:text-slate-300 dark:hover:bg-slate-700"
                      onClick={closeDropdown}
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
