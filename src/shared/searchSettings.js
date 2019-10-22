import { Pipeline, stemmer, trimmer, generateStopWordFilter } from 'lunr';

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

/** @type {lunr.PipelineFunction} */
function dumbQuotes(token) {
  const str = token.toString();
  if (!str.match(/[\u2018\u2019\u201C\u201D]/)) {
    return token;
  }
  return token.update(x => x.replace(/[\u2018\u2019]/g, "'").replace(/[\u201C\u201D]/g, '"'));
}

/** @type {lunr.PipelineFunction} */
function caseFold(token) {
  const str = token.toString();
  if (!str.match(/[A-Z]/)) {
    return token;
  }
  return token.update(x => x.toLowerCase());
}

/** @type {lunr.PipelineFunction} */
function trimPossessive(token) {
  // The stemmer doesn't implement Step 0 of Porter; this is left to the trimmer.
  // The trimmer doesn't support words ending in "'s".
  const str = token.toString();
  if (str.length <= 2 || !str.match(/'s$/)) {
    return token;
  }
  return token.update(x => x.replace(/'s$/, ''));
}

/** @type {lunr.PipelineFunction} */
function splitOnSymbols(token) {
  const str = token.toString();
  if (!str.match(/[^A-Za-z0-9]/)) {
    return token;
  }
  return str.split(/[^A-Za-z0-9]/).filter(x => x).map(x => token.clone(() => x));
}

/** @type {lunr.PipelineFunction} */
function filterEmpty(token) {
  const str = token.toString();
  if (str === '') {
    return void 0;
  }
  return token;
}

const stemText = onlyField('text', stemmer);
const stemAndPreserve = includeUnmodified(stemmer);
const stopWords = onlyField('text', generateStopWordFilter(['a', 'an', 'and', 'are', 'as', 'by', 'for', 'from', 'in', 'is', 'of', 'on', 'or', 'that', 'the', 'to', 'was', 'when', 'with']));

Pipeline.registerFunction(stemText, 'stemText');
Pipeline.registerFunction(stemAndPreserve, 'stemAndPreserve');
Pipeline.registerFunction(dumbQuotes, 'dumbQuotes');
Pipeline.registerFunction(caseFold, 'caseFold');
Pipeline.registerFunction(trimPossessive, 'trimPossessive');
Pipeline.registerFunction(splitOnSymbols, 'splitOnSymbols');
Pipeline.registerFunction(filterEmpty, 'filterEmpty');
Pipeline.registerFunction(stopWords, 'stopWords');

export const unstemmedPipelineFunctions = [dumbQuotes, caseFold, trimPossessive, trimmer, splitOnSymbols, filterEmpty, stopWords];
export const pipelineFunctions = [...unstemmedPipelineFunctions, stemText];
export const searchPipelineFunctions = [...unstemmedPipelineFunctions, stemAndPreserve];
