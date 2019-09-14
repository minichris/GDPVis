import Rete from "rete";
import sockets from '../../sockets.js';

export default class DataOutputComponent extends Rete.Component {

	constructor() {
		super('Output Data');
		this.render = 'alight';
		this.info = "The final node in any filtering graph.";
	}

	builder(node) {
		node.addInput(new Rete.Input('patternsInput', 'Patterns to output', sockets.wildcard));
		return node;
	}
	
	async worker(node, inputs, outputs) {
		console.log("Display Patterns Output");
		console.log(inputs['patternsInput'][0]);
        return (inputs['patternsInput'][0]);
    }
}