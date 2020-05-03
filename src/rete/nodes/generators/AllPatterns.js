import Rete from "rete";
import sockets from '../../sockets.js';
import {Patterns} from '../../../loadDataUtil.js';

export default class AllPatternsComponent extends Rete.Component {

	constructor() {
		super('All Patterns');

		this.category = "Information Stores";
	}

	builder(node) {
		node.addOutput(new Rete.Output('patterns', 'Patterns (array)', sockets.patterns));
		node.info = "A starting node that just outputs all of the patterns in the system.";
		node.userimmutable = true;
		return node;
	}
	
	async worker(node, inputs, outputs) {
		outputs['patterns'] = Patterns;
	}
}