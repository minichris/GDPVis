import Rete from "rete";
import sockets from '../../sockets.js';
import {Games} from '../../../loaddata.js';

export default class AllGamesComponent extends Rete.Component {

	constructor() {
		super('All Games');
		this.render = 'alight';
		this.info = "A filter node that just outputs all of the games in the system.";
	}

	builder(node) {
		node.addOutput(new Rete.Output('games', 'Games (array)', sockets.games));
		return node;
	}
	
	async worker(node, inputs, outputs) {
		outputs['games'] = Games;
	}
}