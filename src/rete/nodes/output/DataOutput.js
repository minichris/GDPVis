import Rete from "rete";
import sockets from '../../sockets.js';

export default class DataOutputComponent extends Rete.Component {

	constructor() {
		super('Output Data');
		this.render = 'alight';
	}

	builder(node) {
		node.addInput(new Rete.Input('patternsInput', 'Patterns to output', sockets.wildcard));
		node.info = "The final node in any filtering graph.";
		node.finalOutputData = [];
		return node;
	}
	
	async worker(node, inputs, outputs) {
		node.finalOutputData = inputs['patternsInput'][0];
		global.refreshGraph(inputs['patternsInput'][0]);
        return (inputs['patternsInput'][0]);
    }
}