// Handles "relative paths", i.e., compatible with Babel relative import syntax.
// - Relative paths are never empty.
// - Relative paths must start with '.' or '..' as its first segment.
//   - A relative path may be just '.' or '..'.
// - Relative paths do not end in a '/'.
//   - '/' is used as a segment separator *within* the relative path; the relative path may not start or end with '/'.
// - These methods have no concept of "files"; if there is a segment, it is treated as a directory.
//   - If you have a path pointing to a file, then to get the directory, combine it with '..'.

function pathParent(input) {
  if (input.startsWith('..')) {
    return '../' + input;
  }
  if (input === '.') {
    return '..';
  }
  return input.substring(0, input.lastIndexOf('/'));
}

export function combine(base, ...others) {
  let result = base;
  for (const next of others) {
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
