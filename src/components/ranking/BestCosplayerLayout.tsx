'use client';

import Link from 'next/link';

interface Cosplayer {
  name: string;
  slug: string;
}

const topCosplayers: Cosplayer[] = [
  { name: 'Tiny Asa アサ (tiny.asababy)', slug: 'tiny-asababy' },
  { name: 'Nekokoyoshi (爆机少女喵小吉)', slug: 'nekokoyoshi' },
  { name: 'Arty Huang (Arty亚缇)', slug: 'artyhuang' },
  { name: '水淼aqua', slug: 'aqua' },
  { name: 'Meenfox', slug: 'meenfox' },
  { name: 'Umeko J', slug: 'umeko-j' },
  { name: '小瑶幺幺 (xiaoyaoyaoyao12)', slug: 'xiaoyaoyaoyao12' },
  { name: 'Byoru (ビョル)', slug: 'byoru' },
  { name: '小丁 (Xiao Ding)', slug: 'xiao-ding' },
  { name: 'Rioko (凉凉子)', slug: 'rioko' },
];

export function BestCosplayerLayout() {
  return (
    <div className="w-full bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Best Cosplayers
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Top cosplayers ranked by community
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topCosplayers.map((cosplayer, index) => (
            <Link
              key={cosplayer.slug}
              href={`/category/${cosplayer.slug}`}
              className="group flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50 p-4 transition-all hover:border-slate-300 hover:bg-white dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 text-lg font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-300">
                {index + 1}
              </div>
              <div className="flex-1">
                <h2 className="text-base font-semibold text-slate-900 group-hover:text-slate-700 dark:text-white dark:group-hover:text-slate-200">
                  {cosplayer.name}
                </h2>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
