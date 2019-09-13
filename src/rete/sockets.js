import { Socket } from 'rete';

const patterns = new Socket('Patterns Array');
const games = new Socket('Games Array');
const patternCats = new Socket('Pattern Categories Array');
const gamesCats = new Socket('Game Categories Array');

export default {
    patterns,
    games,
    patternCats,
    gamesCats
}