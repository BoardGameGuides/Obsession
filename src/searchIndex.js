import { Index } from 'lunr';
import './shared/searchSettings';
import searchIndex from './obj/searchIndex.json';

export const index = Index.load(searchIndex);