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
    <div className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#170C79]">
            Best Cosplayers
          </h1>
          <p className="mt-2 text-[#56B6C6]">
            Top cosplayers ranked by community
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topCosplayers.map((cosplayer, index) => (
            <Link
              key={cosplayer.slug}
              href={`/category/${cosplayer.slug}`}
              className="group flex items-center gap-4 rounded-lg border border-[#56B6C6]/40 bg-[#EFE3CA] p-4 transition-all hover:border-[#56B6C6] hover:bg-[#8ACBD0]/20"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#170C79] text-lg font-bold text-[#EFE3CA]">
                {index + 1}
              </div>
              <div className="flex-1">
                <h2 className="text-base font-semibold text-[#170C79] group-hover:text-[#56B6C6]">
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
