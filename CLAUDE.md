# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Package management

Use `pnpm` for all package operations. Install scripts are disabled by default for security — do not run them unless a package explicitly fails without them.

Adding or upgrading a dependency:
- Wait at least 3-4 weeks after a new version is published before adopting it, to allow time for vulnerabilities to surface.
- Prefer `pnpm add` / `pnpm install` with `--config.ignore-scripts=true` (should be the default in this repo).
- If a package fails because it needs an install script: stop and report to the user. Explain what the package does, what the script is for, and whether an older stable version (one that predates the current release by 3+ weeks) could be used instead. Do not run the script until the user approves.

## Commands

```
pnpm dev          # Start dev server (localhost:4321)
pnpm build        # Production build to ./dist/
pnpm preview      # Build then serve via wrangler dev
pnpm deploy       # Deploy to Cloudflare Workers (wrangler deploy)
pnpm check        # Build + tsc + wrangler deploy --dry-run (type-check pipeline)
pnpm cf-typegen   # Regenerate worker-configuration.d.ts from wrangler.json
```

## Architecture

This is an Astro 5 blog deployed as a static site to Cloudflare Workers via `@astrojs/cloudflare`. Node >=22 is required.

**Routing (file-based):**
- `src/pages/index.astro` — home page
- `src/pages/about.astro` — about page (reuses `BlogPost` layout)
- `src/pages/blog/index.astro` — blog listing (calls `getCollection('blog')`, sorts by pubDate desc)
- `src/pages/blog/[...slug].astro` — individual blog post (uses `getStaticPaths` + `render()`)
- `src/pages/til/index.astro` — TIL listing (calls `getCollection('til')`, sorts by pubDate desc)
- `src/pages/til/[...slug].astro` — individual TIL entry
- `src/pages/work/index.astro` — professional work and project index
- `src/pages/work/[...slug].astro` — individual work entry
- `src/pages/projects/[...slug].astro` — individual project entry
- `src/pages/rss.xml.js` — RSS feed endpoint

**Content collections:**
Defined in `src/content.config.ts`.

- Blog posts live in `src/content/blog/` as `.md` or `.mdx` files.
- TIL entries live in `src/content/til/`.
- Professional work entries live in `src/content/work/`.
- Project entries live in `src/content/projects/`.

**Shared components:**
- `BaseHead.astro` — `<head>` with SEO meta, OG tags, font preloads, and global CSS import
- `Header.astro` / `HeaderLink.astro` — brand header plus hamburger drawer navigation with active-link detection
- `Footer.astro` — copyright + social icon links
- `FormattedDate.astro` — `<time>` element with `en-us` locale formatting

**Layout:**
- `layouts/BlogPost.astro` — full page chrome (header/footer/BaseHead) plus hero image, date(s), title, and prose slot. Used by both blog posts and the about page.
- `layouts/TilPost.astro` — compact individual TIL page layout.
- `layouts/WorkDetail.astro` — shared detail layout for work and project pages.

**Global config:**
- `src/consts.ts` — `SITE_TITLE` and `SITE_DESCRIPTION` (edit these to personalize)
- `src/styles/global.css` — Bear Blog-inspired CSS with CSS custom properties for theming (accent, gray scale, box-shadow, Atkinson font)
- `astro.config.mjs` — site URL (update from `example.com`), integrations (MDX, sitemap), Cloudflare adapter with platform proxy enabled
- `wrangler.json` — Cloudflare Workers config: static assets from `./dist`, Node.js compat, observability enabled

## Adding and publishing content

Do not add packages for routine content updates. This site is designed so a local agent can add Markdown or MDX files to the correct content folder, validate frontmatter against `src/content.config.ts`, and let Astro generate the routes automatically.

Use lowercase kebab-case filenames because the filename becomes the URL slug. For example, `src/content/til/snafu.md` becomes `/til/snafu/`, and `src/content/work/vercel.md` becomes `/work/vercel/`.

After adding or changing content, run `pnpm build` when the local Node version is `>=22.13`. For deployment confidence, run `pnpm check`. Do not run install scripts unless explicitly approved under the package management rules above.

### Blog / Writing

Add blog posts to `src/content/blog/`.

Required fields:
- `title`
- `description`
- `pubDate`

Common optional fields:
- `updatedDate`
- `heroImage`
- `category`
- `featured`
- `dek`
- `subtitle`
- `accentColor`
- `theme`
- `canonicalUrl`

Example:

```md
---
title: "Post title"
description: "Short SEO and social summary."
pubDate: "2026-05-20"
updatedDate: "2026-05-21"
heroImage: "/blog-placeholder-1.jpg"
category: "Essay"
featured: false
dek: "Short display summary for cards and lists."
theme: "ember"
---

Write the post body here.
```

The blog index is `/blog/`. Individual posts are generated at `/blog/<filename>/`.

### TIL entries

Add TIL entries to `src/content/til/`.

Required fields:
- `title`
- `description`
- `pubDate`

Optional fields:
- `updatedDate`
- `likes`
- `sourceUrl`

Example:

```md
---
title: "SNAFU"
description: "Short summary shown on the TIL list."
pubDate: "2026-05-05"
likes: 17
sourceUrl: "https://example.com"
---

Longer individual-entry body goes here.
```

The TIL index is `/til/`. Individual entries are generated at `/til/<filename>/`.

### Work entries

Add professional work entries to `src/content/work/`.

Required fields:
- `company`
- `role`
- `summary`
- `startDate`
- `displayDate`

Optional fields:
- `endDate`
- `logoText`
- `location`
- `featured`
- `order`
- `links`

Example:

```md
---
company: "Company Name"
role: "Role Title"
summary: "Short summary shown on the Work page."
startDate: "2025-06-01"
endDate: "2026-03-01"
displayDate: "Jun 2025 -> Mar 2026"
logoText: "CN"
featured: true
order: 1
links:
  - label: "Company"
    url: "https://example.com"
---

Use the body for deeper detail: responsibilities, projects, outcomes, links, screenshots, and lessons learned.
```

The work index is `/work/`. Individual work entries are generated at `/work/<filename>/`.

### Project entries

Add project entries to `src/content/projects/`.

Required fields:
- `title`
- `description`

Optional fields:
- `status`
- `url`
- `sourceUrl`
- `relatedWork`
- `featured`
- `order`

Use `relatedWork` to connect a project to a work entry. The value must match the work entry filename without the extension. For example, `relatedWork: "vercel"` links the project to `src/content/work/vercel.md`.

Example:

```md
---
title: "Project Name"
description: "Short one-line project summary."
status: "Active"
url: "https://example.com"
sourceUrl: "https://github.com/example/project"
relatedWork: "vercel"
featured: true
order: 1
---

Use the body for the longer project story.
```

Projects are listed on `/work/#projects`. Individual project pages are generated at `/projects/<filename>/`.

### Agent content workflow

When asked to add existing Markdown files to the website:

1. Identify what kind of content each file is: blog, TIL, work, or project.
2. Move or create the file in the matching folder under `src/content/`.
3. Ensure the filename is lowercase kebab-case and does not conflict with an existing slug.
4. Add or normalize the required frontmatter for that collection.
5. Preserve the Markdown body unless the user asks for editing.
6. If linking a project to work, set `relatedWork` to the work filename without `.md` or `.mdx`.
7. Run diagnostics on changed files. Run `pnpm build` or `pnpm check` only when the local Node version is compatible and the user has not asked to skip commands.
8. Report the generated URLs and any validation issues.
