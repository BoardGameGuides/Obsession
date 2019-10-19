/** 
 * @typedef ImportedFile A file that has been dynamically imported.
 * @property {string} path The relative path to the file.
 * @property {any} importedModule The result of importing the module. This type may vary depending on the loaders used.
 */

/** Imports the specified files.
 * @param {any} r The result of a call to `require.context`.
 * @returns {{ [path: string]: ImportedFile}}
 */
export function importContext(r) {
  /** @type {{ [path: string]: ImportedFile }} */
  const result = {};
  for (const path of r.keys()) {
    result[path] = { path, importedModule: r(path) };
  }
  return result;
}
