import {defineCollection, z} from 'astro:content';

export const WP_EXPORT_PAGES_SCHEMA = z.object({
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
  "parent": z.number(),
  "menu_order": z.number(),
  "comment_status": z.string(),
  "ping_status": z.string(),
  "template": z.string(),
  "meta": z.array(z.any()),
  "_links": WP_EXPORT_LINKS_SCHEMA
})

export const definePages = defineCollection({
  type: 'data',
  schema: WP_EXPORT_PAGES_SCHEMA,
});

