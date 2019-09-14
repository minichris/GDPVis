import Rete from "rete";
import sockets from '../../sockets.js';

export default class FilterGamesByThoseWhichUsePatternsComponent extends Rete.Component {

	constructor() {
		super('Games By Those Which Use Patterns');
		this.render = 'alight';
	}

	builder(node) {
		node.addInput(new Rete.Input('gamesInput', 'Games to filter', sockets.games));
		node.addInput(new Rete.Input('patternsInput', 'Patterns the Games must use at least one of', sockets.patterns));
		node.addOutput(new Rete.Output('games', 'Games (array)', sockets.games));
		
		node.info = "A filter node which filters games by those that use patterns.";
		
		return node;
	}
	
	async worker(node, inputs, outputs) {
		outputs['games'] = inputs['gamesInput'][0].filter(game => game.LinkedPatterns.some(pattern => inputs['patternsInput'][0].indexOf(pattern) > 0));
	}
}