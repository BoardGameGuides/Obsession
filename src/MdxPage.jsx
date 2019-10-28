import React from 'react';
import { Link } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import { isExternal, resolveRoute } from './shared/path';
import { images, imagesDimensions, routes } from './contentFiles';

/**
 * Produces `img` tags, interpreting local paths as references to imported images.
 * @param {string} route
 * @returns {(props: any) => JSX.Element}
 */
function RelativeImage(route) {
  return function (props) {
    if (isExternal(props.src))
      return <img {...props} alt={props.alt} />;

    const imageImportPath = resolveRoute(routes[route].path, props.src);
    const image = images[imageImportPath].importedModule;
    const imageDimensions = imagesDimensions[imageImportPath].importedModule;
    return <img {...props} alt={props.alt} src={image} width={imageDimensions.width} height={imageDimensions.height} />;
  };
}

/**
 * Produces link tags, interpreting local paths as references to imported MDX files.
 * @param {string} route
 * @returns {(props: any) => JSX.Element}
 */
function RelativeLink(route) {
  return function (props) {
    if (isExternal(props.href))
      return <a {...props}>{props.children}</a>;

    const relativePath = resolveRoute(route, props.href);
    return <Link {...props} to={relativePath} />;
  }
}

/**
 * Renders an imported MDX page.
 * @param {{ route: string; }} props
 */
export default function MdxPage(props) {
  const route = props.route;
  const components = {
    img: RelativeImage(route),
    a: RelativeLink(route)
  };
  return (
    <div>
      <h1>{routes[route].metadata.title}</h1>
      <MDXProvider components={components}>{React.createElement(routes[route].Component)}</MDXProvider>
    </div>
  );
}
