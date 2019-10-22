import * as fs from 'fs';
import { renderToPlainText } from './render-mdx';
import { buildIndex } from './indexer';
import { wordFrequency, stemmedFrequency, sanityCheck } from './frequency';

/**
 * Gets the type of an MDX file.
 * @param {string} route The route to the MDX file.
 */
function type(route) {
  let index = route.indexOf('/', 2);
  if (index === -1) {
    index = route.length;
  }
  return route.substring(1, index);
}

/**
 * Walks a directory tree.
 * @param {string} dir
 * @returns {Promise<string[]>}
 */
async function walk(dir) {
  const entries = await fs.promises.readdir(dir);
  const result = [];
  for (const entry of entries) {
    if ((await fs.promises.stat(dir + entry)).isDirectory()) {
      result.push(...await walk(dir + entry + '/'));
    }
    else {
      result.push(dir + entry);
    }
  }
  
  return result;
};

/**
 * @param {string} filename 
 * @param {{[key: string]: number}} data 
 */
async function saveFrequency(filename, data) {
  const wordFrequencies = Object.keys(data).map(x => ({ word: x, frequency: data[x] })).sort((x, y) => y.frequency - x.frequency);
  await fs.promises.writeFile(filename, wordFrequencies.map(x => x.word + ' ' + x.frequency).join('\n'));
}

(async () => {
  const paths = (await walk('src/content/')).filter(x => x.endsWith('.mdx'));
  const docs = [];
  let allText = '';
  for (const path of paths) {
    const route = path.slice(12, -4);
    const file = await fs.promises.readFile(path, 'utf8');
    const rendered = await renderToPlainText(file);
    docs.push({
      id: route,
      type: type(route),
      text: rendered.text,
      metadata: rendered.frontmatter
    });
    allText += ' ' + rendered.text;
  }

  const index = buildIndex(docs);
  await fs.promises.writeFile('src/obj/searchIndex.json', JSON.stringify(index));
  
  // Perform frequency analysis of words and sanity checks.
  await saveFrequency('src/obj/words.txt', wordFrequency(allText));
  await saveFrequency('src/obj/words.stemmed.txt', stemmedFrequency(allText));
  sanityCheck(allText);
})();
