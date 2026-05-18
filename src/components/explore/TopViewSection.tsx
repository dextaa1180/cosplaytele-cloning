'use client';

import { useState } from 'react';
import { Post } from '@/types';
import { PostCard } from '@/components/PostCard';
import { SectionTitle } from './SectionTitle';

interface TopViewSectionProps {
  posts24h: Post[];
  posts3d: Post[];
  posts7d: Post[];
}

export function TopViewSection({
  posts24h,
  posts3d,
  posts7d,
}: TopViewSectionProps) {
  const [activeTab, setActiveTab] = useState<'24h' | '3d' | '7d'>('24h');

  const currentPosts =
    activeTab === '24h' ? posts24h : activeTab === '3d' ? posts3d : posts7d;

  return (
    <section className="mb-12">
      <SectionTitle title="TOP VIEW" />

      {/* Tabs */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={() => setActiveTab('24h')}
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            activeTab === '24h'
              ? 'bg-red-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          24 Hours
        </button>
        <button
          onClick={() => setActiveTab('3d')}
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            activeTab === '3d'
              ? 'bg-red-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          3 Days
        </button>
        <button
          onClick={() => setActiveTab('7d')}
          className={`rounded-lg px-4 py-2 font-medium transition-colors ${
            activeTab === '7d'
              ? 'bg-red-600 text-white'
              : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600'
          }`}
        >
          7 Days
        </button>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {currentPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </section>
  );
}
