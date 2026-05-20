'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, X } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { shouldBypassImageOptimizer } from '@/lib/media';
import { cn } from '@/lib/utils';

interface SearchResult {
  category: string;
  character: string;
  cosplayer: string;
  id: string;
  photoCount: number;
  slug: string;
  source: string;
  thumbnail: string;
  title: string;
  videoCount: number;
}

export function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);

  const trimmedQuery = query.trim();
  const showDropdown = focused && trimmedQuery.length >= 2;
  const searchHref = useMemo(
    () => `/search?q=${encodeURIComponent(trimmedQuery)}`,
    [trimmedQuery],
  );

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setFocused(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setFocused(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (trimmedQuery.length < 2) {
      return;
    }

    const controller = new AbortController();

    const timeoutId = window.setTimeout(() => {
      setLoading(true);
      fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}`, {
        cache: 'no-store',
        signal: controller.signal,
      })
        .then((response) => (response.ok ? response.json() : null))
        .then((payload: { results?: SearchResult[] } | null) => {
          setResults(Array.isArray(payload?.results) ? payload.results : []);
        })
        .catch((error: unknown) => {
          if (!isAbortError(error)) {
            setResults([]);
          }
        })
        .finally(() => {
          if (!controller.signal.aborted) {
            setLoading(false);
          }
        });
    }, 180);

    return () => {
      controller.abort();
      window.clearTimeout(timeoutId);
    };
  }, [trimmedQuery]);

  const handleQueryChange = (value: string) => {
    setQuery(value);

    if (value.trim().length < 2) {
      setResults([]);
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!trimmedQuery) {
      setFocused(true);
      return;
    }

    setFocused(false);
    router.push(searchHref);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setFocused(false);
  };

  return (
    <div ref={wrapperRef} className="relative w-full max-w-sm">
      <form
        onSubmit={(event) => handleSubmit(event)}
        className={cn(
          'flex h-10 items-center rounded-full border bg-white px-3 transition dark:bg-slate-900',
          showDropdown
            ? 'border-cyan-500 ring-2 ring-cyan-500/20'
            : 'border-slate-300 dark:border-slate-700',
        )}
      >
        <input
          type="search"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search..."
          className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-500 dark:text-white dark:placeholder:text-slate-400"
        />
        {query && (
          <button
            type="button"
            onClick={clearSearch}
            className="mr-1 inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-800 text-white transition hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        <button
          type="submit"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-rose-600 transition hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-slate-800"
          aria-label="Search"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
        </button>
      </form>

      {showDropdown && (
        <div className="absolute right-0 top-full z-[9999] mt-2 max-h-[420px] w-[min(92vw,360px)] overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950">
          {loading && results.length === 0 ? (
            <div className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
              Searching...
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {results.map((result) => (
                <Link
                  key={result.id}
                  href={`/${result.slug}`}
                  onClick={() => setFocused(false)}
                  className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 px-3 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-900"
                >
                  <div className="relative h-24 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={result.thumbnail}
                      alt={result.title}
                      fill
                      className="object-cover"
                      sizes="72px"
                      unoptimized={shouldBypassImageOptimizer(result.thumbnail)}
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="line-clamp-2 text-sm font-semibold text-slate-950 dark:text-white">
                      <span className="text-rose-600 dark:text-rose-300">
                        {result.cosplayer}
                      </span>{' '}
                      {result.title}
                    </p>
                    <p className="mt-1 line-clamp-2 text-sm text-blue-700 dark:text-blue-300">
                      {result.character} - {result.source}
                    </p>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                      {result.photoCount} photos
                      {result.videoCount > 0 && ` / ${result.videoCount} videos`}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="px-4 py-4 text-sm text-slate-500 dark:text-slate-400">
              No content found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}
