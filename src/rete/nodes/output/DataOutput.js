import Rete from "rete";
import sockets from '../../sockets.js';

export default class DataOutputComponent extends Rete.Component {

	constructor() {
		super('Output Data');

		this.category = "Outputs";
	}

	builder(node) {
		node.addInput(new Rete.Input('patternsInput', 'Data to output', sockets.wildcard));
		node.info = "The final node in any filtering graph.";
		node.userimmutable = true;
		return node;
	}
	
	async worker(node, inputs, _outputs, returnerFunction) {
		if(inputs['patternsInput'] && inputs['patternsInput'][0]){ //we have an output
			let inputType = node.inputs.patternsInput.connections[0].output;
			if(returnerFunction){
				returnerFunction(inputs['patternsInput'][0].data, inputType);
			}
			console.log("__________________________");
			console.log("test text:" + inputs['patternsInput'][0].text);
			return (inputs['patternsInput'][0]);
		}
	}
}