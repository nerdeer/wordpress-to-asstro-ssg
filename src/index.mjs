import {defineCollection, getCollection, z} from 'astro:content';
import {definePages} from "./wp/pages.mjs";
import {definePosts} from "./wp/posts.mjs";

// WP exports

export * from "./wp/links.mjs";
export * from "./wp/pages.mjs";
export * from "./wp/posts.mjs";
export * from "./wp/sitemap.js";

export const wpCollections = {
  definePosts,
  definePages
};





