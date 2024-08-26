import _ from "lodash";
import {getCollection} from "astro:content";

const getChildren = ( parentId, collection = [] ) => {
  if ( !parentId || parentId === 0 ) {
    return [];
  }
  return _.filter( collection, ( contentItem ) => {
    let id = _.has( contentItem.data, 'parent' ) ? contentItem.data.parent : -1;
    return parentId === id;
  })
}

export const recursiveMapParentChild = ( source, allPagesMapped = {} ) => {
  for ( let item of source ) {
    let itemId =  _.has( item.data, 'id' ) ? item.data.id : 0;
    let parentId =  _.has( item.data, 'parent' ) ? item.data.parent : 0;
    let isRootItem = ( parentId === 0 );
    let children = getChildren( itemId, source );
    recursiveMapParentChild( children, allPagesMapped );
    item.isRootItem = isRootItem;
    item.children =
        _.has( item, "children" ) ?
            _.uniq( item.children.concat( children ) ) :
            children;
    if ( isRootItem ) {
      allPagesMapped[itemId] = item;
    }
  }
}

export const getAstroSitemap = async () => {

  const allPages = (await getCollection('pages')).sort(
      (a, b) => a.data.modified.valueOf() - b.data.modified.valueOf()
  );
  const allPosts = (await getCollection('posts')).sort(
      (a, b) => a.data.modified.valueOf() - b.data.modified.valueOf()
  );

  const allPagesMapped = {};

  recursiveMapParentChild( allPages, allPagesMapped );

  return {
    pages: allPagesMapped,
    posts: allPosts
  };
}
