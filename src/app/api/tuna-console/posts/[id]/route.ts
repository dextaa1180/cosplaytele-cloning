import { revalidatePath } from 'next/cache';
import { ADMIN_DASHBOARD_PATH } from '@/lib/admin-auth';
import type { AdminPostDraft } from '@/lib/admin-drafts';
import {
  deletePublishedPost,
  getManagedPostById,
  managedPostToDraft,
  publishAdminDraft,
} from '@/lib/published-posts';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const post = await getManagedPostById(id);

  if (!post) {
    return Response.json({ error: 'Post not found.' }, { status: 404 });
  }

  return Response.json({ draft: managedPostToDraft(post), post });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const draft = (await request.json()) as AdminPostDraft;

    if (draft.id !== id) {
      return Response.json({ error: 'Post id mismatch.' }, { status: 400 });
    }

    const posts = await publishAdminDraft(draft);
    revalidateAdminPostPaths(draft);

    return Response.json({ posts });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const post = await getManagedPostById(id);

    if (!post) {
      return Response.json({ error: 'Post not found.' }, { status: 404 });
    }

    const posts = await deletePublishedPost(id);

    revalidatePath('/');
    revalidatePath(ADMIN_DASHBOARD_PATH);
    revalidatePath('/explore-categories');
    revalidatePath(`/${post.slug}`);
    revalidatePath(`/category/${post.category}`);

    return Response.json({ posts });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

function revalidateAdminPostPaths(draft: AdminPostDraft) {
  revalidatePath('/');
  revalidatePath(ADMIN_DASHBOARD_PATH);
  revalidatePath('/explore-categories');
  revalidatePath(`/${draft.slug}`);
  revalidatePath(`/category/${draft.category}`);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to update post.';
}
