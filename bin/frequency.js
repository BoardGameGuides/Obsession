import { Pipeline, trimmer } from 'lunr';

/**
 * 
 * @param {string} text 
 * @returns {{[key:string]: number}}
 */
export function frequency(text) {
  /** @type {{[key:string]: number}} */
  const result = {};
  const pipeline = new Pipeline();
  pipeline.add(trimmer);
  for (const word of text.split(' ').filter(x => x)) {
    const pipelineResult = pipeline.runString(word);
    if (pipelineResult.length !== 1) {
      console.log("Word has unexpected pipeline result: ", word);
    } else {
      const trimmedWord = pipelineResult[0];
      if (trimmedWord in result) {
        result[trimmedWord] = result[trimmedWord] + 1;
      } else {
        result[trimmedWord] = 1;
      }
    }
  }
  return result;
}