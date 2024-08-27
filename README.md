# wordpress-to-asstro-ssg

[NPM](https://www.npmjs.com/package/wordpress-to-asstro-ssg)

export WordPress content into an Astro SSG project.

This is for Astro projects configured for a static output using the local files router.

There are two parts to this project. 

## PART 1: The data collections. 

In your Astro content config, `./src/conetne/config.ts`, we need to tell Astro what the WordPress data schemas are.

To do this, provide the used WordPress schemas ( ex: Posts and Pages ) definitions to this config file. 

ex: 

```js
import {definePosts, definePages} from "wordpress-to-asstro-ssg";

export const collections = {
	posts: definePosts,
	pages: definePages
};

```

## PART 2: Generating the data

To use the data in Wordpress, we will generate local JSON files. We also need to collect the assets.

to do so, make a node script for your project.

In this script, first import as source by copying this line:

```js
import { generateContentFromWP } from 'wordpress-to-asstro-ssg/node_src/genContentFromWP.mjs';
```

And you may need to include any shared dependencies in your project as well.

Now call the generate function with your own options in a new file. Here, I'm using the file `./node_src/genContentFromWP.mjs`.

example:

```js

await generateContentFromWP({
  processStringDataValueFn: processWPStringItem,
  srcContentFolder: `./src/content`,
  publicAssetsFolder: `./public/wp`,
  exportData: true,
  exportMedia: true,
  encoding: "utf8",
  wp_api_endpoint: 'https://staging.mywordpress.com/wp-json/',
})
```

And include the string processing function. WordPress content may be improperly encoded, and will depend on your setup.

Since this may be different on each setup, you are required to supply this function.

WARN: This is the main cause of unexpected characters on the output JSON.

For example, here is a starting point:

```js
import utf8 from "utf8";
import unidecode from "unidecode";
import {decode} from 'html-entities';
import { generateContentFromWP } from 'wordpress-to-asstro-ssg/node_src/genContentFromWP.mjs';

const processWPStringItem = ( item ) => {
  // HTML entities decode
  item = decode( item );
  // UNIcode decode
  item = unidecode( item );
  // UTF8 decode
  item = utf8.decode( item );
  // urls
  item = item.replaceAll( "http://mywordpress/", "" );
  item = item.replaceAll( "https://mywordpress/", "" );
  item = item.replaceAll( "http://staging.mywordpress/", "" );
  item = item.replaceAll( "https://staging.mywordpress/", "" );
  item = item.replaceAll( "http://mywordpress", "" );
  item = item.replaceAll( "https://mywordpress", "" );
  item = item.replaceAll( "http://staging.mywordpress", "" );
  item = item.replaceAll( "https://staging.mywordpress", "" );
  // media paths
  item = item.replaceAll( "wp-content/", "/wp/" );
  // strange edge cases
  item = item.replaceAll( "wp-json/wp/v2/", "" );
  // Extras
  return item;
}
```

Next, run this script with node, ex: 

```shell
node ./bin/genContentFromWP.mjs
```

This will access your WordPress instance and generate the JSON data as well as copying over any assets from WordPress.

At this point, you can access the data with Astro. Example:

```js
const pages = (await getCollection('pages')).sort(
	(a, b) => a.data.modified.valueOf() - b.data.modified.valueOf()
);
```

### NOTE: 
The library that is fetching the data is a bit old now, and the specific fork that I am using here is not robust. It works for now, but I expect that this might cause errors at some point.

## Bonus: SiteMap

I also wanted a SiteMap data structure for my projects, which is included here.

```js

import {getAstroSitemap} from "wordpress-to-asstro-ssg";
let siteMap = await getAstroSitemap();

<section>
  <h4>Pages:</h4>
  <ul>
    {
      _.map(Object.values( siteMap.pages ), (parent) => (
          parent.isRootItem &&
          <li>
            <a href={`/${parent.data.slug}/`}>
              <h4 class="title">{parent.data.title.rendered}</h4>
            </a>

            { parent.children &&
                <ul>
                  {
                    _.map(Object.values( parent.children ), (child) => (
                        <li>
                          <a href={`/${child.data.slug}/`}>
                            <h5 class="title">{child.data.title.rendered}</h5>
                          </a>
                          
                          // and so on, deep nesting needs better JSX logic here 
                          
                        </li>
                    ))
                  }
                </ul>
            }
          </li>
      ))
    }
  </ul>

  <br />
  <br />
  <br />

  <h4>Posts:</h4>
  <ul>

    {
      _.map(Object.values( siteMap.posts ), (parent) => (
          <li>
            <a href={`/${parent.data.slug}/`}>
              <h4 class="title">{parent.data.title.rendered}</h4>
            </a>
          </li>
      ))
    }
  </ul>
</section>

```

Then, Astro can build the sitemap.xml files with this config in the `astro.config.mjs` file:

```js
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://mywebsite.com',
  integrations: [
    sitemap(),
  ]
});

```
