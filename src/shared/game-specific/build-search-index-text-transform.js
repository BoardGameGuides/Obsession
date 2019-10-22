/**
 * A transformation function performed immediately after translating an mdx file to plain-text.
 * @param {string} text
 * @returns {string}
 */
export default function transform(text) {
  return text.replace('£', ' pounds ');
}