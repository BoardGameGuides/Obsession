import { Builder } from 'lunr';
import { pipelineFunctions, searchPipelineFunctions } from '../src/shared/searchSettings';

/**
 * Builds an index.
 * @param {{id: string, type: string, text: string, metadata: {}}[]} files The files to index.
 */
export function buildIndex(files) {
  // TODO: determine if we want a simplified stop-word filter.
  const builder = new Builder();
  builder.pipeline.add(...pipelineFunctions);
  builder.searchPipeline.add(...searchPipelineFunctions);

  builder.field('title');
  builder.field('text');

  // TODO: auto-add fields found in metadata as space-delimited exact-match tokens.
  // builder.field('type');
  // builder.field('category');
  // builder.field('vp'); // <number> - the VP value of the card
  // builder.field('casual'); // 'true' or 'false' - whether a guest is a casual guest
  // builder.field('starter'); // 'true' or 'false' - whether a guest is a starter guest
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
