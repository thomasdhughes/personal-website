import type { Site, Metadata } from "@types";

export const SITE: Site = {
  NAME: "Thomas Hughes",
  EMAIL: "hello@thomasdhughes.com",
  NUM_POSTS_ON_HOMEPAGE: 4,
  NUM_PROJECTS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "Home",
  DESCRIPTION: "Thomas Hughes - Computational Designer at Arcadis. Princeton '24. Schwarzman Scholar '25.",
};

export const WRITING: Metadata = {
  TITLE: "Projects & Writing",
  DESCRIPTION: "Long-form essays and explorations.",
};

export const NOTES: Metadata = {
  TITLE: "Notes",
  DESCRIPTION: "Brief thoughts and experiments.",
};

export const PREVIOUSLY: Metadata = {
  TITLE: "Previously",
  DESCRIPTION: "Where I've been and what I've done.",
};
