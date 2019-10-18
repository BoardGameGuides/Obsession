export function importContext(r) {
  const result = {};
  for (const path of r.keys()) {
    result[path] = { path, importedModule: r(path) };
  }
  return result;
}
