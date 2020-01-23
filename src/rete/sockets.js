import { Socket } from 'rete';
import './sockets.css';

const patterns = new Socket('Patterns Array');
const games = new Socket('Games Array');
const wildcard = new Socket('Wildcard Array');

patterns.combineWith(wildcard);
games.combineWith(wildcard);
//const patternCats = new Socket('Pattern Categories Array');
//const gamesCats = new Socket('Game Categories Array');

export default {
	patterns,
	games,
	wildcard
	//patternCats,
	//gamesCats,
}