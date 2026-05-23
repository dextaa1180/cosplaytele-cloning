'use client';

import imageCompression from 'browser-image-compression';
import { ChangeEvent, useMemo, useState } from 'react';
import {
  Check,
  FileImage,
  Film,
  GripVertical,
  LinkIcon,
  Save,
  Send,
  Upload,
} from 'lucide-react';
import { Category, Tag } from '@/types';
import {
  AdminDraftMedia,
  AdminPostDraft,
  publishAdminPost,
  saveAdminDraft,
  slugifyTitle,
  uploadAdminMedia,
} from '@/lib/admin-drafts';
import { cn } from '@/lib/utils';

type DraftMedia = AdminDraftMedia & {
  objectUrl?: string;
};

type UploadFeedbackTone = 'error' | 'info' | 'success';

type VideoWithCaptureStream = HTMLVideoElement & {
  captureStream?: () => MediaStream;
  mozCaptureStream?: () => MediaStream;
};

const categories: Category[] = ['cosplay', 'video-cosplayy', 'cosplay-ero', 'nude'];
const tags: Tag[] = ['cosplay-game', 'cosplay-anime-manga', 'cosplay-freestyle', 'video'];
const defaultSelectedTags: Tag[] = ['cosplay-game'];
const maxPreviewVideoDurationSeconds = 60;
const compressibleImageTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/bmp',
]);

interface AdminPostEditorProps {
  initialDraft?: AdminPostDraft;
  mode?: 'create' | 'edit';
}

