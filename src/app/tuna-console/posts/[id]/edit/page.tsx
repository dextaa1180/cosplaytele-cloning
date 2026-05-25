import { notFound } from 'next/navigation';
import { AdminPostEditor } from '@/components/admin/AdminPostEditor';
import {
  getManagedPostById,
  getRecentPostTags,
  managedPostToDraft,
} from '@/lib/published-posts';

export const dynamic = 'force-dynamic';

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [post, recentTagOptions] = await Promise.all([
    getManagedPostById(id),
    getRecentPostTags(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <AdminPostEditor
      initialDraft={managedPostToDraft(post)}
      mode="edit"
      recentTagOptions={recentTagOptions}
    />
  );
}
