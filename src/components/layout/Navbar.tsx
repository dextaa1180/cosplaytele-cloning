'use client';

import Link from 'next/link';

export function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div className="container-fluid max-w-7xl mx-auto px-4">
        {/* Brand/Home */}
        <Link href="/" className="navbar-brand fw-bold text-dark">
          Home
        </Link>

        {/* Toggler for mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar items */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {/* Video Cosplay - Direct Link */}
            <li className="nav-item">
              <Link href="/category/video-cosplayy" className="nav-link">
                Video Cosplay
              </Link>
            </li>

            {/* Top Cosplay Dropdown */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="topCosplayDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Top Cosplay
              </a>
              <ul className="dropdown-menu" aria-labelledby="topCosplayDropdown">
                <li>
                  <Link href="/24-hours" className="dropdown-item">
                    24 Hours
                  </Link>
                </li>
                <li>
                  <Link href="/3-day" className="dropdown-item">
                    3 Day
                  </Link>
                </li>
                <li>
                  <Link href="/7-day" className="dropdown-item">
                    7 Day
                  </Link>
                </li>
              </ul>
            </li>

            {/* Level Cosplay Dropdown */}
            <li className="nav-item dropdown">
              <a
                className="nav-link dropdown-toggle"
                href="#"
                id="levelCosplayDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Level Cosplay
              </a>
              <ul className="dropdown-menu" aria-labelledby="levelCosplayDropdown">
                <li>
                  <Link href="/category/cosplay" className="dropdown-item">
                    Cosplay
                  </Link>
                </li>
                <li>
                  <Link href="/category/cosplay-ero" className="dropdown-item">
                    Cosplay Ero
                  </Link>
                </li>
                <li>
                  <Link href="/category/nude" className="dropdown-item">
                    Nude
                  </Link>
                </li>
              </ul>
            </li>

            {/* Explore Categories Link */}
            <li className="nav-item">
              <Link href="/explore-categories" className="nav-link">
                Explore Categories
              </Link>
            </li>

            {/* Best Cosplayer Link */}
            <li className="nav-item">
              <Link href="/best-cosplayer" className="nav-link">
                Best Cosplayer
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
}
