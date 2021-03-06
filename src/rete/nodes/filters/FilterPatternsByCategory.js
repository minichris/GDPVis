import Rete from "rete";
import sockets from '../../sockets.js';
import DropDownControl from '../../controls/DropDown.js';
import {PatternCategories} from '../../../loadDataUtil.js';

export default class FilterPatternsByCategoryComponent extends Rete.Component {

	constructor() {
		super('Filter Patterns by Category');

		this.category = "Pattern Filters";
	}

	builder(node) {
		node.addInput(new Rete.Input('patternsInput', 'Patterns to filter', sockets.patterns));
		node.addOutput(new Rete.Output('patterns', 'Patterns (array)', sockets.patterns));
		
		const nodeDropDownList = PatternCategories.map(function(cat){return ({value: cat, label: cat})});
		node.addControl(new DropDownControl(node, "PatternCategory", nodeDropDownList, "Pattern Category"));
		
		node.info = "A filter node that filters patterns by a pattern category";
		
		return node;
	}
	
	async worker(node, inputs, outputs) {
		outputs['patterns'] = inputs['patternsInput'][0].filter(pattern => pattern.Categories.some(cate => cate == node.data['PatternCategory'].value));
	}
}