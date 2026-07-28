import { defineCollections, defineConfig } from 'fumadocs-mdx/config';
import { z } from 'zod';

const visualSchema = z.enum(['timing', 'fpga', 'market', 'board', 'ai', 'delivery']);

export const blog = defineCollections({
  type: 'doc',
  dir: 'content/blog',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    author: z.string().default('时工'),
    category: z.string(),
    tags: z.array(z.string()).default([]),
    reading: z.string().default('10 分钟阅读'),
    visual: visualSchema.default('fpga'),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    likes: z.number().int().nonnegative().default(0),
    comments: z.number().int().nonnegative().default(0),
    saves: z.number().int().nonnegative().default(0),
  }),
});

export const notes = defineCollections({
  type: 'doc',
  dir: 'content/notes',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.string(),
    tag: z.string(),
    draft: z.boolean().default(false),
  }),
});

export default defineConfig();
