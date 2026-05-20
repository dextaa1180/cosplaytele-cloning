'use client';

import Link from 'next/link';
import { Suspense } from 'react';
import { SearchBox } from '@/components/layout/SearchBox';

export function Header() {
  return (
    <header className="w-full border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex w-full items-center justify-center sm:w-auto sm:justify-start">
            <Link
              href="/"
              className="text-center text-2xl font-bold text-slate-900 dark:text-white"
            >
              Tunacosplay
            </Link>
          </div>
          <div className="w-full sm:w-auto">
            <Suspense fallback={<SearchBoxFallback />}>
              <SearchBox />
            </Suspense>
          </div>
        </div>
      </div>
    </header>
  );
}

function SearchBoxFallback() {
  return (
    <div className="h-10 w-full max-w-sm rounded-full border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-900" />
  );
}
