'use client';

import { FormEvent, useMemo, useState } from 'react';
import { LockKeyhole, LogIn } from 'lucide-react';
import { ADMIN_API_BASE_PATH, ADMIN_DASHBOARD_PATH } from '@/lib/admin-auth';

export function AdminLogin() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const nextPath = useMemo(() => {
    if (typeof window === 'undefined') {
      return ADMIN_DASHBOARD_PATH;
    }

    const value = new URLSearchParams(window.location.search).get('next');
    return value?.startsWith(ADMIN_DASHBOARD_PATH) ? value : ADMIN_DASHBOARD_PATH;
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setSubmitting(true);

    try {
      const response = await fetch(`${ADMIN_API_BASE_PATH}/session`, {
        body: JSON.stringify({ password, username }),
        headers: {
          'Content-Type': 'application/json',
        },
        method: 'POST',
      });
      const payload = (await response.json().catch(() => null)) as {
        error?: string;
      } | null;

      if (!response.ok) {
        setMessage(payload?.error ?? 'Login failed.');
        return;
      }

      window.location.assign(nextPath);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-white">
      <form
        onSubmit={(event) => void handleSubmit(event)}
        className="w-full max-w-sm rounded-lg border border-slate-800 bg-slate-900 p-6 shadow-2xl"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-cyan-500 text-slate-950">
            <LockKeyhole className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Tunacosplay Console</h1>
            <p className="mt-1 text-sm text-slate-400">Restricted access</p>
          </div>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-slate-200">
            Username
          </span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            className={inputClassName}
            required
          />
        </label>

        <label className="mt-4 block">
          <span className="mb-1.5 block text-sm font-medium text-slate-200">
            Password
          </span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className={inputClassName}
            required
            type="password"
          />
        </label>

        {message && (
          <div className="mt-4 rounded-lg bg-rose-950 p-3 text-sm font-medium text-rose-200">
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-cyan-500 px-4 text-sm font-bold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-70"
        >
          <LogIn className="h-4 w-4" aria-hidden="true" />
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
    </main>
  );
}

const inputClassName =
  'h-11 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20';
