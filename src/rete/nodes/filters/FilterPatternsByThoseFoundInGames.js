import Rete from "rete";
import sockets from '../../sockets.js';

export default class FilterPatternsByThoseFoundInGamesComponent extends Rete.Component {

	constructor() {
		super('Filter Patterns By Those Found In Games');
		this.render = 'alight';
		this.category = "Filter Patterns";
	}

	builder(node) {
		node.addInput(new Rete.Input('patternsInput', 'Patterns to filter', sockets.patterns));
		node.addInput(new Rete.Input('gamesInput', 'Games patterns must be at least one of', sockets.games));
		node.addOutput(new Rete.Output('patterns', 'Patterns (array)', sockets.patterns));
		
		node.info = "A filter node which filters patterns by those found in games.";
		
		return node;
	}
	
	async worker(node, inputs, outputs) {
		outputs['patterns'] = inputs['patternsInput'][0].filter(pattern => pattern.LinkedGames.some(game => inputs['gamesInput'][0].indexOf(game) > 0));
	}
}