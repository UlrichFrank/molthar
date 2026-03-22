import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { __setRawCards } from './src/game/cardDatabase.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const cardsPath = resolve(__dirname, '../assets/cards.json');
const cardsData = JSON.parse(readFileSync(cardsPath, 'utf-8'));
__setRawCards(cardsData);
