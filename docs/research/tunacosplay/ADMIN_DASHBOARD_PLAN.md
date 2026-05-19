# Admin Dashboard Plan — Tunacosplay Clone

## Overview

The current frontend is designed to support admin-managed content uploads. This document outlines the planned admin dashboard for managing posts, images, and download links.

**Current Status:** Frontend is admin-ready. Admin dashboard is NOT yet implemented.

**Future Goal:** Build an admin dashboard where authorized users can create/edit posts, upload preview images, and manage download links.

---

## Content Upload Fields

### Post Metadata (Required)
- **Title** — Post title (e.g., "Tiny Asa アサ cosplay Mihara - NIKKE")
- **Cosplayer** — Cosplayer name
- **Character** — Character name
- **Source** — Source game/anime/manga
- **Category** — cosplay | cosplay-ero | nude | video-cosplayy
- **Tags** — Array of tags (cosplay-game, cosplay-anime-manga, cosplay-freestyle, video)
- **Photo Count** — Number of photos in full gallery
- **Video Count** — Number of videos in full gallery
- **Thumbnail** — Main thumbnail image (required, uploaded via admin)

### Post Metadata (Optional)
- **File Size** — Size of downloadable archive (e.g., "1.2 GB")
- **Unzip Password** — Password for extracting archive (default: "cosplaytele")
- **Hero Image** — Large hero section background image (uploaded via admin, falls back to thumbnail)
- **Description** — Post description text (default: preview-only notice)

### Download Links (Optional)
- **Mediafire** — Mediafire download URL
- **Telegram** — Telegram channel/file URL
- **SoraFolder** — SoraFolder download URL
- **Gofile** — Gofile download URL

**Note:** If no download links are provided, the detail page shows: "Download links will be added from the admin dashboard."

### Preview Media (Optional, Admin-Managed)
- **Preview Media** - Ordered array of preview photo/video records uploaded via admin
- **Media Fields** - type (`image` or `video`), url, posterUrl, alt text, width/height, duration, sortOrder
- **Behavior:**
  - If `previewMedia` exists -> render mixed preview grid (max 8 media items)
  - Image items render optimized thumbnails
  - Video items render as playable videos when `url` exists, or poster cards when only `posterUrl` exists
  - If `previewMedia` is empty/undefined -> show thumbnail placeholder with message: "Preview media will be managed from the admin dashboard."

**Important:** Preview media is NOT hardcoded. It will be uploaded through the admin dashboard.

---

## Image Upload Flow

### Thumbnail Upload
1. Admin selects/uploads thumbnail image
2. Image is stored in `/public/images/tunacosplay/` (dev) or object storage (production)
3. Thumbnail path is saved to post record: `/images/tunacosplay/{slug}.jpg`

### Hero Image Upload
1. Admin selects/uploads hero image (optional)
2. Image is stored in same location as thumbnails
3. Hero image path is saved to post record
4. If no hero image, detail page uses thumbnail as fallback

### Preview Media Upload
1. Admin uploads multiple preview photos/videos (1-8 media items recommended)
2. Images are stored in `/public/images/tunacosplay/previews/{slug}/` (dev) or object storage (production)
3. Videos are stored in `/public/videos/tunacosplay/previews/{slug}/` (dev) or object storage/CDN (production)
4. Preview media records are saved as an ordered array on the post record
5. Detail page renders a mixed preview grid from this array
6. If no preview media is uploaded, detail page shows thumbnail placeholder with admin notice

### Media Processing
- **Resize/Optimize:** Images should be resized and optimized before storage
- **Image Formats:** JPEG/PNG/WebP supported
- **Video Formats:** MP4/WebM recommended for preview clips
- **Max Image Size:** Recommend 2MB per image after optimization
- **Max Video Size:** Keep preview clips short and compressed; full videos should stay external
- **Naming Convention:** `{slug}-{index}.jpg` for preview images and `{slug}-{index}.mp4` for preview videos

---

## Download Link Handling

### Admin Input
- Admin provides download URLs for Mediafire, Telegram, SoraFolder, Gofile
- URLs are validated (must be valid HTTP/HTTPS URLs)
- URLs are stored in `downloadLinks` object

### Frontend Behavior
- If `downloadLinks` exists and has at least one link → render download buttons
- If `downloadLinks` is empty/undefined → show message: "Download links will be added from the admin dashboard."
- Download buttons are styled as red rounded pills (Cosplaytele style)

### Security Considerations
- Download links are external URLs (not hosted on this server)
- No file upload/hosting for full galleries (preview-only approach)
- Admin should verify download links are safe and legal

---

## Safe Media Policy

### Content Guidelines
- **No explicit/adult media committed to repository**
- **Preview photos/videos must be safe/appropriate**
- **Full galleries are NOT hosted on this server**
- **Download links point to external storage only**

### Admin Responsibilities
- Verify uploaded preview photos/videos are safe
- Ensure download links comply with legal requirements
- Do not upload explicit media to public repository
- Use external storage (Mediafire, Telegram, etc.) for full content

