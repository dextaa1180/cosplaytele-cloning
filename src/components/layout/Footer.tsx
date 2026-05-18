'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="w-full border-t border-[#56B6C6]/40 bg-[#EFE3CA]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* About */}
          <div>
            <h3 className="mb-4 font-bold text-[#170C79]">
              About Tunacosplay
            </h3>
            <p className="text-sm text-[#56B6C6]">
              Explore amazing cosplay collections from talented cosplayers around the world.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 font-bold text-[#170C79]">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/explore-categories"
                  className="text-[#56B6C6] hover:text-[#170C79]"
                >
                  Explore Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/best-cosplayer"
                  className="text-[#56B6C6] hover:text-[#170C79]"
                >
                  Best Cosplayer
                </Link>
              </li>
              <li>
                <Link
                  href="/24-hours"
                  className="text-[#56B6C6] hover:text-[#170C79]"
                >
                  Top 24 Hours
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="mb-4 font-bold text-[#170C79]">
              Categories
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/category/cosplay"
                  className="text-[#56B6C6] hover:text-[#170C79]"
                >
                  Cosplay
                </Link>
              </li>
              <li>
                <Link
                  href="/category/video-cosplayy"
                  className="text-[#56B6C6] hover:text-[#170C79]"
                >
                  Video Cosplay
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 border-t border-[#56B6C6]/40 pt-8">
          <p className="text-center text-sm text-[#56B6C6]">
            © 2026 Tunacosplay. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
