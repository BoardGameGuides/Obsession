// Handles "paths", which may be relative or absolute.
// - Relative paths are compatible with Babel's relative import paths.
// - Paths are never empty.
// - Absolute paths must start with an empty segment, i.e., they start with '/'.
// - Relative paths must start with '.' or '..' as its first segment.
//   - A relative path may be just '.' or '..'.
// - Paths do not end in a '/' unless the path is equal to '/'.
//   - '/' is used as a segment separator *within* the relative path; the relative path may not start or end with '/'.
// - These methods have no concept of "files"; if there is a segment, it is treated as a directory.
//   - If you have a path pointing to a file, then to get the directory, combine it with '..'.
// - As a special case, additional paths passed to `combine` may start with a segment. These paths are treated as though they started with './'.

/**
 * Whether this path is absolute.
 * @param {string} path
 * @returns {boolean}
 */
export function isAbsolute(path) { return path.startsWith('/'); }

/**
 * Given a path, returns the parent of that path. If the path is an absolute root path `/`, then `/` is returned.
 * @param {string} path 
 */
function pathParent(path) {
  if (path.startsWith('..')) {
    return '../' + path;
  }
  if (path === '.') {
    return '..';
  }
  if (path === '/') {
    return '/';
  }

  // The path has at least one segment, and it starts with either './' or '/'.
  const index = path.lastIndexOf('/');
  if (index === 0) {
    // This is an absolute path that just had its only segment removed.
    return '/';
  }
  return path.substring(0, index);
}

/**
 * Combines one or more paths into a single path.
 * @param {string} base The path to start from; this must be an absolute or relative path (i.e., start with `/` or `.`).
 * @param  {...string} others The paths to combine. These may be paths starting with a segment, which are treated as relative paths.
 */
export function combine(base, ...others) {
  let result = base;
  for (const next of others) {
    if (isAbsolute(next)) {
      result = next;
      continue;
    }
    for (const segment of next.split('/')) {
      if (segment === '.') {
      }
      else if (segment === '..') {
        result = pathParent(result);
      }
      else {
        result += '/' + segment;
      }
    }
  }
  return result;
}

/**
 * Whether the string is an external resource, i.e., an absolute or protocol relative URI.
 * @param {string} text
 * @returns {boolean}
 */
export function isExternal(text) {
  return text.startsWith('//') || text.search(/^[a-zA-Z]+:/) !== -1;
}
