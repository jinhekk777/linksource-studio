import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

const projects = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/projects' }),
  schema: z.object({
    listed: z.boolean().default(true), placeholder: z.boolean().default(false),
    slug: z.string(), order: z.number(), title: z.string(), name: z.string(), subtitle: z.string(),
    english: z.string(), category: z.string(), group: z.string(), summary: z.string(),
    headline: z.string(), description: z.string(), image: z.string(), video: z.string().optional(),
    heroLines: z.array(z.string()), statement: z.string(), accent: z.string(),
    chapters: z.array(z.object({ title: z.string(), image: z.string(), caption: z.string(), text: z.string(), detail: z.string() })),
    focus: z.array(z.object({ title: z.string(), text: z.string() })),
    year: z.number().optional(), role: z.string().optional(), client: z.string().optional(),
    credits: z.array(z.object({ role: z.string(), name: z.string() })).default([]),
    production: z.array(z.object({ title: z.string(), image: z.string(), text: z.string() })).default([]),
  }),
});

export const collections = { projects };
