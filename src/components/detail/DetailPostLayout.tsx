'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ImageIcon, Play, Video } from 'lucide-react';
import { PreviewMedia } from '@/types';

interface DetailPostLayoutProps {
  title: string;
  cosplayer: string;
  cosplayerSlug?: string;
  character: string;
  source: string;
  photoCount: number;
  videoCount: number;
  tags?: string[];
  fileSize?: string;
  unzipPassword?: string;
  downloadLinks?: {
    mediafire?: string;
    telegram?: string;
    sorafolder?: string;
    gofile?: string;
  };
  previewMedia?: PreviewMedia[];
  heroImage?: string;
  description?: string;
  thumbnail: string;
}

export function DetailPostLayout({
  title,
  cosplayer,
  cosplayerSlug,
  character,
  source,
  photoCount,
  videoCount,
  tags = [],
  fileSize,
  unzipPassword = 'cosplaytele',
  downloadLinks,
  previewMedia = [],
  heroImage,
  description,
  thumbnail,
}: DetailPostLayoutProps) {
  const heroImageSrc = heroImage || thumbnail;
  const sortedPreviewMedia = [...previewMedia].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  return (
    <div className="w-full bg-neutral-900 text-white">
      {/* Hero Section */}
      <div className="relative h-[220px] w-full overflow-hidden md:h-[300px] lg:h-[340px]">
        {/* Background Image with Dark Overlay */}
        <div className="absolute inset-0">
          <Image
            src={heroImageSrc}
            alt={title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-8 sm:px-6 lg:px-8">
          {/* Tags/Labels */}
          {tags.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-semibold uppercase tracking-wider text-cyan-400"
                >
                  {tag.replace('-', ' ')}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl font-bold leading-tight md:text-3xl lg:text-4xl">
            {title}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Metadata Panel */}
        <div className="mb-8 rounded-lg border-l-4 border-cyan-500 bg-neutral-800 p-6">
          <div className="space-y-3">
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              <div>
                <span className="text-sm font-medium text-neutral-400">
                  Cosplayer:{' '}
                </span>
                {cosplayerSlug ? (
                  <Link
                    href={`/category/${cosplayerSlug}`}
                    className="text-sm font-semibold text-white hover:text-cyan-400"
                  >
                    {cosplayer}
                  </Link>
                ) : (
                  <span className="text-sm font-semibold text-white">
                    {cosplayer}
                  </span>
                )}
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-400">
                  Character:{' '}
                </span>
                <span className="text-sm font-semibold text-white">
                  {character}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-x-8 gap-y-2">
              <div>
                <span className="text-sm font-medium text-neutral-400">
                  Appear In:{' '}
                </span>
                <span className="text-sm font-semibold text-white">
                  {source}
                </span>
              </div>
              <div>
                <span className="text-sm font-medium text-neutral-400">
                  Photos:{' '}
                </span>
                <span className="text-sm font-semibold text-white">
                  {photoCount} photos and {videoCount} videos
                </span>
              </div>
            </div>

            {fileSize && (
              <div>
                <span className="text-sm font-medium text-neutral-400">
                  File Size:{' '}
                </span>
                <span className="text-sm font-semibold text-white">
                  {fileSize}
                </span>
              </div>
            )}

            <div>
              <span className="text-sm font-medium text-neutral-400">
                Unzip Password:{' '}
              </span>
              <span className="inline-block rounded bg-white px-3 py-1 font-mono text-sm font-semibold text-neutral-900">
                {unzipPassword}
              </span>
            </div>
          </div>
        </div>

        {/* Download Section */}
        <div className="mb-12 rounded-lg bg-neutral-800 p-6">
          {downloadLinks && (downloadLinks.mediafire || downloadLinks.telegram || downloadLinks.sorafolder || downloadLinks.gofile) ? (
            <>
              <p className="mb-6 text-sm text-neutral-300">
                Enjoy better photo with large size and no copyright, please download
                the gallery using the link below
              </p>

              <div className="flex flex-col items-center gap-3">
                {downloadLinks.mediafire && (
                  <a
                    href={downloadLinks.mediafire}
                    className="w-full max-w-md rounded-full bg-red-600 px-6 py-3 text-center font-semibold uppercase tracking-wide text-white transition hover:bg-red-700 sm:w-auto sm:min-w-[280px]"
                  >
                    Download Mediafire
                  </a>
                )}
                {downloadLinks.telegram && (
                  <a
                    href={downloadLinks.telegram}
                    className="w-full max-w-md rounded-full bg-red-600 px-6 py-3 text-center font-semibold uppercase tracking-wide text-white transition hover:bg-red-700 sm:w-auto sm:min-w-[280px]"
                  >
                    Download Telegram
                  </a>
                )}
                {downloadLinks.sorafolder && (
                  <a
                    href={downloadLinks.sorafolder}
                    className="w-full max-w-md rounded-full bg-red-600 px-6 py-3 text-center font-semibold uppercase tracking-wide text-white transition hover:bg-red-700 sm:w-auto sm:min-w-[280px]"
                  >
                    Download SoraFolder
                  </a>
                )}
                {downloadLinks.gofile && (
                  <a
                    href={downloadLinks.gofile}
                    className="w-full max-w-md rounded-full bg-red-600 px-6 py-3 text-center font-semibold uppercase tracking-wide text-white transition hover:bg-red-700 sm:w-auto sm:min-w-[280px]"
                  >
                    Download Gofile
                  </a>
                )}
              </div>
            </>
          ) : (
            <p className="text-center text-sm text-neutral-400">
              Download links will be added from the admin dashboard.
            </p>
          )}
        </div>

        {/* Preview Section */}
        <div>
          <h2 className="mb-6 text-2xl font-bold">Preview</h2>

          {sortedPreviewMedia.length > 0 ? (
            <>
              <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {sortedPreviewMedia.slice(0, 8).map((media, index) => (
                  <div
                    key={media.id}
                    className="relative aspect-square overflow-hidden rounded-lg bg-neutral-800"
                  >
                    {media.type === 'image' && media.url ? (
                      <Image
                        src={media.url}
                        alt={media.alt || `Preview photo ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <VideoPreview media={media} index={index} />
                    )}

                    <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/70 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-white">
                      {media.type === 'image' ? (
                        <ImageIcon className="h-3 w-3" aria-hidden="true" />
                      ) : (
                        <Video className="h-3 w-3" aria-hidden="true" />
                      )}
                      {media.type}
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="mb-6 rounded-lg border border-neutral-700 bg-neutral-800 p-8 text-center">
              <div className="relative mx-auto mb-4 aspect-square w-32 overflow-hidden rounded-lg bg-neutral-700">
                <Image
                  src={thumbnail}
                  alt="Thumbnail preview"
                  fill
                  className="object-cover"
                  sizes="128px"
                />
              </div>
              <p className="text-sm text-neutral-400">
                Preview media will be managed from the admin dashboard.
              </p>
            </div>
          )}

          <div className="rounded-lg border border-neutral-700 bg-neutral-800 p-4">
            <p className="text-sm text-neutral-300">
              {description || 'Preview only. Full gallery/download content is not hosted in this clone. Content will be managed from the admin dashboard.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

interface VideoPreviewProps {
  media: PreviewMedia;
  index: number;
}

function VideoPreview({ media, index }: VideoPreviewProps) {
  if (media.url) {
    return (
      <video
        className="h-full w-full object-cover"
        controls
        muted
        playsInline
        preload="none"
        poster={media.posterUrl}
        aria-label={media.alt || `Preview video ${index + 1}`}
      >
        <source src={media.url} />
        Your browser does not support the video tag.
      </video>
    );
  }

  return (
    <>
      {media.posterUrl ? (
        <Image
          src={media.posterUrl}
          alt={media.alt || `Preview video ${index + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-neutral-700">
          <Video className="h-10 w-10 text-neutral-300" aria-hidden="true" />
        </div>
      )}
      <div className="absolute inset-0 flex items-center justify-center bg-black/25">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-neutral-950 shadow-lg">
          <Play className="ml-1 h-6 w-6 fill-current" aria-hidden="true" />
        </div>
      </div>
      <div className="absolute bottom-2 right-2 rounded bg-black/75 px-2 py-1 text-xs font-semibold text-white">
        {media.duration || 'Video preview'}
      </div>
    </>
  );
}
