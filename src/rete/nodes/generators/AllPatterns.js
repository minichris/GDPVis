import Rete from "rete";
import sockets from '../../sockets.js';
import {Patterns} from '../../../loaddata.js';

export default class AllPatternsComponent extends Rete.Component {

	constructor() {
		super('All Patterns');
		this.render = 'alight';
		this.info = "A filter node that just outputs all of the patterns in the system.";
	}

	builder(node) {
		node.addOutput(new Rete.Output('patterns', 'Patterns (array)', sockets.patterns));
		return node;
	}
	
	async worker(node, inputs, outputs) {
		outputs['patterns'] = Patterns;
	}
}