import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { AdminPostDraft } from '@/lib/admin-drafts';
import {
  deleteSupabaseDraft,
  listSupabaseDrafts,
  upsertSupabaseDraft,
} from '@/lib/supabase/drafts';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const draftsDirectory = path.join(process.cwd(), '.data');
const draftsFile = path.join(draftsDirectory, 'admin-post-drafts.json');

export async function GET() {
  const supabaseDrafts = await listSupabaseDrafts();
  if (supabaseDrafts) {
    return Response.json({ drafts: supabaseDrafts, source: 'supabase' });
  }

  const drafts = await readDrafts();
  return Response.json({ drafts, source: 'local' });
}

export async function POST(request: Request) {
  const draft = (await request.json()) as AdminPostDraft;
  const supabaseDrafts = await upsertSupabaseDraft(draft);
  if (supabaseDrafts) {
    return Response.json({ drafts: supabaseDrafts, source: 'supabase' });
  }

  const drafts = await readDrafts();
  const index = drafts.findIndex((item) => item.id === draft.id);

  if (index >= 0) {
    drafts[index] = draft;
  } else {
    drafts.unshift(draft);
  }

  await writeDrafts(drafts);
  return Response.json({ drafts, source: 'local' });
}

export async function DELETE(request: Request) {
  const id = new URL(request.url).searchParams.get('id');

  if (!id) {
    return Response.json({ error: 'Draft id is required.' }, { status: 400 });
  }

  const supabaseDrafts = await deleteSupabaseDraft(id);
  if (supabaseDrafts) {
    return Response.json({ drafts: supabaseDrafts, source: 'supabase' });
  }

  const drafts = (await readDrafts()).filter((draft) => draft.id !== id);
  await writeDrafts(drafts);
  return Response.json({ drafts, source: 'local' });
}

async function readDrafts() {
  try {
    const contents = await readFile(draftsFile, 'utf8');
    const parsed: unknown = JSON.parse(contents);
    return Array.isArray(parsed) ? (parsed as AdminPostDraft[]) : [];
  } catch (error) {
    if (isNotFoundError(error)) {
      return [];
    }

    throw error;
  }
}

async function writeDrafts(drafts: AdminPostDraft[]) {
  await mkdir(draftsDirectory, { recursive: true });
  await writeFile(draftsFile, JSON.stringify(drafts, null, 2));
}

function isNotFoundError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'ENOENT'
  );
}
