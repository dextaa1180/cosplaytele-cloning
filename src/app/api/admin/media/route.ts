import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { getSupabaseAdminClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const localUploadsDirectory = path.join(
  process.cwd(),
  'public',
  'uploads',
  'tunacosplay',
);

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file');

  if (!(file instanceof File)) {
    return Response.json({ error: 'File is required.' }, { status: 400 });
  }

  if (!isAllowedMediaType(file.type)) {
    return Response.json(
      { error: 'Only image and video files are supported.' },
      { status: 400 },
    );
  }

  const kind = stringValue(formData.get('kind')) || 'media';
  const slug = stringValue(formData.get('slug'));
  const draftId = stringValue(formData.get('draftId'));
  const scope = sanitizePathSegment(slug || draftId || 'draft');
  const fileName = createStoredFileName(kind, file.name);
  const storagePath = `${scope}/${fileName}`;
  const supabase = getSupabaseAdminClient();

  if (supabase) {
    const bucket = process.env.SUPABASE_STORAGE_BUCKET || 'tunacosplay-media';
    const { error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (error) {
      return Response.json({ error: error.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    return Response.json({
      path: storagePath,
      source: 'supabase',
      url: data.publicUrl,
    });
  }

  const scopedDirectory = path.join(localUploadsDirectory, scope);
  await mkdir(scopedDirectory, { recursive: true });
  await writeFile(
    path.join(scopedDirectory, fileName),
    Buffer.from(await file.arrayBuffer()),
  );

  return Response.json({
    path: storagePath,
    source: 'local',
    url: `/uploads/tunacosplay/${scope}/${fileName}`,
  });
}

function stringValue(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : '';
}

function isAllowedMediaType(type: string) {
  return type.startsWith('image/') || type.startsWith('video/');
}

function createStoredFileName(kind: string, originalName: string) {
  const safeKind = sanitizePathSegment(kind || 'media');
  const safeOriginalName = sanitizeFileName(originalName || 'upload');
  return `${safeKind}-${randomUUID()}-${safeOriginalName}`;
}

function sanitizePathSegment(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'draft';
}

function sanitizeFileName(value: string) {
  const extension = path.extname(value).toLowerCase();
  const baseName = path.basename(value, extension);
  const safeBaseName =
    baseName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80) || 'upload';

  return `${safeBaseName}${extension}`;
}
