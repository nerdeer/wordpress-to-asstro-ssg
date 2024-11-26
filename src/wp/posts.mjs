
import {defineCollection, z} from 'astro:content';
import {WP_EXPORT_LINKS_SCHEMA} from "./links.mjs";

export const WP_EXPORT_POSTS_SCHEMA = z.object({
  "id": z.number(),
  "date": z.string().transform((str) => new Date(str)),
  "date_gmt": z.string().transform((str) => new Date(str)),
  "guid": z.object({
    "rendered": z.string()
  }),
  "modified": z.string().transform((str) => new Date(str)),
  "modified_gmt": z.string().transform((str) => new Date(str)),
  "slug": z.string(),
  "status": z.string(),
  "type": z.string(),
  "link": z.string(),
  "title": z.object({
    "rendered": z.string()
  }),
  "content": z.object({
    "rendered": z.string(),
    "protected": z.boolean()
  }),
  "excerpt": z.object({
    "rendered": z.string(),
    "protected": z.boolean()
  }),
  "author": z.number(),
  "featured_media": z.number(),
  "comment_status": z.string(),
  "ping_status": z.string(),
  "sticky": z.boolean(),
  "template": z.string(),
  "format": z.string(),
  "meta": z.object({
    "footnotes": z.string()
  }),
  "categories": z.array(z.number()),
  "tags": z.array(z.any()),
  "_links": WP_EXPORT_LINKS_SCHEMA
})

export const definePosts = defineCollection({
  type: 'data',
  schema: WP_EXPORT_POSTS_SCHEMA,
});
