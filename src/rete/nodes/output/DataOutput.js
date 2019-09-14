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
		return node;
	}
	
	async worker(node, inputs, outputs) {
		console.log("Display Patterns Output");
		console.log(inputs['patternsInput'][0]);
        return (inputs['patternsInput'][0]);
    }
}