/**
 * A mapping of words to use when building the search index.
 * This mapping is unidirectional from right to left:
 *   `"pounds": ["money"]` means that searches for "money" will also find "pounds".
 *   It does *not* mean that searches for "pounds" will find "money".
 */
export default {
  "pounds": ["money"]
}