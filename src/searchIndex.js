import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Builder, trimmer, stopWordFilter, stemmer } from 'lunr';
import { routes } from './contentFiles';

function buildIndex() {
  // TODO: use htmlparser2 and build the index offline during production builds. Only build the index in the browser on dev builds.
  // TODO: make HTML parsing more intelligent: treat <h1> as the title and boost, maybe ignore other headers?
  if (process.env.NODE_ENV !== 'production') {
    function domToText(element) {
      let text = '';

      for (let i = 0, len = element.childNodes.length; i < len; i++) {
        let child = element.childNodes[i];
        if (child.nodeType === 3) {
          // Text nodes
          text += ' ' + child.nodeValue;
        }
        if (child.childNodes.length > 0) {
          // Parent nodes
          text += ' ' + domToText(child);
        }
      }

      return text.replace(/\s+/g, ' ').trim();
    }

    const domParser = new DOMParser();
    function plaintext(ReactComponent) {
      const element = React.createElement(ReactComponent);
      const html = ReactDOMServer.renderToString(element);
      const doc = domParser.parseFromString(html, 'text/html');
      return domToText(doc);
    }

    function skipField(fieldName, pipelineFunction) {
      return (token, i, tokens) => {
        if (token.metadata["fields"].indexOf(fieldName) >= 0) {
          return token;
        }    
        return pipelineFunction(token, i, tokens);
      };
    }

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
            if (tokenResult.str === token.str) {
              // One token matches -> return results from function
              return result;
            }
          }
          // No token matches -> add original token to results from function
          result.push(token);
          return result;
        }
        // Single result from function
        if (result.str === token.str) {
          // Result matches token -> return result from function
          return result;
        }
        // Result does not match -> return result from function with original token
        return [result, token];
      };
    }

    // TODO: determine if we want a simplified stopword filter.
    const builder = new Builder();
    builder.pipeline.add(trimmer, skipField('title', stemmer));
    builder.searchPipeline.add(includeUnmodified(stemmer));

    builder.field('title');
    builder.field('text');

    // TODO: auto-add fields found in metadata as space-delimited exact-match tokens.
    builder.field('type');
    builder.field('category');
    // builder.field('vp'); // <number> - the VP value of the card
    // builder.field('casual'); // 'true' or 'false' - whether a guest is a casual guest
    // builder.field('starter'); // 'true' or 'false' - whether a guest is a starter guest
    for (const route of Object.keys(routes)) {
      const doc = Object.assign(routes[route].metadata, {
        id: route,
        text: plaintext(routes[route].Component),
        type: route.startsWith('/guests') ? 'guest' : 'tile'
      });
      console.log(doc);
      builder.add(doc);
    }

    return builder.build();
  }
}

export const index = buildIndex();