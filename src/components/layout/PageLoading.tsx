interface PageLoadingProps {
  variant?: 'public' | 'admin';
}

export function PageLoading({ variant = 'public' }: PageLoadingProps) {
  if (variant === 'admin') {
    return (
      <div className="space-y-6 p-6">
        <div className="h-8 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-28 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-900"
            />
          ))}
        </div>
        <div className="h-80 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-900" />
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-3">
          <div className="h-8 w-52 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-4 w-72 max-w-full animate-pulse rounded bg-slate-100 dark:bg-slate-900" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <div key={item} className="overflow-hidden rounded-lg bg-white shadow-md dark:bg-slate-900">
              <div className="aspect-square animate-pulse bg-slate-100 dark:bg-slate-800" />
              <div className="space-y-2 p-4">
                <div className="h-4 w-2/3 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