export function AdminPostEditor({
  initialDraft,
  mode = 'create',
}: AdminPostEditorProps = {}) {
  const [draftId, setDraftId] = useState(() => initialDraft?.id ?? createDraftId());
  const [createdAt, setCreatedAt] = useState(
    () => initialDraft?.createdAt ?? new Date().toISOString(),
  );
  const [title, setTitle] = useState(initialDraft?.title ?? '');
  const [slug, setSlug] = useState(initialDraft?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(Boolean(initialDraft?.slug));
  const [cosplayer, setCosplayer] = useState(initialDraft?.cosplayer ?? '');
  const [character, setCharacter] = useState(initialDraft?.character ?? '');
  const [source, setSource] = useState(initialDraft?.source ?? '');
  const [category, setCategory] = useState<Category>(initialDraft?.category ?? 'cosplay');
  const [selectedTags, setSelectedTags] = useState<Tag[]>(
    initialDraft?.tags.length ? initialDraft.tags : [...defaultSelectedTags],
  );
  const [postStatus, setPostStatus] = useState<AdminPostDraft['status']>(
    initialDraft?.status ?? 'published',
  );
  const [photoCount, setPhotoCount] = useState(initialDraft?.photoCount ?? 0);
  const [videoCount, setVideoCount] = useState(initialDraft?.videoCount ?? 0);
  const [fileSize, setFileSize] = useState(initialDraft?.fileSize ?? '');
  const [unzipPassword, setUnzipPassword] = useState(
    initialDraft?.unzipPassword ?? 'cosplaytele',
  );
  const [description, setDescription] = useState(initialDraft?.description ?? '');
  const [thumbnailName, setThumbnailName] = useState(
    initialDraft?.thumbnailUrl ? 'Current thumbnail' : '',
  );
  const [heroName, setHeroName] = useState(
    initialDraft?.heroImageUrl ? 'Current hero image' : '',
  );
  const [thumbnailUrl, setThumbnailUrl] = useState(initialDraft?.thumbnailUrl ?? '');
  const [heroImageUrl, setHeroImageUrl] = useState(initialDraft?.heroImageUrl ?? '');
  const [downloadLinks, setDownloadLinks] = useState(() =>
    initialDraft?.downloadLinks ?? createEmptyDownloadLinks(),
  );
  const [previewMedia, setPreviewMedia] = useState<DraftMedia[]>(
    () => initialDraft?.previewMedia ?? [],
  );
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [saveMessage, setSaveMessage] = useState('');
  const [previewUploadFeedback, setPreviewUploadFeedback] = useState<{
    message: string;
    tone: UploadFeedbackTone;
  } | null>(null);
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const counts = useMemo(
    () => ({
      images: previewMedia.filter((media) => media.type === 'image').length,
      videos: previewMedia.filter((media) => media.type === 'video').length,
    }),
    [previewMedia],
  );

  const fallbackThumbnailUrl = useMemo(
    () =>
      previewMedia.find((media) => media.type === 'image' && media.url)?.url ??
      previewMedia.find((media) => media.url)?.url ??
      '',
    [previewMedia],
  );

  const storageShape = useMemo(
    () => ({
      title,
      slug,
      category,
      tags: selectedTags,
      status: postStatus,
      thumbnailUrl: thumbnailUrl || fallbackThumbnailUrl,
      heroImageUrl,
      previewMedia: previewMedia.map(toStoredMedia),
      downloadLinks,
    }),
    [category, downloadLinks, fallbackThumbnailUrl, heroImageUrl, postStatus, previewMedia, selectedTags, slug, thumbnailUrl, title],
  );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugifyTitle(value));
    }
    clearFeedback();
  };

  const handlePreviewFiles = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const mediaFiles = files.filter(
      (file) => file.type.startsWith('image/') || file.type.startsWith('video/'),
    );

    if (mediaFiles.length === 0) {
      event.target.value = '';
      return;
    }

    setUploading(true);
    clearFeedback();

    try {
      const startingOrder = previewMedia.length;
      const uploadedMedia: DraftMedia[] = [];
      const setPreviewStatus = (
        message: string,
        tone: UploadFeedbackTone = 'info',
      ) => {
        setPreviewUploadFeedback({ message, tone });
      };

      for (const file of mediaFiles) {
        setPreviewStatus(
          `Preparing preview media ${uploadedMedia.length + 1} of ${mediaFiles.length}...`,
        );

        const type = file.type.startsWith('video/') ? 'video' : 'image';
        const videoPreview =
          type === 'video'
            ? await prepareVideoPreviewForUpload(file, setPreviewStatus)
            : null;
        const uploadFile =
          type === 'image'
            ? await compressPreviewImageWithStatus(file, setPreviewStatus)
            : videoPreview?.file ?? file;
        setPreviewStatus(
          `Uploading preview media ${uploadedMedia.length + 1} of ${mediaFiles.length} (${formatBytes(uploadFile.size)})...`,
        );

        const objectUrl = URL.createObjectURL(uploadFile);
        const uploaded = await uploadAdminMedia(uploadFile, {
          draftId,
          kind: 'preview',
          onUploadProgress: ({ loaded, percent, total }) => {
            setPreviewStatus(
              percent >= 100
                ? `Preview media ${uploadedMedia.length + 1} of ${mediaFiles.length}: ${formatBytes(total)} sent to server (100%). Waiting for storage provider...`
                : `Uploading preview media ${uploadedMedia.length + 1} of ${mediaFiles.length}: ${formatBytes(loaded)} / ${formatBytes(total)} (${percent}%).`,
            );
          },
          slug,
        });
        const media = {
          id: createDraftId(),
          type,
          fileName: uploadFile.name,
          fileSize: uploadFile.size,
          url: uploaded.url,
          posterUrl: uploaded.posterUrl,
          alt: uploadFile.name.replace(/\.[^.]+$/, ''),
          duration:
            type === 'video'
              ? formatDurationLabel(videoPreview?.durationSeconds)
              : undefined,
          sortOrder: startingOrder + uploadedMedia.length + 1,
          storageStatus: 'uploaded',
          objectUrl,
        } satisfies DraftMedia;

        uploadedMedia.push(media);
        setPreviewMedia((current) => [...current, media]);
        setPreviewStatus(
          `Preview media ${uploadedMedia.length} of ${mediaFiles.length} uploaded successfully.`,
          'success',
        );
      }

      setPreviewStatus(
        `${uploadedMedia.length} preview media uploaded successfully.`,
        'success',
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Preview media could not be uploaded.';
      setPreviewUploadFeedback({
        message,
        tone: 'error',
      });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const handleCoverUpload = async (
    file: File | undefined,
    kind: 'thumbnail' | 'hero',
  ) => {
    if (!file) {
      if (kind === 'thumbnail') {
        setThumbnailName('');
        setThumbnailUrl('');
      } else {
        setHeroName('');
        setHeroImageUrl('');
      }
      clearFeedback();
      return;
    }

    setUploading(true);
    clearFeedback();

    try {
      setSaveMessage(`Preparing ${kind === 'thumbnail' ? 'thumbnail' : 'hero image'}...`);
      const uploadFile = await compressImageForUpload(file, 'cover');
      setSaveMessage(
        `Uploading ${kind === 'thumbnail' ? 'thumbnail' : 'hero image'} (${formatBytes(uploadFile.size)})...`,
      );

      const uploaded = await uploadAdminMedia(uploadFile, {
        draftId,
        kind,
        slug,
      });

      if (kind === 'thumbnail') {
        setThumbnailName(uploadFile.name);
        setThumbnailUrl(uploaded.url);
      } else {
        setHeroName(uploadFile.name);
        setHeroImageUrl(uploaded.url);
      }

      setSaveMessage(`${kind === 'thumbnail' ? 'Thumbnail' : 'Hero image'} uploaded.`);
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : 'Cover media could not be uploaded.');
    } finally {
      setUploading(false);
    }
  };

  const toggleTag = (tag: Tag) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
    clearFeedback();
  };

  const removeMedia = (id: string) => {
    setPreviewMedia((current) => {
      const next = current.filter((media) => media.id !== id);
      return next.map((media, index) => ({
        ...media,
        sortOrder: index + 1,
      }));
    });
    clearFeedback();
  };

  const handleDownloadLinkChange = (
    key: keyof typeof downloadLinks,
    value: string,
  ) => {
    setDownloadLinks((current) => ({
      ...current,
      [key]: value,
    }));
    clearFeedback();
  };

  const handleValidate = () => {
    const messages = validateDraft();
    setValidationMessages(messages);
    setSaveMessage(messages.length === 0 ? 'Draft schema is valid.' : '');
    return messages.length === 0;
  };

  const handleSaveDraft = async () => {
    const messages = validateDraft();
    setValidationMessages(messages);
    setSaving(true);

    try {
      await saveAdminDraft(buildDraft('draft'));
      setSaveMessage(
        messages.length > 0
          ? `Draft saved with ${messages.length} validation item${messages.length === 1 ? '' : 's'} remaining.`
          : 'Draft saved. It will appear on the admin dashboard.',
      );
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : 'Draft could not be saved.');
    } finally {
      setSaving(false);
    }
  };

  const handlePublishPost = async () => {
    const messages = validateDraft();
    setValidationMessages(messages);

    if (messages.length > 0) {
      setSaveMessage('');
      return;
    }

    setPublishing(true);

    try {
      await publishAdminPost(buildDraft(postStatus));
      if (mode === 'edit') {
        setSaveMessage('Content updated.');
      } else {
        resetCreateForm();
        setSaveMessage('Post published. The form is ready for a new post.');
      }
    } catch (error) {
      setSaveMessage(error instanceof Error ? error.message : 'Post could not be published.');
    } finally {
      setPublishing(false);
    }
  };

  const resetCreateForm = () => {
    previewMedia.forEach((media) => {
      if (media.objectUrl) {
        URL.revokeObjectURL(media.objectUrl);
      }
    });

    setDraftId(createDraftId());
    setCreatedAt(new Date().toISOString());
    setTitle('');
    setSlug('');
    setSlugTouched(false);
    setCosplayer('');
    setCharacter('');
    setSource('');
    setCategory('cosplay');
    setSelectedTags([...defaultSelectedTags]);
    setPostStatus('published');
    setPhotoCount(0);
    setVideoCount(0);
    setFileSize('');
    setUnzipPassword('cosplaytele');
    setDescription('');
    setThumbnailName('');
    setHeroName('');
    setThumbnailUrl('');
    setHeroImageUrl('');
    setDownloadLinks(createEmptyDownloadLinks());
    setPreviewMedia([]);
    setValidationMessages([]);
    setPreviewUploadFeedback(null);
  };

  const clearFeedback = () => {
    setValidationMessages([]);
    setSaveMessage('');
    setPreviewUploadFeedback(null);
  };

  const buildDraft = (status: AdminPostDraft['status']): AdminPostDraft => {
    const now = new Date().toISOString();

    return {
      id: draftId,
      title,
      slug,
      cosplayer,
      character,
      source,
      category,
      tags: selectedTags,
      photoCount,
      videoCount,
      thumbnailUrl: thumbnailUrl || fallbackThumbnailUrl,
      heroImageUrl,
      fileSize,
      unzipPassword,
      description,
      downloadLinks,
      previewMedia: previewMedia.map(toStoredMedia),
      status,
      createdAt,
      updatedAt: now,
    };
  };

  const validateDraft = () => {
    const messages: string[] = [];

    if (!title.trim()) messages.push('Title is required.');
    if (!slug.trim()) messages.push('Slug is required.');
    if (!cosplayer.trim()) messages.push('Cosplayer is required.');
    if (!character.trim()) messages.push('Character is required.');
    if (!source.trim()) messages.push('Source is required.');
    if (!thumbnailName && !thumbnailUrl.trim() && !fallbackThumbnailUrl) {
      messages.push('Thumbnail image, thumbnail URL, or at least one uploaded preview image is required.');
    }
    if (previewMedia.length === 0) {
      messages.push('Add at least one preview photo or video.');
    }

    return messages;
  };

  return (
    <div className="w-full min-w-0 overflow-x-hidden bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl min-w-0 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
              {mode === 'edit' ? 'Edit Content' : 'New Post'}
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              {mode === 'edit'
                ? 'Update metadata, media, status, and download links.'
                : 'Draft the content shape before publishing it to the site.'}
            </p>
          </div>
          <div className="grid min-w-0 gap-2 sm:flex">
            <button
              type="button"
              onClick={handleValidate}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <Check className="h-4 w-4" aria-hidden="true" />
              Validate Draft
            </button>
            <button
              type="button"
              onClick={() => void handleSaveDraft()}
              disabled={saving || publishing || uploading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              type="button"
              onClick={() => void handlePublishPost()}
              disabled={saving || publishing || uploading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Send className="h-4 w-4" aria-hidden="true" />
              {publishing ? 'Saving...' : mode === 'edit' ? 'Save Changes' : 'Post'}
            </button>
          </div>
        </div>

        <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <form className="min-w-0 space-y-6">
            <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-base font-semibold text-slate-950 dark:text-white">
                Metadata
              </h2>
              <div className="grid min-w-0 gap-4 md:grid-cols-2">
                <Field label="Title">
                  <input
                    value={title}
                    onChange={(event) => handleTitleChange(event.target.value)}
                    className={inputClassName}
                    placeholder="Cosplayer cosplay Character - Source"
                  />
                </Field>
                <Field label="Slug">
                  <input
                    value={slug}
                    onChange={(event) => {
                      setSlug(slugifyTitle(event.target.value));
                      setSlugTouched(true);
                      clearFeedback();
                    }}
                    className={inputClassName}
                    placeholder="cosplayer-character-source"
                  />
                </Field>
                <Field label="Cosplayer">
                  <input
                    value={cosplayer}
                    onChange={(event) => {
                      setCosplayer(event.target.value);
                      clearFeedback();
                    }}
                    className={inputClassName}
                    placeholder="Name"
                  />
                </Field>
                <Field label="Character">
                  <input
                    value={character}
                    onChange={(event) => {
                      setCharacter(event.target.value);
                      clearFeedback();
                    }}
                    className={inputClassName}
                    placeholder="Character"
                  />
                </Field>
                <Field label="Source">
                  <input
                    value={source}
                    onChange={(event) => {
                      setSource(event.target.value);
                      clearFeedback();
                    }}
                    className={inputClassName}
                    placeholder="Game / anime / manga"
                  />
                </Field>
                <Field label="Category">
                  <select
                    value={category}
                    onChange={(event) => {
                      setCategory(event.target.value as Category);
                      clearFeedback();
                    }}
                    className={inputClassName}
                  >
                    {categories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <select
                    value={postStatus}
                    onChange={(event) => {
                      setPostStatus(event.target.value as AdminPostDraft['status']);
                      clearFeedback();
                    }}
                    className={inputClassName}
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </Field>
                <Field label="Photo Count">
                  <input
                    value={photoCount}
                    onChange={(event) => {
                      setPhotoCount(Number(event.target.value));
                      clearFeedback();
                    }}
                    className={inputClassName}
                    min={0}
                    type="number"
                  />
                </Field>
                <Field label="Video Count">
                  <input
                    value={videoCount}
                    onChange={(event) => {
                      setVideoCount(Number(event.target.value));
                      clearFeedback();
                    }}
                    className={inputClassName}
                    min={0}
                    type="number"
                  />
                </Field>
                <Field label="File Size">
                  <input
                    value={fileSize}
                    onChange={(event) => {
                      setFileSize(event.target.value);
                      clearFeedback();
                    }}
                    className={inputClassName}
                    placeholder="1.2 GB"
                  />
                </Field>
                <Field label="Unzip Password">
                  <input
                    value={unzipPassword}
                    onChange={(event) => {
                      setUnzipPassword(event.target.value);
                      clearFeedback();
                    }}
                    className={inputClassName}
                  />
                </Field>
              </div>

              <Field label="Description">
                <textarea
                  value={description}
                  onChange={(event) => {
                    setDescription(event.target.value);
                    clearFeedback();
                  }}
                  className={cn(inputClassName, 'mt-4 h-24 py-3')}
                  placeholder="Preview-only notice or short post description"
                />
              </Field>

              <div className="mt-4">
                <p className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
                  Tags
                </p>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={cn(
                        'rounded-full border px-3 py-1.5 text-xs font-semibold transition',
                        selectedTags.includes(tag)
                          ? 'border-slate-950 bg-slate-950 text-white dark:border-white dark:bg-white dark:text-slate-950'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800',
                      )}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </section>

            <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-base font-semibold text-slate-950 dark:text-white">
                Cover Media
              </h2>
              <div className="grid min-w-0 gap-4 md:grid-cols-2">
                <UploadBox
                  label="Thumbnail"
                  accept="image/*"
                  fileName={thumbnailName}
                  disabled={uploading}
                  onChange={(file) => void handleCoverUpload(file, 'thumbnail')}
                />
                <UploadBox
                  label="Hero Image"
                  accept="image/*"
                  fileName={heroName}
                  disabled={uploading}
                  onChange={(file) => void handleCoverUpload(file, 'hero')}
                />
              </div>
              <div className="mt-4 grid min-w-0 gap-4 md:grid-cols-2">
                <Field label="Thumbnail URL">
                  <input
                    value={thumbnailUrl}
                    onChange={(event) => {
                      setThumbnailUrl(event.target.value);
                      clearFeedback();
                    }}
                    className={inputClassName}
                    placeholder="/images/tunacosplay/example.svg"
                  />
                </Field>
                <Field label="Hero Image URL">
                  <input
                    value={heroImageUrl}
                    onChange={(event) => {
                      setHeroImageUrl(event.target.value);
                      clearFeedback();
                    }}
                    className={inputClassName}
                    placeholder="Optional, falls back to thumbnail"
                  />
                </Field>
              </div>
            </section>

            <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                    Preview Media
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    {counts.images} images / {counts.videos} videos
                  </p>
                </div>
                <label className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-800 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800">
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  {uploading ? 'Processing...' : 'Add Media'}
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    disabled={uploading}
                    onChange={(event) => void handlePreviewFiles(event)}
                    className="sr-only"
                  />
                </label>
              </div>

              {previewUploadFeedback && (
                <div
                  className={cn(
                    'mb-4 rounded-lg border px-4 py-3 text-sm',
                    previewUploadFeedback.tone === 'error' &&
                      'border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300',
                    previewUploadFeedback.tone === 'info' &&
                      'border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-900 dark:bg-cyan-950 dark:text-cyan-200',
                    previewUploadFeedback.tone === 'success' &&
                      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300',
                  )}
                >
                  <p className="font-semibold">
                    {previewUploadFeedback.tone === 'error'
                      ? 'Upload failed'
                      : previewUploadFeedback.tone === 'success'
                        ? 'Upload complete'
                        : 'Upload in progress'}
                  </p>
                  <p className="mt-1">{previewUploadFeedback.message}</p>
                </div>
              )}

              <div className="min-w-0 space-y-3">
                {previewMedia.length > 0 ? (
                  previewMedia.map((media) => (
                    <div
                      key={media.id}
                      className="grid min-w-0 gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[auto_72px_minmax(0,1fr)_auto] sm:items-center dark:border-slate-800"
                    >
                      <GripVertical className="hidden h-4 w-4 text-slate-400 sm:block" aria-hidden="true" />
                      <div className="relative h-20 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                        {media.type === 'image' && (media.objectUrl || media.url) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={media.objectUrl ?? media.url}
                            alt={media.alt || media.fileName}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Film className="h-7 w-7 text-slate-500" aria-hidden="true" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                          {media.fileName}
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                          {media.type} / {formatBytes(media.fileSize)} / order {media.sortOrder} / {media.storageStatus}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeMedia(media.id)}
                        className="h-9 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
                    <FileImage className="mx-auto h-8 w-8 text-slate-400" aria-hidden="true" />
                    <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">
                      No preview media selected
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-base font-semibold text-slate-950 dark:text-white">
                Download Links
              </h2>
              <div className="grid min-w-0 gap-4 md:grid-cols-2">
                {downloadLinkFields.map((field) => (
                  <Field key={field.key} label={field.label}>
                    <div className="relative min-w-0">
                      <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
                      <input
                        value={downloadLinks[field.key]}
                        onChange={(event) =>
                          handleDownloadLinkChange(field.key, event.target.value)
                        }
                        className={cn(inputClassName, 'pl-9')}
                        placeholder="https://"
                      />
                    </div>
                  </Field>
                ))}
              </div>
            </section>
          </form>

          <aside className="min-w-0 space-y-4">
            <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                Draft Status
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <StatusRow label="Category" value={category} />
                <StatusRow label="Status" value={postStatus} />
                <StatusRow label="Tags" value={selectedTags.length.toString()} />
                <StatusRow label="Preview Images" value={counts.images.toString()} />
                <StatusRow label="Preview Videos" value={counts.videos.toString()} />
                <StatusRow
                  label="Thumbnail"
                  value={thumbnailUrl ? 'uploaded' : fallbackThumbnailUrl ? 'using preview' : 'missing'}
                />
              </dl>
              {validationMessages.length > 0 && (
                <div className="mt-5 rounded-lg bg-rose-50 p-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  <p className="font-semibold">Needs attention</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5">
                    {validationMessages.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                </div>
              )}
              {saveMessage && (
                <div className="mt-5 rounded-lg bg-emerald-50 p-3 text-sm font-medium text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {saveMessage}
                </div>
              )}
            </div>

            <div className="min-w-0 rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                Storage Shape
              </h2>
              <pre className="mt-4 max-h-80 min-w-0 overflow-auto rounded-lg bg-slate-950 p-3 text-xs leading-5 text-slate-100">
                {JSON.stringify(storageShape, null, 2)}
              </pre>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

const inputClassName =
  'h-10 w-full min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-800';

const downloadLinkFields: Array<{
  key: keyof AdminPostDraft['downloadLinks'];
  label: string;
}> = [
  { key: 'mediafire', label: 'Mediafire' },
  { key: 'telegram', label: 'Telegram' },
  { key: 'terabox', label: 'Terabox' },
  { key: 'gofile', label: 'Gofile' },
];

interface FieldProps {
  children: React.ReactNode;
  label: string;
}

function Field({ children, label }: FieldProps) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>
      {children}
    </label>
  );
}

interface UploadBoxProps {
  accept: string;
  disabled?: boolean;
  fileName: string;
  label: string;
  onChange: (file: File | undefined) => void;
}

function UploadBox({
  accept,
  disabled = false,
  fileName,
  label,
  onChange,
}: UploadBoxProps) {
  return (
    <label
      className={cn(
        'flex h-28 min-w-0 flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 text-center transition dark:border-slate-700 dark:bg-slate-950',
        disabled
          ? 'cursor-not-allowed opacity-70'
          : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-900',
      )}
    >
      <Upload className="h-5 w-5 text-slate-500" aria-hidden="true" />
      <span className="mt-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
      </span>
      {fileName && (
        <span className="mt-1 max-w-full truncate text-xs text-slate-500 dark:text-slate-400">
          {fileName}
        </span>
      )}
      <input
        type="file"
        accept={accept}
        disabled={disabled}
        onChange={(event) => onChange(event.target.files?.[0])}
        className="sr-only"
      />
    </label>
  );
}

interface StatusRowProps {
  label: string;
  value: string;
}

function StatusRow({ label, value }: StatusRowProps) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-4">
      <dt className="shrink-0 text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="min-w-0 break-words text-right font-semibold text-slate-950 dark:text-white">
        {value}
      </dd>
    </div>
  );
}

function createDraftId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `draft-${Date.now()}`;
}

function createEmptyDownloadLinks() {
  return {
    mediafire: '',
    telegram: '',
    terabox: '',
    gofile: '',
  };
}

async function compressImageForUpload(
  file: File,
  target: 'cover' | 'preview',
) {
  if (!compressibleImageTypes.has(file.type)) {
    return file;
  }

  const compressed = await imageCompression(file, {
    alwaysKeepResolution: false,
    fileType: 'image/webp',
    initialQuality: target === 'cover' ? 0.82 : 0.78,
    maxIteration: 8,
    maxSizeMB: target === 'cover' ? 1.2 : 1.6,
    maxWidthOrHeight: target === 'cover' ? 1600 : 1800,
    useWebWorker: false,
  });

  if (compressed.size >= file.size) {
    return file;
  }

  return new File([compressed], replaceExtension(file.name, 'webp'), {
    lastModified: Date.now(),
    type: compressed.type || 'image/webp',
  });
}

async function compressPreviewImageWithStatus(
  file: File,
  onStatus: (message: string, tone?: UploadFeedbackTone) => void,
) {
  onStatus(`Compressing image preview ${file.name} before upload...`);
  const compressedFile = await compressImageForUpload(file, 'preview');

  if (compressedFile === file) {
    onStatus(`Image ${file.name} is already small enough. Uploading original file...`);
  } else {
    onStatus(
      `Image compressed from ${formatBytes(file.size)} to ${formatBytes(compressedFile.size)}. Uploading compressed file...`,
    );
  }

  return compressedFile;
}

async function prepareVideoPreviewForUpload(
  file: File,
  onStatus: (message: string, tone?: UploadFeedbackTone) => void,
) {
  onStatus(`Reading video duration for ${file.name}...`);
  const durationSeconds = await getVideoDuration(file);

  if (
    !Number.isFinite(durationSeconds) ||
    durationSeconds <= maxPreviewVideoDurationSeconds
  ) {
    onStatus(
      Number.isFinite(durationSeconds)
        ? `Video duration is ${formatDurationLabel(durationSeconds)}. It is under 1:00, so the original video will be uploaded.`
        : `Video duration could not be detected. Uploading the original video file.`,
    );
    return {
      durationSeconds: Number.isFinite(durationSeconds)
        ? durationSeconds
        : undefined,
      file,
    };
  }

  onStatus(
    `Video duration is ${formatDurationLabel(durationSeconds)}. Trimming the first 1:00 in your browser before upload. Keep this tab open.`,
  );
  const trimmedFile = await trimVideoInBrowser(
    file,
    maxPreviewVideoDurationSeconds,
    onStatus,
  );
  onStatus(
    `Video trim complete. New preview size is ${formatBytes(trimmedFile.size)}. Uploading trimmed preview...`,
  );

  return {
    durationSeconds: maxPreviewVideoDurationSeconds,
    file: trimmedFile,
  };
}

function getVideoDuration(file: File) {
  return new Promise<number>((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');

    const cleanup = () => {
      video.removeAttribute('src');
      video.load();
      URL.revokeObjectURL(objectUrl);
    };

    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      const duration = video.duration;
      cleanup();
      resolve(duration);
    };
    video.onerror = () => {
      cleanup();
      reject(new Error('Unable to read video duration.'));
    };
    video.src = objectUrl;
  });
}

async function trimVideoInBrowser(
  file: File,
  maxDurationSeconds: number,
  onStatus: (message: string, tone?: UploadFeedbackTone) => void,
) {
  if (typeof MediaRecorder === 'undefined') {
    throw new Error(
      'This browser cannot trim video automatically. Upload a video preview under 60 seconds or try Chrome/Edge desktop.',
    );
  }

  const objectUrl = URL.createObjectURL(file);
  const video = document.createElement('video') as VideoWithCaptureStream;
  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  video.src = objectUrl;
  video.style.height = '1px';
  video.style.left = '-9999px';
  video.style.opacity = '0';
  video.style.position = 'fixed';
  video.style.top = '0';
  video.style.width = '1px';
  document.body.appendChild(video);

  try {
    await waitForMediaEvent(video, 'loadedmetadata');
    if (video.currentTime > 0.05) {
      video.currentTime = 0;
      await waitForMediaEvent(video, 'seeked');
    }

    const stream = video.captureStream?.() ?? video.mozCaptureStream?.();
    if (!stream) {
      throw new Error(
        'This browser cannot trim video automatically. Upload a video preview under 60 seconds or try Chrome/Edge desktop.',
      );
    }

    const mimeType = getSupportedRecorderMimeType();
    const chunks: Blob[] = [];
    const recorder = new MediaRecorder(stream, {
      ...(mimeType ? { mimeType } : {}),
      audioBitsPerSecond: 64000,
      videoBitsPerSecond: 1200000,
    });
    const stopped = new Promise<Blob>((resolve, reject) => {
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      recorder.onerror = () => reject(new Error('Video trimming failed.'));
      recorder.onstop = () => {
        resolve(new Blob(chunks, { type: recorder.mimeType || mimeType }));
      };
    });

    recorder.start(1000);
    await video.play();
    const trimStartedAt = Date.now();
    let lastReportedSecond = 0;

    while (Date.now() - trimStartedAt < maxDurationSeconds * 1000 && !video.ended) {
      await wait(1000);
      const elapsedSeconds = Math.min(
        maxDurationSeconds,
        Math.floor((Date.now() - trimStartedAt) / 1000),
      );

      if (
        elapsedSeconds > 0 &&
        elapsedSeconds % 5 === 0 &&
        elapsedSeconds !== lastReportedSecond
      ) {
        lastReportedSecond = elapsedSeconds;
        onStatus(
          `Trimming video preview... ${elapsedSeconds}s / ${maxDurationSeconds}s recorded. Keep this tab open.`,
        );
      }
    }

    if (recorder.state !== 'inactive') {
      recorder.stop();
    }

    video.pause();
    stream.getTracks().forEach((track) => track.stop());

    const blob = await stopped;
    const outputType = blob.type || mimeType || 'video/webm';
    const outputExtension = outputType.includes('mp4') ? 'mp4' : 'webm';

    return new File(
      [blob],
      replaceExtension(file.name, outputExtension),
      {
        lastModified: Date.now(),
        type: outputType,
      },
    );
  } finally {
    video.pause();
    video.remove();
    URL.revokeObjectURL(objectUrl);
  }
}

function waitForMediaEvent(
  media: HTMLMediaElement,
  eventName: 'loadedmetadata' | 'seeked',
) {
  return new Promise<void>((resolve, reject) => {
    const cleanup = () => {
      media.removeEventListener(eventName, handleEvent);
      media.removeEventListener('error', handleError);
    };
    const handleEvent = () => {
      cleanup();
      resolve();
    };
    const handleError = () => {
      cleanup();
      reject(new Error('Unable to process video preview.'));
    };

    media.addEventListener(eventName, handleEvent, { once: true });
    media.addEventListener('error', handleError, { once: true });
  });
}

function getSupportedRecorderMimeType() {
  const mimeTypes = [
    'video/mp4',
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
  ];

  return mimeTypes.find((mimeType) => MediaRecorder.isTypeSupported(mimeType)) ?? '';
}

function wait(milliseconds: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, milliseconds);
  });
}

function replaceExtension(fileName: string, extension: string) {
  const baseName = fileName.replace(/\.[^.]+$/, '') || 'upload';
  return `${baseName}.${extension}`;
}

function toStoredMedia(media: DraftMedia): AdminDraftMedia {
  return {
    id: media.id,
    type: media.type,
    fileName: media.fileName,
    fileSize: media.fileSize,
    alt: media.alt,
    duration: media.duration,
    sortOrder: media.sortOrder,
    storageStatus: media.storageStatus,
    url: media.url,
    posterUrl: media.posterUrl,
    width: media.width,
    height: media.height,
  };
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDurationLabel(durationSeconds: number | undefined) {
  if (!durationSeconds) {
    return 'preview';
  }

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = Math.round(durationSeconds % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
