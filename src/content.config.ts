import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const projects = defineCollection({
  loader: glob({ base: "./src/content/projects", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    projectId: z.string(),
    order: z.number(),
    featured: z.boolean().default(false),
    type: z.string(),
    typeVi: z.string(),
    period: z.string(),
    role: z.string(),
    summary: z.string(),
    summaryVi: z.string(),
    technologies: z.array(z.string()),
    metrics: z.array(
      z.object({
        value: z.string(),
        label: z.string(),
        labelVi: z.string(),
      }),
    ),
    links: z
      .object({
        source: z.string().url().optional(),
        live: z.string().url().optional(),
      })
      .optional(),
    icon: z.string().optional(),
    image: z.string().optional(),
    seoKeywords: z.array(z.string()).optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    thumbnail: z.string(),
    thumbnailAlt: z.string(),
    hashtags: z.array(z.string()).min(1),
    draft: z.boolean().default(false),
  }),
});

export const collections = { projects, blog };
