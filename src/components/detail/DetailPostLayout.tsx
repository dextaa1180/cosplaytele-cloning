'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ImageIcon, Play, Video } from 'lucide-react';
import { PreviewMedia } from '@/types';
import {
  ContentAnalyticsTracker,
  sendAnalyticsEvent,
} from '@/components/analytics/AnalyticsTracker';
import { getCosplayerSlug } from '@/lib/cosplayers';
import { shouldBypassImageOptimizer } from '@/lib/media';
import { getSourceSlug } from '@/lib/sources';

interface DetailPostLayoutProps {
  postId: string;
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
    terabox?: string;
    gofile?: string;
  };
  previewMedia?: PreviewMedia[];
  heroImage?: string;
  description?: string;
  thumbnail: string;
}

export function DetailPostLayout({
  postId,
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
  const collectionSlug = cosplayerSlug || getCosplayerSlug(cosplayer);
  const sourceCollectionSlug = getSourceSlug(source);
  const cleanDescription = description?.trim();
  const hasDownloadLinks = Boolean(
    downloadLinks?.mediafire ||
      downloadLinks?.telegram ||
      downloadLinks?.terabox ||
      downloadLinks?.gofile,
  );
  const sortedPreviewMedia = [...previewMedia].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  return (
    <div className="w-full bg-neutral-900 text-white">
      <ContentAnalyticsTracker postId={postId} />
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
            unoptimized={shouldBypassImageOptimizer(heroImageSrc)}
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
                {collectionSlug ? (
                  <Link
                    href={`/cosplayer/${collectionSlug}`}
                    className="rounded-sm text-sm font-semibold text-cyan-300 underline decoration-cyan-400/50 underline-offset-4 transition hover:text-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
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
                {sourceCollectionSlug ? (
                  <Link
                    href={`/source/${sourceCollectionSlug}`}
                    className="rounded-sm text-sm font-semibold text-cyan-300 underline decoration-cyan-400/50 underline-offset-4 transition hover:text-cyan-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-300"
                  >
                    {source}
                  </Link>
                ) : (
                  <span className="text-sm font-semibold text-white">
                    {source}
                  </span>
                )}
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

        {hasDownloadLinks && downloadLinks && (
          <div className="mb-12 rounded-lg bg-neutral-800 p-6">
            <>
              <p className="mb-6 text-sm text-neutral-300">
                Enjoy better photo with large size and no copyright, please download
                the gallery using the link below
              </p>

              <div className="flex flex-col items-center gap-3">
                {downloadLinks.mediafire && (
                  <a
                    href={downloadLinks.mediafire}
                    onClick={() =>
                      sendAnalyticsEvent({
                        event: 'download',
                        postId,
                        provider: 'mediafire',
                      })
                    }
                    className="w-full max-w-md rounded-full bg-red-600 px-6 py-3 text-center font-semibold uppercase tracking-wide text-white transition hover:bg-red-700 sm:w-auto sm:min-w-[280px]"
                  >
                    Download Mediafire
                  </a>
                )}
                {downloadLinks.telegram && (
                  <a
                    href={downloadLinks.telegram}
                    onClick={() =>
                      sendAnalyticsEvent({
                        event: 'download',
                        postId,
                        provider: 'telegram',
                      })
                    }
                    className="w-full max-w-md rounded-full bg-red-600 px-6 py-3 text-center font-semibold uppercase tracking-wide text-white transition hover:bg-red-700 sm:w-auto sm:min-w-[280px]"
                  >
                    Download Telegram
                  </a>
                )}
                {downloadLinks.terabox && (
                  <a
                    href={downloadLinks.terabox}
                    onClick={() =>
                      sendAnalyticsEvent({
                        event: 'download',
                        postId,
                        provider: 'terabox',
                      })
                    }
                    className="w-full max-w-md rounded-full bg-red-600 px-6 py-3 text-center font-semibold uppercase tracking-wide text-white transition hover:bg-red-700 sm:w-auto sm:min-w-[280px]"
                  >
                    Download Terabox
                  </a>
                )}
                {downloadLinks.gofile && (
                  <a
                    href={downloadLinks.gofile}
                    onClick={() =>
                      sendAnalyticsEvent({
                        event: 'download',
                        postId,
                        provider: 'gofile',
                      })
                    }
                    className="w-full max-w-md rounded-full bg-red-600 px-6 py-3 text-center font-semibold uppercase tracking-wide text-white transition hover:bg-red-700 sm:w-auto sm:min-w-[280px]"
                  >
                    Download Gofile
                  </a>
                )}
              </div>
            </>
          </div>
        )}

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
                        unoptimized={shouldBypassImageOptimizer(media.url)}
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
                  unoptimized={shouldBypassImageOptimizer(thumbnail)}
                />
              </div>
            </div>
          )}

          {cleanDescription && (
            <div className="rounded-lg border border-neutral-700 bg-neutral-800 p-4">
              <p className="text-sm text-neutral-300">{cleanDescription}</p>
            </div>
          )}
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
    if (isEmbeddableVideoUrl(media.url)) {
      return (
        <iframe
          src={media.url}
          title={media.alt || `Preview video ${index + 1}`}
          className="h-full w-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
        />
      );
    }

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
        <source src={media.url} type={getVideoMimeType(media.url)} />
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
          unoptimized={shouldBypassImageOptimizer(media.posterUrl)}
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

function isEmbeddableVideoUrl(url: string) {
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    return (
      hostname === 'dood.to' ||
      hostname === 'doodstream.com' ||
      hostname === 'playmogo.com' ||
      hostname.endsWith('.doodstream.com') ||
      hostname.startsWith('dood.')
    );
  } catch {
    return false;
  }
}

function getVideoMimeType(url: string) {
  const pathname = url.split('?')[0]?.toLowerCase() ?? '';

  if (pathname.endsWith('.mp4') || pathname.endsWith('.m4v')) {
    return 'video/mp4';
  }

  if (pathname.endsWith('.webm')) {
    return 'video/webm';
  }

  if (pathname.endsWith('.mov')) {
    return 'video/quicktime';
  }

  return undefined;
}
