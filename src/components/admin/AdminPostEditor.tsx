'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import {
  Check,
  FileImage,
  Film,
  GripVertical,
  LinkIcon,
  Save,
  Upload,
} from 'lucide-react';
import { Category, Tag } from '@/types';
import {
  AdminDraftMedia,
  AdminPostDraft,
  saveAdminDraft,
  slugifyTitle,
} from '@/lib/admin-drafts';
import { cn } from '@/lib/utils';

type DraftMedia = AdminDraftMedia & {
  objectUrl?: string;
};

const categories: Category[] = ['cosplay', 'video-cosplayy', 'cosplay-ero', 'nude'];
const tags: Tag[] = ['cosplay-game', 'cosplay-anime-manga', 'cosplay-freestyle', 'video'];

export function AdminPostEditor() {
  const [draftId] = useState(() => createDraftId());
  const [createdAt] = useState(() => new Date().toISOString());
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [cosplayer, setCosplayer] = useState('');
  const [character, setCharacter] = useState('');
  const [source, setSource] = useState('');
  const [category, setCategory] = useState<Category>('cosplay');
  const [selectedTags, setSelectedTags] = useState<Tag[]>(['cosplay-game']);
  const [photoCount, setPhotoCount] = useState(0);
  const [videoCount, setVideoCount] = useState(0);
  const [fileSize, setFileSize] = useState('');
  const [unzipPassword, setUnzipPassword] = useState('cosplaytele');
  const [description, setDescription] = useState('');
  const [thumbnailName, setThumbnailName] = useState('');
  const [heroName, setHeroName] = useState('');
  const [downloadLinks, setDownloadLinks] = useState({
    mediafire: '',
    telegram: '',
    sorafolder: '',
    gofile: '',
  });
  const [previewMedia, setPreviewMedia] = useState<DraftMedia[]>([]);
  const [validationMessages, setValidationMessages] = useState<string[]>([]);
  const [saveMessage, setSaveMessage] = useState('');
  const [saving, setSaving] = useState(false);

  const counts = useMemo(
    () => ({
      images: previewMedia.filter((media) => media.type === 'image').length,
      videos: previewMedia.filter((media) => media.type === 'video').length,
    }),
    [previewMedia],
  );

  const storageShape = useMemo(
    () => ({
      title,
      slug,
      category,
      tags: selectedTags,
      previewMedia: previewMedia.map(toStoredMedia),
      downloadLinks,
    }),
    [category, downloadLinks, previewMedia, selectedTags, slug, title],
  );

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugifyTitle(value));
    }
    clearFeedback();
  };

  const handlePreviewFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const nextMedia = files
      .filter((file) => file.type.startsWith('image/') || file.type.startsWith('video/'))
      .map<DraftMedia>((file, index) => {
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        const objectUrl = URL.createObjectURL(file);

        return {
          id: `${file.name}-${file.lastModified}-${index}`,
          type,
          fileName: file.name,
          fileSize: file.size,
          alt: file.name.replace(/\.[^.]+$/, ''),
          duration: type === 'video' ? 'pending' : undefined,
          sortOrder: previewMedia.length + index + 1,
          storageStatus: 'local-only',
          objectUrl,
        };
      });

    setPreviewMedia((current) => [...current, ...nextMedia]);
    clearFeedback();
    event.target.value = '';
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
      await saveAdminDraft(buildDraft());
      setSaveMessage(
        messages.length > 0
          ? `Draft saved with ${messages.length} validation item${messages.length === 1 ? '' : 's'} remaining.`
          : 'Draft saved. It will appear on the admin dashboard.',
      );
    } finally {
      setSaving(false);
    }
  };

  const clearFeedback = () => {
    setValidationMessages([]);
    setSaveMessage('');
  };

  const buildDraft = (): AdminPostDraft => {
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
      fileSize,
      unzipPassword,
      description,
      downloadLinks,
      previewMedia: previewMedia.map(toStoredMedia),
      status: 'draft',
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
    if (!thumbnailName) messages.push('Thumbnail image should be selected.');
    if (previewMedia.length === 0) {
      messages.push('Add at least one preview photo or video.');
    }

    return messages;
  };

  return (
    <div className="w-full bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-950 dark:text-white">
              New Post
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Draft the content shape before wiring storage and database.
            </p>
          </div>
          <div className="grid gap-2 sm:flex">
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
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              <Save className="h-4 w-4" aria-hidden="true" />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <form className="space-y-6">
            <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-base font-semibold text-slate-950 dark:text-white">
                Metadata
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
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

            <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-base font-semibold text-slate-950 dark:text-white">
                Cover Media
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <UploadBox
                  label="Thumbnail"
                  accept="image/*"
                  fileName={thumbnailName}
                  onChange={(file) => {
                    setThumbnailName(file?.name ?? '');
                    clearFeedback();
                  }}
                />
                <UploadBox
                  label="Hero Image"
                  accept="image/*"
                  fileName={heroName}
                  onChange={(file) => {
                    setHeroName(file?.name ?? '');
                    clearFeedback();
                  }}
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
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
                  Add Media
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handlePreviewFiles}
                    className="sr-only"
                  />
                </label>
              </div>

              <div className="space-y-3">
                {previewMedia.length > 0 ? (
                  previewMedia.map((media) => (
                    <div
                      key={media.id}
                      className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[auto_72px_minmax(0,1fr)_auto] sm:items-center dark:border-slate-800"
                    >
                      <GripVertical className="hidden h-4 w-4 text-slate-400 sm:block" aria-hidden="true" />
                      <div className="relative h-20 overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
                        {media.type === 'image' && media.objectUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={media.objectUrl}
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
                          {media.type} / {formatBytes(media.fileSize)} / order {media.sortOrder}
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

            <section className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="mb-4 text-base font-semibold text-slate-950 dark:text-white">
                Download Links
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {downloadLinkFields.map((field) => (
                  <Field key={field.key} label={field.label}>
                    <div className="relative">
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

          <aside className="space-y-4">
            <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                Draft Status
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <StatusRow label="Category" value={category} />
                <StatusRow label="Tags" value={selectedTags.length.toString()} />
                <StatusRow label="Preview Images" value={counts.images.toString()} />
                <StatusRow label="Preview Videos" value={counts.videos.toString()} />
                <StatusRow label="Thumbnail" value={thumbnailName ? 'selected' : 'missing'} />
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

            <div className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                Storage Shape
              </h2>
              <pre className="mt-4 max-h-80 overflow-auto rounded-lg bg-slate-950 p-3 text-xs leading-5 text-slate-100">
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
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-200 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:focus:border-slate-500 dark:focus:ring-slate-800';

const downloadLinkFields: Array<{
  key: keyof AdminPostDraft['downloadLinks'];
  label: string;
}> = [
  { key: 'mediafire', label: 'Mediafire' },
  { key: 'telegram', label: 'Telegram' },
  { key: 'sorafolder', label: 'SoraFolder' },
  { key: 'gofile', label: 'Gofile' },
];

interface FieldProps {
  children: React.ReactNode;
  label: string;
}

function Field({ children, label }: FieldProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>
      {children}
    </label>
  );
}

interface UploadBoxProps {
  accept: string;
  fileName: string;
  label: string;
  onChange: (file: File | undefined) => void;
}

function UploadBox({ accept, fileName, label, onChange }: UploadBoxProps) {
  return (
    <label className="flex h-28 cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 text-center transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:hover:bg-slate-900">
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
    <div className="flex items-center justify-between gap-4">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd className="font-semibold text-slate-950 dark:text-white">{value}</dd>
    </div>
  );
}

function createDraftId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `draft-${Date.now()}`;
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
