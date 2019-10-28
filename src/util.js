/**
 * Maps the properties of one object to properties of another object, without changing key values.
 * @param {{[key: string]: TInput}} obj 
 * @param {(obj: TInput, key?: string) => TOutput} fn 
 * @returns {{[key: string]: TOutput}}
 * @template TInput, TOutput
 */
export function objmap(obj, fn) {
  /** @type {{[key: string]: TOutput}} */
  const result = {};
  for (const key of Object.keys(obj)) {
    result[key] = fn(obj[key], key);
  }
  return result;
}