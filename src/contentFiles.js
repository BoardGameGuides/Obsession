import { importContext } from './importer';

export const images = importContext(require.context('./content/', true, /\.(jpg|png)$/));

export const pages = importContext(require.context('!babel-loader!mdx-loader!./content/', true, /\.mdx$/));

export const routes = {};
for (const path in pages) {
  const route = path.replace(/^\.+/, '').replace(/\.mdx$/, '');
  routes[route] = {
    path,
    route,
    Component: pages[path].importedModule.default,
    metadata: pages[path].importedModule.frontMatter
  };
}
