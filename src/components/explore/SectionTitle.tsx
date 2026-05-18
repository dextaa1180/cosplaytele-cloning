interface SectionTitleProps {
  title: string;
}

export function SectionTitle({ title }: SectionTitleProps) {
  return (
    <div className="mb-8 flex items-center gap-4">
      <div className="h-px flex-1 bg-[#56B6C6]/40" />
      <h2 className="text-xl font-bold uppercase tracking-wide text-[#170C79]">
        {title}
      </h2>
      <div className="h-px flex-1 bg-[#56B6C6]/40" />
    </div>
  );
}
