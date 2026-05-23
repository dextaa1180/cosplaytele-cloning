import { revalidatePath } from 'next/cache';
import { ADMIN_DASHBOARD_PATH } from '@/lib/admin-auth';
import type { AdminPostDraft } from '@/lib/admin-drafts';
import { getManagedPostById, getManagedPosts, publishAdminDraft } from '@/lib/published-posts';
import { deleteTelegramPostMessage, syncTelegramPostMessage } from '@/lib/telegram';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const posts = await getManagedPosts();
  return Response.json({ posts });
}

export async function POST(request: Request) {
  try {
    const draft = (await request.json()) as AdminPostDraft;
    const normalizedDraft = {
      ...draft,
      thumbnailUrl: getPublishThumbnailUrl(draft),
      status: draft.status ?? ('published' as const),
    };
    const error = validatePublishPayload(normalizedDraft);

    if (error) {
      return Response.json({ error }, { status: 400 });
    }

    const existingPost = await getManagedPostById(normalizedDraft.id);
    const posts = await publishAdminDraft(normalizedDraft);
    await syncTelegramSafely(normalizedDraft, existingPost?.status);

    revalidatePath('/');
    revalidatePath(ADMIN_DASHBOARD_PATH);
    revalidatePath('/explore-categories');
    revalidatePath(`/${normalizedDraft.slug}`);
    revalidatePath(`/category/${normalizedDraft.category}`);

    return Response.json({ posts });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

async function syncTelegramSafely(
  draft: AdminPostDraft,
  previousStatus: AdminPostDraft['status'] | undefined,
) {
  try {
    await syncTelegramAfterPublish(draft, previousStatus);
  } catch (error) {
    console.error('Unable to sync Telegram post notification.', error);
  }
}

async function syncTelegramAfterPublish(
  draft: AdminPostDraft,
  previousStatus: AdminPostDraft['status'] | undefined,
) {
  if (draft.status === 'published') {
    await syncTelegramPostMessage(draft);
    return;
  }

  if (previousStatus === 'published') {
    await deleteTelegramPostMessage(draft.id);
  }
}

function validatePublishPayload(draft: AdminPostDraft) {
  if (!draft.title?.trim()) return 'Title is required.';
  if (!draft.slug?.trim()) return 'Slug is required.';
  if (!draft.cosplayer?.trim()) return 'Cosplayer is required.';
  if (!draft.character?.trim()) return 'Character is required.';
  if (!draft.source?.trim()) return 'Source is required.';
  if (!draft.thumbnailUrl?.trim()) {
    return 'Thumbnail URL or uploaded preview image is required.';
  }
  return null;
}

function getPublishThumbnailUrl(draft: AdminPostDraft) {
  return (
    draft.thumbnailUrl?.trim() ||
    draft.previewMedia.find((media) => media.type === 'image' && media.url)?.url ||
    draft.previewMedia.find((media) => media.url)?.url ||
    ''
  );
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to publish post.';
}
