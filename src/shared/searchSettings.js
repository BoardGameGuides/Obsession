import { Pipeline, stemmer } from 'lunr';

/**
 * Applies the specified function to all tokens but only if it's being indexed for a specified field.
 * @param {string} fieldName The field to skip the function for.
 * @param {lunr.PipelineFunction} pipelineFunction The function to wrap.
 * @returns {lunr.PipelineFunction}
 */
function onlyField(fieldName, pipelineFunction) {
  return (token, i, tokens) => {
    if (/** @type {any} */ (token).metadata.fields.indexOf(fieldName) === -1) {
      return token;
    }
    return pipelineFunction(token, i, tokens);
  };
}

/**
 * Executes the specified function, and if the function removes or modifies the token, also includes the unmodified token in the result.
 * @param {lunr.PipelineFunction} pipelineFunction The function to wrap.
 * @returns {lunr.PipelineFunction}
 */
function includeUnmodified(pipelineFunction) {
  return (token, i, tokens) => {
    const result = pipelineFunction(token, i, tokens);
    if (!result) {
      // No result -> return original token
      return token;
    }
    if (Array.isArray(result)) {
      // Multiple results from function
      for (const tokenResult of result) {
        if (tokenResult.toString() === token.toString()) {
          // One token matches -> return results from function
          return result;
        }
      }
      // No token matches -> add original token to results from function
      result.push(token);
      return result;
    }
    // Single result from function
    if (result.toString() === token.toString()) {
      // Result matches token -> return result from function
      return result;
    }
    // Result does not match -> return result from function with original token
    return [result, token];
  };
}

export const stemText = onlyField('text', stemmer);
export const stemAndPreserve = includeUnmodified(stemmer);
Pipeline.registerFunction(stemText, 'stemText');
Pipeline.registerFunction(stemAndPreserve, 'stemAndPreserve');
