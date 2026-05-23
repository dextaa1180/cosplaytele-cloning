import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type StorageUploadBody = BodyInit | ReadableStream<Uint8Array>;
type StreamingRequestInit = RequestInit & { duplex?: 'half' };

const localUploadsDirectory = path.join(
  process.cwd(),
  'public',
  'uploads',
  'tunacosplay',
);

export async function POST(request: Request) {
  try {
    if (request.headers.get('x-tunacosplay-upload') === 'raw') {
      return await uploadRawMedia(request);
    }

    const formData = await readUploadFormData(request);
    const file = formData.get('file');

    if (!isUploadFile(file)) {
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
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    if (isSupabaseStorageConfigured()) {
      const bucket = getStorageBucket();
      await uploadToSupabaseStorage(storagePath, file.type, fileBuffer);
      return Response.json({
        path: storagePath,
        source: 'supabase',
        url: createPublicStorageUrl(bucket, storagePath) || createSupabasePublicUrl(bucket, storagePath),
      });
    }

    const scopedDirectory = path.join(localUploadsDirectory, scope);
    await mkdir(scopedDirectory, { recursive: true });
    await writeFile(path.join(scopedDirectory, fileName), fileBuffer);

    return Response.json({
      path: storagePath,
      source: 'local',
      url: `/uploads/tunacosplay/${scope}/${fileName}`,
    });
  } catch (error) {
    return Response.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

async function uploadRawMedia(request: Request) {
  const fileNameHeader = request.headers.get('x-file-name') || 'upload';
  const fileName = decodeHeaderValue(fileNameHeader) || 'upload';
  const contentType = request.headers.get('content-type') || 'application/octet-stream';

  if (!isAllowedMediaType(contentType)) {
    return Response.json(
      { error: 'Only image and video files are supported.' },
      { status: 400 },
    );
  }

  const body = request.body;
  if (!body) {
    return Response.json(
      { error: 'Upload request did not include a file body.' },
      { status: 400 },
    );
  }

  const kind = sanitizePathSegment(request.headers.get('x-kind') || 'media');
  const slug = decodeHeaderValue(request.headers.get('x-slug') || '');
  const draftId = decodeHeaderValue(request.headers.get('x-draft-id') || '');
  const scope = sanitizePathSegment(slug || draftId || 'draft');
  const storedFileName = createStoredFileName(kind, fileName);
  const storagePath = `${scope}/${storedFileName}`;

  if (isSupabaseStorageConfigured()) {
    const bucket = getStorageBucket();
    await uploadToSupabaseStorage(storagePath, contentType, body);
    return Response.json({
      path: storagePath,
      source: 'supabase',
      url: createPublicStorageUrl(bucket, storagePath) || createSupabasePublicUrl(bucket, storagePath),
    });
  }

  const fileBuffer = Buffer.from(await request.arrayBuffer());
  const scopedDirectory = path.join(localUploadsDirectory, scope);
  await mkdir(scopedDirectory, { recursive: true });
  await writeFile(path.join(scopedDirectory, storedFileName), fileBuffer);

  return Response.json({
    path: storagePath,
    source: 'local',
    url: `/uploads/tunacosplay/${scope}/${storedFileName}`,
  });
}

async function readUploadFormData(request: Request) {
  try {
    return await request.formData();
  } catch (error) {
    throw new Error(
      'Upload request was interrupted before the server could read the file. Try uploading fewer files at once, or use smaller/compressed media.',
      { cause: error },
    );
  }
}

function isSupabaseStorageConfigured() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

function getStorageBucket() {
  return process.env.SUPABASE_STORAGE_BUCKET || 'tunacosplay-media';
}

async function uploadToSupabaseStorage(
  storagePath: string,
  contentType: string,
  body: StorageUploadBody,
) {
  const supabaseUrl = process.env.SUPABASE_URL?.replace(/\/+$/, '');
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase storage is not configured.');
  }

  const bucket = getStorageBucket();
  const uploadUrl = `${supabaseUrl}/storage/v1/object/${encodeStoragePath(
    bucket,
  )}/${encodeStoragePath(storagePath)}`;
  const uploadRequestInit: StreamingRequestInit = {
    method: 'POST',
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Cache-Control': '3600',
      'Content-Type': contentType,
      'x-upsert': 'true',
    },
    body,
    duplex: body instanceof ReadableStream ? 'half' : undefined,
  };
  const response = await fetch(uploadUrl, uploadRequestInit);

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(parseStorageError(responseText) || `Storage upload failed with status ${response.status}.`);
  }
}

function parseStorageError(responseText: string) {
  try {
    const payload = JSON.parse(responseText) as { error?: string; message?: string };
    return payload.error || payload.message || '';
  } catch {
    return responseText.trim().slice(0, 240);
  }
}

function encodeStoragePath(value: string) {
  return value.split('/').map(encodeURIComponent).join('/');
}

function decodeHeaderValue(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function stringValue(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : '';
}

function isAllowedMediaType(type: string) {
  return type.startsWith('image/') || type.startsWith('video/');
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === 'object' &&
    value !== null &&
    'arrayBuffer' in value &&
    typeof value.arrayBuffer === 'function' &&
    'name' in value &&
    typeof value.name === 'string' &&
    'type' in value &&
    typeof value.type === 'string'
  );
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

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unable to upload media.';
}

function createPublicStorageUrl(bucket: string, storagePath: string) {
  const baseUrl = process.env.PUBLIC_STORAGE_BASE_URL?.trim();
  if (!baseUrl) {
    return '';
  }

  return `${baseUrl.replace(/\/+$/, '')}/storage/v1/object/public/${bucket}/${storagePath}`;
}

function createSupabasePublicUrl(bucket: string, storagePath: string) {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  if (!supabaseUrl) {
    return '';
  }

  return `${supabaseUrl.replace(/\/+$/, '')}/storage/v1/object/public/${bucket}/${storagePath}`;
}
