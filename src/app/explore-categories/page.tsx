'use client';

import Link from 'next/link';

const categories = [
  { name: 'Cosplay', href: '/category/cosplay' },
  { name: 'Video Cosplay', href: '/category/video-cosplayy' },
  { name: 'Cosplay Ero', href: '/category/cosplay-ero' },
  { name: 'Nude', href: '/category/nude' },
];

export default function ExploreCategoriesPage() {
  return (
    <div className="w-full bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Explore Categories
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Browse all available cosplay categories
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.href}
              href={category.href}
              className="group rounded-lg border border-slate-200 bg-slate-50 p-6 transition-all hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              <h2 className="text-lg font-semibold text-slate-900 group-hover:text-slate-700 dark:text-white dark:group-hover:text-slate-200">
                {category.name}
              </h2>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Explore {category.name.toLowerCase()} collections
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
