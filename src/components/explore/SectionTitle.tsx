interface SectionTitleProps {
  title: string;
}

export function SectionTitle({ title }: SectionTitleProps) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <div className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
      <h2 className="text-xl font-bold uppercase tracking-wide text-red-600 dark:text-red-500">
        {title}
      </h2>
      <div className="h-px flex-1 bg-slate-300 dark:bg-slate-700" />
    </div>
  );
}
