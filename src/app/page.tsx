import { posts } from '@/data/posts';
import { PostGrid } from '@/components/PostGrid';

export default function HomePage() {
  return (
    <div className="w-full bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#170C79]">
            Tunacosplay Gallery
          </h1>
          <p className="mt-2 text-[#56B6C6]">
            Explore amazing cosplay collections
          </p>
        </div>

        <PostGrid posts={posts} />
      </div>
    </div>
  );
}
