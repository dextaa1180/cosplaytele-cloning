import { notFound } from 'next/navigation';
import { AdminPostEditor } from '@/components/admin/AdminPostEditor';
import { getManagedPostById, managedPostToDraft } from '@/lib/published-posts';

export const dynamic = 'force-dynamic';

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getManagedPostById(id);

  if (!post) {
    notFound();
  }

  return <AdminPostEditor initialDraft={managedPostToDraft(post)} mode="edit" />;
}
