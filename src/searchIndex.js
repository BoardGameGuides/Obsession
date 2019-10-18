import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { Builder } from 'lunr';
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

    // TODO: fix pipeline defaults.
    const builder = new Builder();
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