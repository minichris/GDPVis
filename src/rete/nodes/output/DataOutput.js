import Rete from "rete";
import sockets from '../../sockets.js';

export default class DataOutputComponent extends Rete.Component {

	constructor() {
		super('Display Patterns');
		this.finalOutput = null;
	}

	builder(node) {
		node.addInput(new Rete.Input('patternsInput', 'Patterns to output', sockets.patterns));
		return node;
	}
	
	async worker(node, inputs, outputs) {
		console.log("Display Patterns Output");
		console.log(inputs['patternsInput'][0]);
        return (inputs['patternsInput'][0]);
    }
}