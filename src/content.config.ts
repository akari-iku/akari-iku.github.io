import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    lang: z.enum(['ja', 'en']),
    pair: z.string().optional(),
    source: z.enum(['zenn', 'dev', 'original']),
    sourceUrl: z.string().url().optional(),
    accent: z.string().default('#E5007F'),
  }),
});

export const collections = { blog };
