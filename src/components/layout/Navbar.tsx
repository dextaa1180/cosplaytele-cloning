import Link from 'next/link';

export function Navbar() {
  const topCosplayLinks = [
    { label: '24 Hours', href: '/24-hours' },
    { label: '3 Day', href: '/3-day' },
    { label: '7 Day', href: '/7-day' },
  ];

  const levelCosplayLinks = [
    { label: 'Cosplay', href: '/category/cosplay' },
    { label: 'Cosplay Ero', href: '/category/cosplay-ero' },
    { label: 'Nude', href: '/category/nude' },
  ];

  return (
    <nav className="relative z-[100] w-full border-b border-[#56B6C6]/40 bg-[#EFE3CA]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Left: Logo/Home */}
          <Link
            href="/"
            className="font-bold text-[#170C79] hover:text-[#56B6C6]"
          >
            Home
          </Link>

          {/* Center: Navigation Links */}
          <div className="flex items-center gap-6">
            {/* Video Cosplay - Direct Link */}
            <Link
              href="/category/video-cosplayy"
              className="text-[#170C79] hover:text-[#56B6C6]"
            >
              Video Cosplay
            </Link>

            {/* Top Cosplay Dropdown */}
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg px-3 py-2 font-semibold text-[#170C79] transition hover:bg-[#8ACBD0]/25">
                Top Cosplay
                <span className="transition group-open:rotate-180">▾</span>
              </summary>

              <div className="absolute left-0 top-full z-[9999] mt-2 min-w-48 rounded-xl border border-[#56B6C6]/40 bg-[#EFE3CA] p-2 shadow-xl">
                {topCosplayLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-lg px-4 py-2 text-[#170C79] hover:bg-[#8ACBD0]/30"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </details>

            {/* Level Cosplay Dropdown */}
            <details className="group relative">
              <summary className="flex cursor-pointer list-none items-center gap-1 rounded-lg px-3 py-2 font-semibold text-[#170C79] transition hover:bg-[#8ACBD0]/25">
                Level Cosplay
                <span className="transition group-open:rotate-180">▾</span>
              </summary>

              <div className="absolute left-0 top-full z-[9999] mt-2 min-w-48 rounded-xl border border-[#56B6C6]/40 bg-[#EFE3CA] p-2 shadow-xl">
                {levelCosplayLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-lg px-4 py-2 text-[#170C79] hover:bg-[#8ACBD0]/30"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </details>

            {/* Explore Categories Link */}
            <Link
              href="/explore-categories"
              className="text-[#170C79] hover:text-[#56B6C6]"
            >
              Explore Categories
            </Link>

            {/* Best Cosplayer Link */}
            <Link
              href="/best-cosplayer"
              className="text-[#170C79] hover:text-[#56B6C6]"
            >
              Best Cosplayer
            </Link>
          </div>

          {/* Right: Empty for now */}
          <div />
        </div>
      </div>

      <style jsx>{`
        summary::-webkit-details-marker {
          display: none;
        }
      `}</style>
    </nav>
  );
}
