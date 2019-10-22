import { Pipeline, stemmer, trimmer, generateStopWordFilter } from 'lunr';
import { toWords } from 'number-to-words';
import searchThesaurus from './game-specific/search-thesaurus';

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

/**
 * Creates a pipeline function that performs word replacement using a thesaurus.
 * This function should only be used when building the index.
 * @param {{[original: string]: string[]}} wordMapping 
 * @returns {lunr.PipelineFunction}
 */
function generateThesaurus(wordMapping) {
  return token => {
    const str = token.toString();
    if (str in wordMapping) {
      const synonyms = wordMapping[str];
      return [token, ...synonyms.map(word => token.clone(() => word))];
    }
    return token;
  }
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
  if (!str.match(/[-/]/)) {
    return token;
  }
  return str.split(/[-/]/).filter(x => x).map(x => token.clone(() => x));
}

/** @type {lunr.PipelineFunction} */
function filterEmpty(token) {
  const str = token.toString();
  if (str !== '') {
    return token;
  }
  return void 0;
}

/**
 * Converts a string representation of a number to a text description of a number.
 * @param {string} text
 * @returns {string[]}
 */
export function numberToWords(text) {
  return toWords(parseInt(text, 10)).replace(/[-,]/g, ' ').split(' ').filter(x => x);
}

/** @type {lunr.PipelineFunction} */
function numbersToWords(token) {
  const str = token.toString();
  if (!str.match(/^[0-9]+$/)) {
    return token;
  }
  return [token, ...numberToWords(str).map(x => token.clone(() => x))];
}

const stemText = onlyField('text', stemmer);
const stemAndPreserve = includeUnmodified(stemmer);
const stopWords = onlyField('text', generateStopWordFilter(['a', 'an', 'and', 'are', 'as', 'by', 'for', 'from', 'in', 'is', 'of', 'on', 'or', 'that', 'the', 'to', 'was', 'when', 'with']));
const thesaurus = generateThesaurus(searchThesaurus);

Pipeline.registerFunction(stemText, 'stemText');
Pipeline.registerFunction(stemAndPreserve, 'stemAndPreserve');
Pipeline.registerFunction(dumbQuotes, 'dumbQuotes');
Pipeline.registerFunction(caseFold, 'caseFold');
Pipeline.registerFunction(trimPossessive, 'trimPossessive');
Pipeline.registerFunction(splitOnSymbols, 'splitOnSymbols');
Pipeline.registerFunction(filterEmpty, 'filterEmpty');
Pipeline.registerFunction(stopWords, 'stopWords');
Pipeline.registerFunction(thesaurus, 'thesaurus');
Pipeline.registerFunction(numbersToWords, 'numbersToWords');

/** The pipeline functions applied to both build and search pipelines. No thesaurus or stemming is done. */
const sharedPipelineFunctions = [dumbQuotes, caseFold, trimPossessive, trimmer, splitOnSymbols, filterEmpty, stopWords];

/** The pipeline functions applied to the build pipeline. */
export const buildPipelineFunctions = [...sharedPipelineFunctions, numbersToWords, thesaurus, stemText];

/** The pipeline functions applied to the search pipeline. */
export const searchPipelineFunctions = [...sharedPipelineFunctions, stemAndPreserve];

/** The pipeline functions applied to the build pipeline, with thesaurus removed. */
export const buildPipelineFunctionsExceptThesaurus = buildPipelineFunctions.filter(x => x !== thesaurus);

/** The pipeline functions applied to the build pipeline, with thesaurus and stemming removed. */
export const buildPipelineFunctionsExceptThesaurusAndStemming = buildPipelineFunctions.filter(x => x !== thesaurus && x !== stemText);
