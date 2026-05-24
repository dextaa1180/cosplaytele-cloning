'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  FileText,
  FolderTree,
  Gauge,
  ImageIcon,
  LogOut,
  Menu,
  Plug,
  Settings,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import {
  ADMIN_API_BASE_PATH,
  ADMIN_DASHBOARD_PATH,
  ADMIN_LOGIN_PATH,
} from '@/lib/admin-auth';
import { cn } from '@/lib/utils';

const navItems = [
  { href: `${ADMIN_DASHBOARD_PATH}/dashboard`, icon: Gauge, label: 'Dashboard' },
  { href: ADMIN_DASHBOARD_PATH, icon: FileText, label: 'Content' },
  { href: `${ADMIN_DASHBOARD_PATH}/monitoring`, icon: BarChart3, label: 'Monitoring' },
  { href: `${ADMIN_DASHBOARD_PATH}/connections`, icon: Plug, label: 'Connections' },
  { href: `${ADMIN_DASHBOARD_PATH}/categories`, icon: FolderTree, label: 'Categories' },
  { href: `${ADMIN_DASHBOARD_PATH}/media`, icon: ImageIcon, label: 'Media' },
  { href: `${ADMIN_DASHBOARD_PATH}/users`, icon: Users, label: 'Users' },
  { href: `${ADMIN_DASHBOARD_PATH}/settings`, icon: Settings, label: 'Settings' },
];

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = async () => {
    await fetch(`${ADMIN_API_BASE_PATH}/session`, { method: 'DELETE' });
    router.replace(ADMIN_LOGIN_PATH);
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="lg:hidden">
        <div className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-950">
          <Link href={ADMIN_DASHBOARD_PATH} className="text-base font-bold">
            Tunacosplay
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-200"
            aria-label="Toggle navigation"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-200 bg-white px-4 py-5 shadow-xl transition-transform duration-200 dark:border-slate-800 dark:bg-slate-950 lg:translate-x-0 lg:shadow-none',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-full flex-col">
          <div className="mb-8 flex items-center justify-between px-2">
            <Link href={ADMIN_DASHBOARD_PATH} className="text-lg font-bold">
              Tunacosplay
            </Link>
            <button
              type="button"
              onClick={closeMobile}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-700 dark:border-slate-800 dark:text-slate-200 lg:hidden"
              aria-label="Close navigation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.label === 'Content'
                  ? pathname === ADMIN_DASHBOARD_PATH ||
                    pathname.startsWith(`${ADMIN_DASHBOARD_PATH}/posts`)
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  onClick={closeMobile}
                  className={cn(
                    'flex h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition',
                    isActive
                      ? 'bg-slate-950 text-white shadow-sm dark:bg-white dark:text-slate-950'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white',
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto border-t border-slate-200 pt-4 dark:border-slate-800">
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-white"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={closeMobile}
          aria-label="Close navigation overlay"
        />
      )}

      <main className="min-h-screen min-w-0 overflow-x-hidden lg:pl-72">
        <div className="mx-auto w-full max-w-7xl min-w-0 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
