import { Pipeline, stemmer } from 'lunr';
import { unstemmedPipelineFunctions } from '../src/shared/searchSettings';

/**
 * @param {string} text
 * @param {lunr.PipelineFunction[]} [pipelineFunctions]
 * @returns {{[key: string]: number}}
 */
export function frequency(text, ...pipelineFunctions) {
  /** @type {{[key: string]: number}} */
  const result = {};
  const pipeline = new Pipeline();
  pipeline.add(...pipelineFunctions);
  for (const word of text.split(' ').filter(x => x)) {
    const pipelineResult = pipeline.runString(word);
    for (const trimmedWord of pipelineResult) {
      if (trimmedWord in result) {
        result[trimmedWord] = result[trimmedWord] + 1;
      } else {
        result[trimmedWord] = 1;
      }
    }
  }
  return result;
}

/**
 * @param {string} text
 */
export function sanityCheck(text) {
  const pipeline = new Pipeline();
  pipeline.add(...unstemmedPipelineFunctions);
  for (const word of text.split(' ').filter(x => x)) {
    for (const result of pipeline.runString(word)) {
      if (result.match(/[^A-Za-z0-9]/)) {
        console.log('WARN: Word has symbols', word, result);
      } else if (result === '') {
        console.log('WARN: Empty word detected', word, result);
      }
    }
  }
}

/**
 * @param {string} text
 * @returns {{[key: string]: number}}
 */
export function wordFrequency(text) { return frequency(text, ...unstemmedPipelineFunctions); }

/**
 * @param {string} text
 * @returns {{[key: string]: number}}
 */
export function stemmedFrequency(text) { return frequency(text, ...unstemmedPipelineFunctions, stemmer); }
