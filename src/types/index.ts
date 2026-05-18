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
    sorafolder?: string;
    gofile?: string;
  };
  previewImages?: string[];
  heroImage?: string;
  description?: string;
}

export type Tag =
  | 'cosplay-game'
  | 'cosplay-anime-manga'
  | 'cosplay-freestyle'
  | 'video';

export type Category = 'cosplay' | 'cosplay-ero' | 'nude' | 'video-cosplayy';
