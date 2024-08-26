#!/usr/bin/env node

import WPAPI from "wpapi";
import axios from "axios";
import _ from "lodash";
import fse from "fs-extra";
import { uid } from 'uid';

import * as stream from 'node:stream';
import { promisify } from 'node:util';

const finished = promisify(stream.finished);

async function getAll( wpAction, pageNum=1 ) {
  return wpAction.page(pageNum)
    .then(function( response ) {
      let wpTotal = response.headers['x-wp-total'];
      let wpTotalPages = response.headers['x-wp-totalpages'];
      if ( !wpTotal || !wpTotalPages || ( pageNum >= +wpTotalPages ) ) {
        return response;
      }
      // Request the next page and return both responses as one collection
      return Promise.all([
        response,
        getAll( wpAction, pageNum + 1 )
      ]).then(( responses ) => {
        responses[0].data = responses[0].data.concat( responses[1].data );
        return responses[0]
      });
    });
}

export async function downloadFile(fileUrl, outputLocationPath) {
  const writer = fse.createWriteStream(outputLocationPath);
  return axios({
    method: 'get',
    url: fileUrl,
    responseType: 'stream',
  }).then(response => {
    response.data.pipe(writer);
    return finished(writer); //this is a Promise
  });
}

const sanitizeWPData = ( item = {}, options = {
  processStringDataValueFn: _.noop
}) => {
  if ( _.isString( item ) ) {
    let newItem = options.processStringDataValueFn( item );
    return _.isString(newItem) ? newItem : item;
  } else if ( _.isNumber( item ) ) {
    // nothing to do
    return item;
  } else if ( _.isArray( item ) ) {
    let arry = [];
    for( let child of item ) {
      child = sanitizeWPData( child, options );
    }
    return arry;
  } else if ( _.isObject( item ) ) {
    let obj = {}
    for( let childKey of Object.keys( item ) ) {
      let child = item[childKey];
      child = sanitizeWPData( child, options );
      obj[ childKey ] = child;
    }
    return obj;
  }
  return item;
}

export const generateContentFromWP = async (options = {
  processStringDataValueFn: _.noop,
  srcContentFolder: `./src/content`,
  publicAssetsFolder: `./public/wp`,
  exportData: true,
  exportMedia: true,
  encoding: "utf8",
  wp_api_endpoint: "https://localhost:8000/wp",
}) => {

  const API = new WPAPI( {
    endpoint: options.wp_api_endpoint,
    transport: axios
  } );

  const WP = await API.bootstrap();
  const posts = await getAll( WP.posts() );
  const pages = await getAll( WP.pages() );
  const media = await getAll( WP.media() );
  const blocks = await getAll( WP.blocks() );
  const types = await getAll( WP.types() );
  const statuses = await getAll( WP.statuses() );
  const taxonomies = await getAll( WP.taxonomies() );
  const categories = await getAll( WP.categories() );
  const tags = await getAll( WP.tags() );
  const users = await getAll( WP.users() );
  const comments = await getAll( WP.comments() );
  const search = await getAll( WP.search() );
// const settings = await getAll( WP.settings() ); // TODO: Address errors if this is ever needed
// const themes = await getAll( WP.themes() ); // TODO: Address errors if this is ever needed

  const cache = {
    posts,
    pages,
    media,
    blocks,
    types,
    statuses,
    taxonomies,
    categories,
    tags,
    users,
    comments,
    search,
    // settings,
    // themes
  }

  // clean
  _.each( cache, ( cachedItem, cachedItemKey ) => {
    _.each( cachedItem.data, data => {
      let folderName = `${options.srcContentFolder}/${cachedItemKey}/`;
      fse.removeSync( folderName )
      fse.mkdirpSync( folderName );
      let staticFolderName = `${options.publicAssetsFolder}/`;
      fse.removeSync( staticFolderName )
      fse.mkdirpSync( staticFolderName );
    })
  })

  if ( options.exportData ) {
    // write data files
    _.each( cache, ( cachedItem, cachedItemKey ) => {
      _.each( cachedItem.data, data => {
        let id = uid();
        if ( _.has( data, "slug" ) ) {
          id = data.slug;
        } else if ( _.has( data, "id" ) ) {
          id = data.id;
        }
        // clean the data before proceeding
        let sanitizedData = sanitizeWPData( data, options );

        let file = JSON.stringify( sanitizedData, null, 2 );
        let folderName = `${options.srcContentFolder}/${cachedItemKey}/`;
        let fileName = `${id}.json`;
        fse.writeFileSync( `${folderName}${fileName}`, file, { encoding: options.encoding } )
      })
    })
  }

  if ( options.exportMedia ) {
    // save all media files
    for ( let data of media.data ) {
      for ( let size of Object.keys( data.media_details.sizes ) ) {
        let item = data.media_details.sizes[size];
        let fileName = item.file;
        let nameSplit = item.source_url.split("wp-content/")[1].split("/");
        let publicFolderName = options.publicAssetsFolder;
        while ( nameSplit.length > 1 ) {
          publicFolderName = `${publicFolderName}${nameSplit.shift()}/`;
        }
        fileName = nameSplit[0];
        fse.mkdirpSync( publicFolderName, {} );
        await downloadFile( item.source_url , `${publicFolderName}${fileName}`)

      }
    }
  }

  return cache;
}
