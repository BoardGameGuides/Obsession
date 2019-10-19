import { importContext } from './importer';

// @ts-ignore
const imageContext = require.context('./content/', true, /\.(jpg|png)$/);
export const images = importContext(imageContext);

// @ts-ignore
const pagesContext = require.context('!babel-loader!mdx-loader!./content/', true, /\.mdx$/);
export const pages = importContext(pagesContext);

/**
 * Gets the display title for an MDX file.
 * @param {string} title 
 * @param {string} route 
 */
function displayTitle(title, route) {
  if (!title) {
    console.log('Mdx file missing title', route);
  }
  if (route.startsWith('/guest/casual')) {
    return title + ' (Casual Guest)';
  }
  if (route.startsWith('/guest/prestige')) {
    return title + ' (Prestige Guest)';
  }
  if (route.startsWith('/guest')) {
    return title + ' (Guest)';
  }
  if (route.startsWith('/tile')) {
    return title + ' (Estate Tile)';
  }
  if (route.startsWith('/meeple')) {
    return title + ' (Meeple)';
  }
  return title;
}

/**
 * @typedef Route An imported MDX file that has a route.
 * @property {string} path The relative path to the file.
 * @property {string} route The (computed) route for the file.
 * @property {string} displayTitle The fully descriptive title to display for the file.
 * @property {any} Component The MDX file, as a React component.
 * @property {any} metadata The metadata for this file (from the front matter).
 */

/** @type {{ [route: string]: Route }} */
export const routes = {};
for (const path in pages) {
  // Trim leading '.' characters and ending '.mdx'
  const route = path.replace(/^\.+/, '').replace(/\.mdx$/, '');
  const metadata = pages[path].importedModule.frontMatter;
  routes[route] = {
    path,
    route,
    Component: pages[path].importedModule.default,
    displayTitle: displayTitle(metadata.title, route),
    metadata
  };
}
