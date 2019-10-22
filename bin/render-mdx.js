import { transformAsync } from '@babel/core';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import mdxAsync from '@mdx-js/mdx';
import { MDXProvider, mdx } from '@mdx-js/react';
import frontmatter from 'remark-frontmatter';
import visit from 'unist-util-visit';
import { safeLoad } from 'js-yaml';

// https://mdxjs.com/getting-started#do-it-yourself
// https://mdxjs.com/advanced/plugins#using-remark-and-rehype-plugins

/** @typedef {import("unist").Node} Node */

/**
 * Captures YAML output from a single node in the tree.
 * @param {{yaml: {}}} container The holder of the YAML output.
 * @returns {() => (tree: Node) => void}
 */
function captureYaml(container) {
  return () => tree =>
    visit(tree, 'yaml', node => {
      container.yaml = safeLoad(/** @type {any} */ (node).value);
    });
}

/**
 * Performs a Babel transform of the JSX code.
 * @param {string} code The source code to transform.
 * @returns {Promise<string>}
 */
async function transformJsxAsync(code) {
  const result = await transformAsync(code, {
    plugins: [
      '@babel/plugin-transform-react-jsx',
      '@babel/plugin-proposal-object-rest-spread'
    ]
  });
  return result.code;
}

/**
 * Renders the MDX file to an HTML string with frontmatter.
 * @param {string} mdxFile
 * @returns {Promise<{frontmatter: object, html: string}>}
 */
export async function renderToHtmlAsync(mdxFile) {
  const container = { yaml: null };
  const jsx = await mdxAsync(mdxFile, { skipExport: true, remarkPlugins: [frontmatter, captureYaml(container)] });
  const code = await transformJsxAsync(jsx);
  const scope = { mdx };
  const fn = new Function(
    'React',
    ...Object.keys(scope),
    `${code}; return React.createElement(MDXContent)`
  );
  const element = fn(React, ...Object.values(scope));
  const elementWithProvider = React.createElement(MDXProvider, {}, element);
  return { frontmatter: container.yaml, html: renderToStaticMarkup(elementWithProvider) };
}
