import { defineCollection, z } from "astro:content";

const projectsAndWriting = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    slug: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const notes = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    draft: z.boolean().optional(),
    slug: z.string().optional(),
    link: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const linkSchema = z.object({
  label: z.string(),
  url: z.string(),
});

const entrySchema = z.object({
  name: z.string(),
  url: z.string().optional(),
  role: z.string().optional(),
  tagline: z.string().optional(),
  date: z.string().optional(),
  image: z.string().optional(),
  description: z.string().optional(),
  links: z.array(linkSchema).optional(),
});

const educationSchema = z.object({
  name: z.string(),
  detail: z.string(),
  sub: z.string().optional(),
  image: z.string().optional(),
});

const pages = defineCollection({
  type: "content",
  schema: z.object({
    // Home page fields
    name: z.string().optional(),
    email: z.string().optional(),
    linkedin: z.string().optional(),
    x: z.string().optional(),
    bluesky: z.string().optional(),
    substack: z.string().optional(),
    // Previously page fields
    education: z.array(educationSchema).optional(),
    work: z.array(entrySchema).optional(),
    projects: z.array(entrySchema).optional(),
    leadership: z.array(entrySchema).optional(),
    speaking: z.array(entrySchema).optional(),
  }),
});

export const collections = { "projects-and-writing": projectsAndWriting, notes, pages };
