import Rete from "rete";
import sockets from '../../sockets.js';
import DropDownControl from '../../controls/DropDown.js';
import {PatternCategories} from '../../../loaddata.js';

export default class FilterPatternsByCategoryComponent extends Rete.Component {

	constructor() {
		super('Filter Patterns by Category');
		this.render = 'alight';
	}

	builder(node) {
		node.addInput(new Rete.Input('patternsInput', 'Patterns to filter', sockets.patterns));
		const nodeDropDownList = PatternCategories.map(function(cat){return ({value: cat, label: cat})});
		var ctrl = new DropDownControl(this.editor, "PatternCategory", nodeDropDownList);
		node.addControl(ctrl);
		
		node.addOutput(new Rete.Output('patterns', 'Patterns (array)', sockets.patterns));
		return node;
	}
	
	setValue(val) {
        this.scope.value = val;
        this._alight.scan()
    }
	
	async worker(node, inputs, outputs) {
		outputs['patterns'] = inputs['patternsInput'][0].filter(pattern => pattern.Categories.some(cate => cate == node.data['PatternCategory'].value));
	}
}