import React from 'react';
import { Link } from 'react-router-dom';
import { MDXProvider } from '@mdx-js/react';
import { combine } from './path';
import { images, routes } from './contentFiles';

/** Whether the string is an external resource, i.e., an absolute or protocol relative URI. */
function isExternal(text) {
  return text.startsWith('//') || text.search(/^[a-zA-Z]+:/) !== -1;
}

function RelativeImage(route) {
  return function (props) {
    if (isExternal(props.src))
      return <img {...props} alt={props.alt} />;

    const imageImportPath = combine(routes[route].path, '..', props.src);
    const image = images[imageImportPath].importedModule;
    return <img {...props} alt={props.alt} src={image} />;
  };
}

function RelativeLink(route) {
  return function (props) {
    if (isExternal(props.href))
      return <a {...props}>{props.children}</a>;

    const relativePath = combine(routes[route].path, '..', props.href);
    return <Link {...props} to={relativePath} />;
  }
}

export default function MdxPage(props) {
  const route = props.route;
  const components = {
    img: RelativeImage(route),
    a: RelativeLink(route)
  };
  return (
    <MDXProvider components={components}>{React.createElement(routes[route].Component)}</MDXProvider>
  );
}
