import { importContext } from './importer';

// @ts-ignore
const imageContext = require.context('./content/', true, /\.(jpg|png)$/);
export const images = importContext(imageContext);

// @ts-ignore
const pagesContext = require.context('!babel-loader!mdx-loader!./content/', true, /\.mdx$/);
export const pages = importContext(pagesContext);

/**
 * @typedef Route An imported MDX file that has a route.
 * @property {string} path The relative path to the file.
 * @property {string} route The (computed) route for the file.
 * @property {any} Component The MDX file, as a React component.
 * @property {any} metadata The metadata for this file (from the front matter).
 */

/** @type {{ [route: string]: Route }} */
export const routes = {};
for (const path in pages) {
  // Trim leading '.' characters and ending '.mdx'
  const route = path.replace(/^\.+/, '').replace(/\.mdx$/, '');
  routes[route] = {
    path,
    route,
    Component: pages[path].importedModule.default,
    metadata: pages[path].importedModule.frontMatter
  };
}
