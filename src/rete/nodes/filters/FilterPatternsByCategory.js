import Rete from "rete";
import sockets from '../../sockets.js';
import DropDownControl from '../../controls/DropDown.js';
import {PatternCategories} from '../../../loaddata.js';

export default class FilterPatternsByCategoryComponent extends Rete.Component {

	constructor() {
		super('Filter Patterns by Category');
	}

	builder(node) {

		//node.addInput(new Rete.Input('patternCategoryInput', 'Category to filter by', sockets.patternCats));
		node.addInput(new Rete.Input('patternsInput', 'Patterns to filter', sockets.patterns));
		const nodeDropDownList = PatternCategories.map(function(cat){return ({"name": cat, "value": cat})});
		var ctrl = new DropDownControl(this.editor, "PatternCategory", 'PatternCategory2', nodeDropDownList);
		node.addControl(ctrl);
		
		node.addOutput(new Rete.Output('patterns', 'Patterns (array)', sockets.patterns));
		return node;
	}
	
	setValue(val) {
        this.scope.value = val;
        this._alight.scan()
    }
	
	async worker(node, inputs, outputs) {
		console.log(node);
		outputs['patterns'] = inputs['patternsInput'];
	}
}