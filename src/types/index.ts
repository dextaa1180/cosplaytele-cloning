export interface PreviewMedia {
  id: string;
  type: 'image' | 'video';
  url?: string;
  posterUrl?: string;
  alt?: string;
  width?: number;
  height?: number;
  duration?: string;
  sortOrder: number;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  cosplayer: string;
  character: string;
  source: string;
  tags: string[];
  category: string;
  thumbnail: string;
  photoCount: number;
  videoCount: number;
  views24h: number;
  views3d: number;
  views7d: number;
  totalViews: number;
  // Optional fields for detail page preview
  fileSize?: string;
  unzipPassword?: string;
  downloadLinks?: {
    mediafire?: string;
    telegram?: string;
    terabox?: string;
    gofile?: string;
  };
  previewMedia?: PreviewMedia[];
  heroImage?: string;
  description?: string;
}

export type Tag = string;

export type Category = 'cosplay' | 'cosplay-ero' | 'nude' | 'video-cosplayy';
