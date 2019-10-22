import { promises as fs } from 'fs';
import { Parser } from 'htmlparser2';
import { renderToHtmlAsync } from './render-mdx';
import { buildIndex } from './indexer';
import { wordFrequency, stemmedFrequency, sanityCheck } from './frequency';
import textTransform from '../src/shared/game-specific/build-search-index-text-transform';

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
 * @param {string} id
 * @param {{frontmatter: object, html: string}} mdxFile
 * @returns {{id: string, text: string, title: string}}
 */
function mdxToDoc(id, mdxFile) {
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
  return { id, text, title: mdxFile.frontmatter.title };
}

(async () => {
  const paths = (await walkAsync('src/content/')).filter(x => x.endsWith('.mdx'));
  const docs = [];
  let allText = '';
  for (const path of paths) {
    const route = path.slice(12, -4);
    const file = await fs.readFile(path, 'utf8');
    const rendered = await renderToHtmlAsync(file);
    const doc = mdxToDoc(route, rendered);
    if (!doc.title) {
      console.log('WARN: Document has no title.', path);
    }
    docs.push(doc);
    allText += ' ' + doc.text;
  }

  const index = buildIndex(docs);
  await fs.writeFile('src/obj/searchIndex.json', JSON.stringify(index));
  
  // Perform frequency analysis of words and sanity checks.
  const words = allText.split(' ').filter(x => x);
  await saveFrequencyAsync('src/obj/words.txt', wordFrequency(words));
  await saveFrequencyAsync('src/obj/words.stemmed.txt', stemmedFrequency(words));
  sanityCheck(words);
})();
