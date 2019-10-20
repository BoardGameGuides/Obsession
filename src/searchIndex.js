import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Builder, Pipeline, trimmer, stemmer } from 'lunr';
import { routes } from './contentFiles';

/**
 * Applies the specified function to all tokens except ones being indexed for a specified field.
 * @param {string} fieldName The field to skip the function for.
 * @param {lunr.PipelineFunction} pipelineFunction The function to wrap.
 * @returns {lunr.PipelineFunction}
 */
function skipField(fieldName, pipelineFunction) {
  return (token, i, tokens) => {
    if (/** @type {any} */ (token).metadata.fields.indexOf(fieldName) >= 0) {
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

const stemExceptTitle = skipField('title', stemmer);
const stemAndPreserve = includeUnmodified(stemmer);
Pipeline.registerFunction(stemExceptTitle, 'stemExceptTitle');
Pipeline.registerFunction(stemAndPreserve, 'stemAndPreserve');

function buildIndex() {
  // TODO: use htmlparser2 and build the index offline during production builds. Only build the index in the browser on dev builds.
  // TODO: make HTML parsing more intelligent: treat <h1> as the title and boost, maybe ignore other headers?
  if (true) {
  //if (process.env.NODE_ENV !== 'production') {
    /**
     * Reduces an HTML DOM document to a string.
     * @param {Node} element The HTML DOM document.
     * @returns {string}
     */
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
    /**
     * Reduces a React component to a string.
     * @param {any} ReactComponent The component to convert.
     * @returns {string}
     */
    function plaintext(ReactComponent) {
      const element = React.createElement(ReactComponent);
      const html = ReactDOMServer.renderToString(element);
      const doc = domParser.parseFromString(html, 'text/html');
      return domToText(doc);
    }

    // TODO: determine if we want a simplified stop-word filter.
    const builder = new Builder();
    builder.pipeline.add(trimmer, stemExceptTitle);
    builder.searchPipeline.add(stemAndPreserve);

    builder.field('title');
    builder.field('text');

    // TODO: auto-add fields found in metadata as space-delimited exact-match tokens.
    // builder.field('type');
    // builder.field('category');
    // builder.field('vp'); // <number> - the VP value of the card
    // builder.field('casual'); // 'true' or 'false' - whether a guest is a casual guest
    // builder.field('starter'); // 'true' or 'false' - whether a guest is a starter guest
    for (const route of Object.keys(routes)) {
      const doc = Object.assign(routes[route].metadata, {
        id: route,
        text: plaintext(routes[route].Component),
        type: route.startsWith('/guests') ? 'guest' : 'tile'
      });
      builder.add(doc);
    }

    return builder.build();
  }
}

export const index = buildIndex();