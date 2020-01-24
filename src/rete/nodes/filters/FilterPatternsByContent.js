import Rete from "rete";
import sockets from '../../sockets.js';
import TextBoxControl from '../../controls/TextBox.js';

export default class FilterPatternsByContentComponent extends Rete.Component {

	constructor() {
		super('Filter Patterns by Content');
		this.render = 'alight';
	}

	builder(node) {
		node.addInput(new Rete.Input('patternsInput', 'Patterns to filter', sockets.patterns));
		node.addOutput(new Rete.Output('patterns', 'Patterns (array)', sockets.patterns));
		
		node.addControl(new TextBoxControl(node, "PatternContent", "Content Search"));
		
		node.info = "A filter node that filters patterns by their content";
		
		return node;
	}
	
	async worker(node, inputs, outputs) {
		outputs['patterns'] = inputs['patternsInput'][0].filter(pattern => pattern.Content.includes(node.data['PatternContent']));
	}
}