import Rete from "rete";
import sockets from '../../sockets.js';
import DropDownControl from '../../controls/DropDown.js';
import {Patterns} from '../../../loadDataUtil.js';

export default class FilterPatternsByThoseWithRelationToPatternComponent extends Rete.Component {

	constructor() {
		super('Filter Patterns By Those With Relation To Pattern');

		this.category = "Pattern Filters";
	}

	builder(node) {
		node.addInput(new Rete.Input('patternsInput', 'Patterns to filter', sockets.patterns));
		node.addOutput(new Rete.Output('patterns', 'Patterns (array)', sockets.patterns));
		
		const nodeDropDownList1 = Patterns.map(function(pattern){return ({value: pattern.Title, label: pattern.Title})});
		node.addControl(new DropDownControl(node, "Pattern", nodeDropDownList1, "Pattern"));
		
		const nodeDropDownList2 = [
			{value: "Can Modulate", label: "Can Modulate"},
			{value: "Can Be Modulated By", label: "Can Be Modulated By"},
			{value: "Can Instantiate", label: "Can Instantiate"},
			{value: "Can Be Instantiated By", label: "Can Be Instantiated By"},
			{value: "Potentially Conflicting With", label: "Potentially Conflicting With"},
			{value: "Possible Closure Effects", label: "Possible Closure Effects"},
			{value: "Self Reference", label: "The pattern being related to"}
			
		];
		node.addControl(new DropDownControl(node, "RelationType", nodeDropDownList2, "Relation Type(s) (only needs to match one)", true));
		
		node.info = "A filter node which filters patterns to only those with relation(s) to a specific pattern.";
		
		return node;
	}
	
	async worker(node, inputs, outputs) {
		let patternToRelateTo = node.data['Pattern'].value;
		let validRelations = node.data['RelationType'].map(type => type.value);
		outputs['patterns'] = inputs['patternsInput'][0].filter(function(pattern){
			let pLinkToPattern = pattern.PatternsLinks.find(pLink => pLink.To == patternToRelateTo);
			if(pLinkToPattern && pLinkToPattern.Type && pLinkToPattern.Type.find(type => validRelations.includes(type))){
				return true;
			}
		});
	}
}