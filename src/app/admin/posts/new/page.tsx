import { AdminPostEditor } from '@/components/admin/AdminPostEditor';
import { getRecentPostTags } from '@/lib/published-posts';

export const dynamic = 'force-dynamic';

export default async function NewAdminPostPage() {
  const recentTagOptions = await getRecentPostTags();

  return <AdminPostEditor recentTagOptions={recentTagOptions} />;
}
