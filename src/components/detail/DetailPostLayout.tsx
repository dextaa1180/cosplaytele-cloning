'use client';

import Image from 'next/image';
import Link from 'next/link';

interface DetailPostLayoutProps {
  cosplayer: string;
  cosplayerSlug?: string;
  character: string;
  source: string;
  photoCount: number;
  videoCount: number;
  thumbnail: string;
  images?: string[];
}

export function DetailPostLayout({
  cosplayer,
  cosplayerSlug,
  character,
  source,
  photoCount,
  videoCount,
  thumbnail,
  images = [],
}: DetailPostLayoutProps) {
  return (
    <div className="w-full bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Metadata Section */}
        <div className="mb-8 rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
          <div className="space-y-3">
            <div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Cosplayer:{' '}
              </span>
              {cosplayerSlug ? (
                <Link
                  href={`/category/${cosplayerSlug}`}
                  className="text-sm font-semibold text-slate-900 hover:text-slate-700 dark:text-white dark:hover:text-slate-200"
                >
                  {cosplayer}
                </Link>
              ) : (
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {cosplayer}
                </span>
              )}
            </div>
            <div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Character:{' '}
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {character}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Appear In:{' '}
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {source}
              </span>
            </div>
            <div>
              <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Photos:{' '}
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-white">
                {photoCount} photos and {videoCount} videos
              </span>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div className="mb-8 rounded-lg border border-slate-200 bg-slate-50 p-6 dark:border-slate-700 dark:bg-slate-900">
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-400">
            Enjoy better photo with large size and no copyright, please download
            the gallery using the link below
          </p>
          <div className="flex flex-wrap gap-3">
            <button className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600">
              Download Mediafire
            </button>
            <button className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600">
              Download Telegram
            </button>
            <button className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600">
              Download SoraFolder
            </button>
            <button className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600">
              Download Gofile
            </button>
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {/* Featured Image */}
          <div className="col-span-2 sm:col-span-3">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
              <Image
                src={thumbnail}
                alt={`${cosplayer} as ${character}`}
                fill
                className="object-cover"
                sizes="(max-width: 896px) 100vw, 896px"
                priority
              />
            </div>
          </div>

          {/* Additional Images */}
          {images.slice(0, 9).map((img, index) => (
            <div
              key={index}
              className="relative aspect-square overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800"
            >
              <Image
                src={img}
                alt={`${cosplayer} as ${character} - ${index + 2}`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
