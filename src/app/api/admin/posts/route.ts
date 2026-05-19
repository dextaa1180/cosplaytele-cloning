import { revalidatePath } from 'next/cache';
import type { AdminPostDraft } from '@/lib/admin-drafts';
import { getPublishedPosts, publishAdminDraft } from '@/lib/published-posts';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const posts = await getPublishedPosts();
  return Response.json({ posts });
}

export async function POST(request: Request) {
  const draft = (await request.json()) as AdminPostDraft;
  const error = validatePublishPayload(draft);

  if (error) {
    return Response.json({ error }, { status: 400 });
  }

  const posts = await publishAdminDraft({
    ...draft,
    status: 'published',
  });

  revalidatePath('/');
  revalidatePath('/admin');
  revalidatePath('/explore-categories');
  revalidatePath(`/${draft.slug}`);
  revalidatePath(`/category/${draft.category}`);

  return Response.json({ posts });
}

function validatePublishPayload(draft: AdminPostDraft) {
  if (!draft.title?.trim()) return 'Title is required.';
  if (!draft.slug?.trim()) return 'Slug is required.';
  if (!draft.cosplayer?.trim()) return 'Cosplayer is required.';
  if (!draft.character?.trim()) return 'Character is required.';
  if (!draft.source?.trim()) return 'Source is required.';
  if (!draft.thumbnailUrl?.trim()) return 'Thumbnail URL is required.';
  return null;
}
