import { glob } from "astro/loaders";
import { defineCollection } from "astro:content";
import { z } from "astro/zod";

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
	// Type-check frontmatter using a schema
	schema: z.object({
		title: z.string(),
		description: z.string(),
		// Transform string to Date object
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		heroImage: z.string().optional(),
		category: z.string().optional(),
		featured: z.boolean().optional(),
		dek: z.string().optional(),
		subtitle: z.string().optional(),
		accentColor: z.string().optional(),
		theme: z.string().optional(),
		canonicalUrl: z.string().url().optional(),
	}),
});

const til = defineCollection({
	// Load Markdown and MDX files in the `src/content/til/` directory.
	loader: glob({ base: "./src/content/til", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		pubDate: z.coerce.date(),
		updatedDate: z.coerce.date().optional(),
		likes: z.number().int().nonnegative().optional(),
		sourceUrl: z.string().url().optional(),
	}),
});

const work = defineCollection({
	// Load Markdown and MDX files in the `src/content/work/` directory.
	loader: glob({ base: "./src/content/work", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		company: z.string(),
		role: z.string(),
		summary: z.string(),
		startDate: z.coerce.date(),
		endDate: z.coerce.date().optional(),
		displayDate: z.string(),
		logoText: z.string().max(3).optional(),
		location: z.string().optional(),
		featured: z.boolean().optional(),
		order: z.number().optional(),
		links: z
			.array(
				z.object({
					label: z.string(),
					url: z.string().url(),
				}),
			)
			.optional(),
	}),
});

const projects = defineCollection({
	// Load Markdown and MDX files in the `src/content/projects/` directory.
	loader: glob({ base: "./src/content/projects", pattern: "**/*.{md,mdx}" }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		status: z.string().optional(),
		url: z.string().url().optional(),
		sourceUrl: z.string().url().optional(),
		relatedWork: z.string().optional(),
		featured: z.boolean().optional(),
		order: z.number().optional(),
	}),
});

export const collections = { blog, til, work, projects };
