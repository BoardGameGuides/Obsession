import { Pipeline, Token } from 'lunr';
import { unstemmedPipelineFunctions, pipelineFunctions } from '../src/shared/searchSettings';

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
    const token = new Token(word, { fields: ['text'] });
    const pipelineResult = pipeline.run([token]).map(x => x.toString());
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
    const token = new Token(word, { fields: ['text'] });
    for (const result of pipeline.run([token]).map(x => x.toString())) {
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
export function stemmedFrequency(text) { return frequency(text, ...pipelineFunctions); }
