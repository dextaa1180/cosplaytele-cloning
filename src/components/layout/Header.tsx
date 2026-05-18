'use client';

export function Header() {
  return (
    <header className="w-full border-b border-[#56B6C6]/40 bg-[#EFE3CA]">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[#170C79]">
              Tunacosplay
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="search"
              placeholder="Search..."
              className="rounded-lg border border-[#56B6C6]/40 bg-white px-3 py-2 text-sm text-[#170C79] placeholder-[#56B6C6]/60 focus:border-[#56B6C6] focus:outline-none focus:ring-2 focus:ring-[#8ACBD0]/50"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
