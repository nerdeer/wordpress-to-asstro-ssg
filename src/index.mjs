import {defineCollection, getCollection, z} from 'astro:content';
import {definePages} from "./wp/pages.mjs";
import {definePosts} from "./wp/posts.mjs";

// WP exports

export { generateContentFromWP } from "./node/genContentFromWP.mjs";
export { WP_EXPORT_LINKS_SCHEMA } from "./wp/links.mjs";
export { WP_EXPORT_PAGES_SCHEMA, definePages } from "./wp/pages.mjs";
export { WP_EXPORT_POSTS_SCHEMA, definePosts } from "./wp/posts.mjs";
export { getAstroSitemap } from "./wp/sitemap.js";

export const wpCollections = {
  posts: definePosts,
  pages: definePages
};





