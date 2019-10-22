import { Builder } from 'lunr';
import { buildPipelineFunctions, searchPipelineFunctions } from '../src/shared/searchSettings';

/**
 * Builds an index.
 * @param {{id: string, text: string, title: string}[]} docs The documents to index.
 */
export function buildIndex(docs) {
  const builder = new Builder();
  builder.pipeline.add(...buildPipelineFunctions);
  builder.searchPipeline.add(...searchPipelineFunctions);

  builder.field('title', { boost: 1.5 });
  builder.field('text');

  for (const doc of docs) {
    builder.add(doc);
  }

  return builder.build();
}
