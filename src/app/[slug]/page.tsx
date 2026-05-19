import { DetailPostLayout } from '@/components/detail/DetailPostLayout';
import { posts } from '@/data/posts';

interface DetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export function generateStaticParams() {
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function DetailPage({ params }: DetailPageProps) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Post not found
        </h1>
      </div>
    );
  }

  return (
    <DetailPostLayout
      title={post.title}
      cosplayer={post.cosplayer}
      character={post.character}
      source={post.source}
      photoCount={post.photoCount}
      videoCount={post.videoCount}
      thumbnail={post.thumbnail}
      tags={post.tags}
      fileSize={post.fileSize}
      unzipPassword={post.unzipPassword}
      downloadLinks={post.downloadLinks}
      previewMedia={post.previewMedia}
      heroImage={post.heroImage}
      description={post.description}
    />
  );
}