### Frontend Safeguards
- Preview-only approach (max 8 preview media items)
- Clear disclaimer: "Preview only. Full gallery/download content is not hosted in this clone."
- No full gallery rendering
- No direct file hosting

---

## Proposed Storage Options

### Development (Local)
- **Location:** `/public/images/tunacosplay/`
- **Structure:**
  ```
  /public/images/tunacosplay/
    ├── {slug}.jpg (thumbnail)
    ├── {slug}-hero.jpg (hero image)
    └── previews/
        └── {slug}/
            ├── {slug}-1.jpg
            ├── {slug}-2.jpg
            └── ...
  ```
- **Pros:** Simple, no external dependencies
- **Cons:** Not scalable, images committed to git

### Production (Object Storage/CDN)
- **Options:**
  - AWS S3 + CloudFront
  - Cloudflare R2
  - DigitalOcean Spaces
  - Vercel Blob Storage
- **Structure:**
  ```
  /tunacosplay/
    ├── thumbnails/{slug}.jpg
    ├── heroes/{slug}.jpg
    └── previews/{slug}/
        ├── 1.jpg
        ├── 2.jpg
        └── ...
  ```
- **Pros:** Scalable, CDN-backed, not in git
- **Cons:** Requires external service, costs money

### Recommended Approach
1. **Dev:** Use local `/public/images/` for testing
2. **Production:** Use object storage (Cloudflare R2 or DigitalOcean Spaces)
3. **Admin Dashboard:** Upload to object storage, save URLs to database

---

## Database Schema Idea

### Posts Table
```sql
CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(255) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  cosplayer VARCHAR(255) NOT NULL,
  character VARCHAR(255) NOT NULL,
  source VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL,
  tags TEXT[], -- Array of tags
  photo_count INTEGER NOT NULL,
  video_count INTEGER NOT NULL,
  thumbnail_url TEXT NOT NULL,
  hero_image_url TEXT,
  file_size VARCHAR(50),
  unzip_password VARCHAR(255) DEFAULT 'cosplaytele',
  description TEXT,
  views_24h INTEGER DEFAULT 0,
  views_3d INTEGER DEFAULT 0,
  views_7d INTEGER DEFAULT 0,
  total_views INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Preview Media Table
```sql
CREATE TABLE preview_media (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  media_type VARCHAR(20) NOT NULL, -- 'image' or 'video'
  url TEXT,
  poster_url TEXT,
  alt_text TEXT,
  width INTEGER,
  height INTEGER,
  duration VARCHAR(20),
  display_order INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Download Links Table
```sql
CREATE TABLE download_links (
  id SERIAL PRIMARY KEY,
  post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- 'mediafire', 'telegram', 'sorafolder', 'gofile'
  url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Admin Dashboard Features (Future)

### Post Management
- **List Posts** — View all posts with thumbnail, title, category
- **Create Post** — Form to create new post with all metadata
- **Edit Post** — Update post metadata, images, download links
- **Delete Post** — Remove post and associated images

### Media Upload
- **Thumbnail Upload** — Drag-and-drop or file picker
- **Hero Image Upload** — Optional hero image upload
- **Preview Media Upload** - Multi-file upload (1-8 photos/videos)
- **Media Preview** - Show uploaded photos/videos before saving
- **Media Optimization** - Auto-resize images and compress preview videos on upload

### Download Link Management
- **Add Links** — Form to add Mediafire, Telegram, SoraFolder, Gofile URLs
- **Validate Links** — Check URLs are valid HTTP/HTTPS
- **Remove Links** — Delete download links

### Authentication
- **Admin Login** — Secure login for authorized users only
- **Role-Based Access** — Admin vs. Editor roles
- **Session Management** — Secure session handling

---

## Implementation Priority

### Phase 1: Frontend Preparation (CURRENT)
- ✅ Update Post type with optional admin-managed fields
- ✅ Update DetailPostLayout to handle missing previewMedia
- ✅ Update DetailPostLayout to handle missing downloadLinks
- ✅ Show admin-managed notices when fields are empty
- ✅ Document admin dashboard plan

### Phase 2: Database Setup (FUTURE)
- Set up PostgreSQL database
- Create posts, preview_media, download_links tables
- Migrate static data from `src/data/posts.ts` to database

### Phase 3: Admin Dashboard (FUTURE)
- Build admin authentication system
- Create admin UI for post management
- Implement image upload to object storage
- Implement download link management

### Phase 4: API Integration (FUTURE)
- Build API endpoints for CRUD operations
- Connect frontend to database via API
- Remove static `src/data/posts.ts` file

---

## Notes

- **Current static data is temporary** — Will be replaced by database-driven content
- **Frontend is admin-ready** — All optional fields are properly handled
- **No admin dashboard yet** — This is a planning document only
- **Preview-only approach** — Full galleries are NOT hosted on this server
- **External download links** — Download links point to external storage (Mediafire, Telegram, etc.)
