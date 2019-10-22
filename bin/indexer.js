import { Builder } from 'lunr';
import { pipelineFunctions, searchPipelineFunctions } from '../src/shared/searchSettings';

/**
 * Builds an index.
 * @param {{id: string, type: string, text: string, metadata: {}}[]} files The files to index.
 */
export function buildIndex(files) {
  const builder = new Builder();
  builder.pipeline.add(...pipelineFunctions);
  builder.searchPipeline.add(...searchPipelineFunctions);

  builder.field('title', { boost: 1.5 });
  builder.field('text');

  for (const file of files) {
    const doc = Object.assign(file.metadata, {
      id: file.id,
      text: file.text,
      type: file.type
    });
    builder.add(doc);
  }

  return builder.build();
}
