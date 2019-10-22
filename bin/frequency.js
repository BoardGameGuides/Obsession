import { Pipeline, Token } from 'lunr';
import { buildPipelineFunctionsExceptThesaurus, buildPipelineFunctionsExceptThesaurusAndStemming } from '../src/shared/searchSettings';

/**
 * Runs a word through a pipeline as though it were in the 'text' field.
 * @param {lunr.Pipeline} pipeline 
 * @param {string} word 
 * @returns {string[]}
 */
function runPipeline(pipeline, word) {
  const token = new Token(word, { fields: ['text'] });
  return pipeline.run([token]).map(x => x.toString());
}

/**
 * Calculates the frequency of a collection of words after they've been passed through a lunr pipeline.
 * @param {string[]} words
 * @param {lunr.PipelineFunction[]} [pipelineFunctions]
 * @returns {{[key: string]: number}}
 */
function frequency(words, ...pipelineFunctions) {
  /** @type {{[key: string]: number}} */
  const result = {};
  const pipeline = new Pipeline();
  pipeline.add(...pipelineFunctions);
  for (const word of words) {
    for (const resultWord of runPipeline(pipeline, word)) {
      if (resultWord in result) {
        result[resultWord] = result[resultWord] + 1;
      } else {
        result[resultWord] = 1;
      }
    }
  }
  return result;
}

/**
 * Performs basic sanity checking on a collection of words after they've been passed through the pipeline (without stemming).
 * @param {string[]} words
 */
export function sanityCheck(words) {
  const pipeline = new Pipeline();
  pipeline.add(...buildPipelineFunctionsExceptThesaurusAndStemming);
  for (const word of words) {
    for (const result of runPipeline(pipeline, word)) {
      if (result.match(/[^A-Za-z0-9]/)) {
        console.log('WARN: Word has symbols', word, result);
      } else if (result === '') {
        console.log('WARN: Empty word detected', word, result);
      }
    }
  }
}

/**
 * @param {string[]} words
 * @returns {{[key: string]: number}}
 */
export function wordFrequency(words) { return frequency(words, ...buildPipelineFunctionsExceptThesaurusAndStemming); }

/**
 * @param {string[]} words
 * @returns {{[key: string]: number}}
 */
export function stemmedFrequency(words) { return frequency(words, ...buildPipelineFunctionsExceptThesaurus); }
