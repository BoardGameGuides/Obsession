import { promises as fs } from 'fs';
import { Parser } from 'htmlparser2';
import { renderToHtmlAsync } from './render-mdx';
import { buildIndex } from './indexer';
import { wordFrequency, stemmedFrequency, sanityCheck } from './frequency';
import textTransform from '../src/shared/game-specific/build-search-index-text-transform';
import { isExternal, combine } from '../src/shared/path';

/**
 * Walks a directory tree.
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function walkAsync(dir) {
  const entries = await fs.readdir(dir);
  const result = [];
  for (const entry of entries) {
    if ((await fs.stat(dir + entry)).isDirectory()) {
      result.push(...await walkAsync(dir + entry + '/'));
    }
    else {
      result.push(dir + entry);
    }
  }

  return result;
};

/**
 * Writes out a list of word frequencies to a text file, ordered from most-frequent to least-frequent.
 * @param {string} filename 
 * @param {{[key: string]: number}} data 
 */
async function saveFrequencyAsync(filename, data) {
  const wordFrequencies = Object.keys(data).map(x => ({ word: x, frequency: data[x] })).sort((x, y) => y.frequency - x.frequency);
  await fs.writeFile(filename, wordFrequencies.map(x => x.word + ' ' + x.frequency).join('\n'));
}

/**
 * Converts a parsed MDX file to a document that can be indexed.
 * @param {string} route
 * @param {{frontmatter: object, html: string}} mdxFile
 * @returns {{id: string, text: string, title: string}}
 */
function mdxToDoc(route, mdxFile) {
  let textResult = '';
  const parser = new Parser({
    onclosetag() {
      textResult += ' ';
    },
    ontext(text) {
      textResult += text;
    }
  }, { decodeEntities: true });
  parser.write(mdxFile.html);
  parser.end();
  const text = textTransform(textResult).replace(/\s+/g, ' ').trim();
  return { id: route.substring(1), text, title: mdxFile.frontmatter.title };
}

/**
 * Converts a parsed MDX file to a document that can be indexed.
 * @param {string} route
 * @param {string} html
 * @param {{route?: string}[]} docs
 */
function checkLinks(route, html, docs) {
  const parser = new Parser({
    onopentag(name, attribs) {
      if (name === 'a') {
        const href = attribs['href'];
        if (!isExternal(href)) {
          const relativePath = combine(route, '..', href);
          if (!docs.find(x => x.route === relativePath)) {
            console.log('WARN: Document has broken link.', route, href);
          }
        }
      }
    }
  }, { decodeEntities: true });
  parser.write(html);
  parser.end();
}

(async () => {
  /** @type {{ path: string; route?: string; frontmatter?: any; html?: string; doc?: { id: string; title: string; text: string; } }[]} */
  const items = (await walkAsync('src/content/')).filter(x => x.endsWith('.mdx')).map(path => ({ path }));
  let allText = '';
  for (const item of items) {
    item.route = item.path.slice(11, -4);
    const file = await fs.readFile(item.path, 'utf8');
    const rendered = await renderToHtmlAsync(file);
    item.frontmatter = rendered.frontmatter;
    item.html = rendered.html;
    item.doc = mdxToDoc(item.route, rendered);
    allText += ' ' + item.doc.text;
  }

  // Perform sanity checks
  const words = allText.split(' ').filter(x => x);
  sanityCheck(words);
  for (const item of items) {
    if (!item.doc.title) {
      console.log('WARN: Document has no title.', item.path);
    }
    checkLinks(item.route, item.html, items);
  }

  // Build the index and save it
  const index = buildIndex(items.map(x => x.doc));
  await fs.writeFile('src/obj/searchIndex.json', JSON.stringify(index));

  // Perform frequency analysis of words
  await saveFrequencyAsync('src/obj/words.txt', wordFrequency(words));
  await saveFrequencyAsync('src/obj/words.stemmed.txt', stemmedFrequency(words));
})();
