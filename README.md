# Blog Platform

A production-grade personal and professional blog built with Next.js 15 (App Router), MongoDB, and TipTap.

## Features

- **Public blog**: Home, post list, individual posts, tag pages
- **Rich text editor**: TipTap with headings, bold/italic/underline, lists, blockquotes, code blocks, images
- **Admin** (hidden at `/admin`): Create, edit, delete posts; draft/published; autosave; image upload
- **Comments**: Submit comments (pending approval)
- **Likes**: Per-post like count with fingerprint to avoid double-counting
- **SEO**: Metadata per post, sitemap, RSS feed, robots.txt
- **Light & dark mode**: System preference or manual toggle

## Tech stack

- Next.js 15 (App Router)
- MongoDB (Mongoose)
- TipTap (rich text)
- Tailwind CSS
- Vercel Blob (optional, for image uploads)

## Setup

1. Clone and install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.local.example .env.local
   ```

3. Set `MONGODB_URI` in `.env.local` (e.g. MongoDB Atlas connection string or `mongodb://localhost:27017/blog`).

4. Optional: set `BLOB_READ_WRITE_TOKEN` for admin image uploads (Vercel Blob). If not set, image upload in the editor will fail.

5. Run the dev server:

   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000). Admin: [http://localhost:3000/admin](http://localhost:3000/admin).

## Deployment (Vercel)

1. Push the repo to GitHub and import the project in Vercel.
2. Add environment variables in Vercel:
   - `MONGODB_URI`
   - `BLOB_READ_WRITE_TOKEN` (optional)
   - `NEXT_PUBLIC_SITE_URL` (e.g. `https://yourdomain.com`)
3. Deploy. The build runs `next build`; ensure MongoDB is reachable at build time if you use `generateStaticParams` for posts.

## Project structure

- `app/` — Routes: home, blog, tag, admin, API, sitemap, RSS
- `components/` — UI: layout, blog (PostCard, PostContent, comments, like), admin (editor, forms)
- `lib/` — DB connection, Mongoose models, utils (slugify, reading time, content plain text)
- `hooks/` — useAutosave
- `types/` — Post, Comment types

## API

- `GET /api/posts` — List published posts (query: tag, category, q, page, limit)
- `GET /api/posts/[slug]` — Single published post
- `POST /api/posts/[slug]/view` — Increment view count
- `GET /api/posts/[slug]/comments` — List approved comments
- `POST /api/posts/[slug]/comments` — Create comment
- `POST /api/posts/[slug]/like` — Like post
- `GET /api/tags` — List tags
- `GET/POST/PATCH/DELETE /api/admin/posts` — Admin CRUD
- `POST /api/admin/upload` — Image upload (multipart)

No authentication in the current version; admin is protected by obscurity. Add NextAuth (or similar) in a future phase.
