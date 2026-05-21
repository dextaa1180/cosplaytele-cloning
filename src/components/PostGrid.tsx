'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Post } from '@/types';
import { PostCard } from '@/components/PostCard';
import { cn } from '@/lib/utils';

interface PostGridProps {
  className?: string;
  pageSize?: number;
  posts: Post[];
}

const defaultPageSize = 12;

export function PostGrid({
  className,
  pageSize = defaultPageSize,
  posts,
}: PostGridProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(posts.length / pageSize));
  const activePage = Math.min(currentPage, totalPages);
  const visiblePosts = useMemo(() => {
    const startIndex = (activePage - 1) * pageSize;
    return posts.slice(startIndex, startIndex + pageSize);
  }, [activePage, pageSize, posts]);

  return (
    <div className="space-y-8">
      <div
        className={cn(
          'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4',
          className,
        )}
      >
        {visiblePosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>

      {totalPages > 1 && (
        <PaginationControls
          currentPage={activePage}
          onPageChange={setCurrentPage}
          totalPages={totalPages}
        />
      )}
    </div>
  );
}

function PaginationControls({
  currentPage,
  onPageChange,
  totalPages,
}: {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}) {
  const pages = getVisiblePages(currentPage, totalPages);

  return (
    <nav
      className="flex items-center justify-center gap-2"
      aria-label="Content pagination"
    >
      <PaginationButton
        disabled={currentPage === 1}
        label="Previous page"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        <ChevronLeft className="h-4 w-4" aria-hidden="true" />
      </PaginationButton>

      {pages.map((page) =>
        typeof page === 'number' ? (
          <PaginationButton
            active={page === currentPage}
            key={page}
            label={`Page ${page}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </PaginationButton>
        ) : (
          <span
            key={page}
            className="flex h-10 min-w-10 items-center justify-center rounded-full border border-slate-300 px-3 text-sm font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400"
          >
            ...
          </span>
        ),
      )}

      <PaginationButton
        disabled={currentPage === totalPages}
        label="Next page"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
      </PaginationButton>
    </nav>
  );
}

function PaginationButton({
  active = false,
  children,
  disabled = false,
  label,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-current={active ? 'page' : undefined}
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-sm font-semibold transition',
        active
          ? 'border-cyan-500 bg-cyan-500 text-white shadow-sm'
          : 'border-slate-300 bg-white text-slate-700 hover:border-cyan-400 hover:text-cyan-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 dark:hover:border-cyan-500 dark:hover:text-cyan-200',
        disabled && 'cursor-not-allowed opacity-40 hover:border-slate-300 hover:text-slate-700 dark:hover:border-slate-700 dark:hover:text-slate-200',
      )}
    >
      {children}
    </button>
  );
}

function getVisiblePages(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | string> = [1];
  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  if (start > 2) {
    pages.push('ellipsis-start');
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (end < totalPages - 1) {
    pages.push('ellipsis-end');
  }

  pages.push(totalPages);
  return pages;
}
