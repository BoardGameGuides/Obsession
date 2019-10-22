const babel = require('@babel/core')
const React = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const mdx = require('@mdx-js/mdx')
const { MDXProvider, mdx: createElement } = require('@mdx-js/react')
const frontmatter = require('remark-frontmatter');
var visit = require('unist-util-visit')
const yaml = require('js-yaml');
const htmlparser2 = require("htmlparser2");

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
      container.yaml = yaml.safeLoad(/** @type {any} */ (node).value);
    });
}

/**
 * Performs a Babel transform of the JSX code.
 * @param {string} code The source code to transform.
 * @returns {string}
 */
function transform(code) {
  return babel.transform(code, {
    plugins: [
      '@babel/plugin-transform-react-jsx',
      '@babel/plugin-proposal-object-rest-spread'
    ]
  }).code;
}

/**
 * Renders the MDX file to an HTML string with frontmatter.
 * @param {string} mdxFile
 * @returns {Promise<{frontmatter: {}, html: string}>}
 */
async function renderToHtml(mdxFile) {
  const container = { yaml: null };
  const jsx = await mdx(mdxFile, { skipExport: true, remarkPlugins: [frontmatter, captureYaml(container)] });
  const code = transform(jsx);
  const scope = { mdx: createElement };
  const fn = new Function(
    'React',
    ...Object.keys(scope),
    `${code}; return React.createElement(MDXContent)`
  );
  const element = fn(React, ...Object.values(scope));
  const elementWithProvider = React.createElement(MDXProvider, {}, element);
  return { frontmatter: container.yaml, html: renderToStaticMarkup(elementWithProvider) };
}

/**
 * Renders the MDX file to a plain-text string with frontmatter.
 * @param {string} mdxFile
 * @returns {Promise<{frontmatter: {}, text: string}>}
 */
export async function renderToPlainText(mdxFile) {
  const htmlResult = await renderToHtml(mdxFile);
  let textResult = '';
  const parser = new htmlparser2.Parser({
    onclosetag() {
      textResult += ' ';
    },
    ontext(text) {
      textResult += text;
    }
  }, { decodeEntities: true });
  parser.write(htmlResult.html);
  parser.end();
  return { frontmatter: htmlResult.frontmatter, text: textResult.replace(/\s+/g, ' ').trim() };
}
