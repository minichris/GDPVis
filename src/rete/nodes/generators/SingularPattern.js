import Rete from "rete";
import sockets from '../../sockets.js';
import DropDownControl from '../../controls/DropDown.js';
import {Patterns} from '../../../loadDataUtil.js';

export default class SingularPattern extends Rete.Component {

	constructor() {
		super('Singular Pattern');

		this.category = "Information Stores";
	}

	builder(node) {
		node.addOutput(new Rete.Output('patterns', 'Patterns (array)', sockets.patterns));
		
		const nodeDropDownList = Patterns.map(function(pattern){return ({value: pattern.Title, label: pattern.Title})});
		node.addControl(new DropDownControl(node, "Pattern", nodeDropDownList, "Pattern"));
		
		node.info = "A starting node that outputs one pattern.";
		
		return node;
	}
	
	async worker(node, inputs, outputs) {
		outputs['patterns'] = Patterns.filter(pattern => pattern.Title == node.data['Pattern'].value);
	}
}