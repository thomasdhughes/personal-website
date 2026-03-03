import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import { SITE } from "@consts";

type Context = {
  site: string
}

export async function GET(context: Context) {
  const writing = (await getCollection("projects-and-writing"))
    .filter(post => !post.data.draft);

  const notes = (await getCollection("notes"))
    .filter(post => !post.data.draft);

  const items = [...writing, ...notes]
    .sort((a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf());

  return rss({
    title: SITE.NAME,
    description: "Thomas Hughes' personal website",
    site: context.site,
    items: items.map((item) => ({
      title: item.data.title,
      description: item.data.description,
      pubDate: item.data.date,
      link: `/${item.data.slug || item.slug}/`,
    })),
  });
}
