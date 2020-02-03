import Rete from "rete";
import sockets from '../../sockets.js';

export default class DataOutputComponent extends Rete.Component {

	constructor() {
		super('Output Data');
		this.render = 'alight';
		this.category = "Outputs";
	}

	builder(node) {
		node.addInput(new Rete.Input('patternsInput', 'Data to output', sockets.wildcard));
		node.info = "The final node in any filtering graph.";
		node.userimmutable = true;
		return node;
	}
	
	async worker(_node, inputs, _outputs) {
		if(inputs['patternsInput'] && inputs['patternsInput'][0]){ //we have an output
			global.refreshGraph(inputs['patternsInput'][0]);
			return (inputs['patternsInput'][0]);
		}
	}
}