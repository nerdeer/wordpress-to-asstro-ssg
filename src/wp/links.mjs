import {z} from 'astro:content';

export const WP_EXPORT_LINKS_SCHEMA = z.object({
  "self": z.array(
      z.object({
        "href": z.string()
      })
  ),
  "collection": z.array(
      z.object({
        "href": z.string()
      })
  ).optional(),
  "about": z.array(
      z.object({
        "href": z.string()
      })
  ).optional(),
  "author": z.array(
      z.object({
        "href": z.string(),
        "embeddable": z.boolean()
      })
  ).optional(),
  "replies": z.array(
      z.object({
        "href": z.string(),
        "embeddable": z.boolean()
      })
  ).optional(),
  "version-history": z.array(
      z.object({
        "href": z.string(),
        "count": z.number()
      })
  ).optional(),
  "predecessor-version": z.array(
      z.object({
        "href": z.string(),
        "id": z.number()
      })
  ).optional(),
  "wp:featuredmedia": z.array(
      z.object({
        "href": z.string(),
        "embeddable": z.boolean()
      })
  ).optional(),
  "wp:attachment": z.array(
      z.object({
        "href": z.string()
      })
  ).optional(),
  "curies": z.array(
      z.object({
        "href": z.string(),
        "name": z.string(),
        "templated": z.boolean()
      })
  ).optional()
})
