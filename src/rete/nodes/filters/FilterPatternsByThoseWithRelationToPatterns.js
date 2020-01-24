import Rete from "rete";
import sockets from '../../sockets.js';
import DropDownControl from '../../controls/DropDown.js';

export default class FilterPatternsByThoseWithRelationToPatternsComponent extends Rete.Component {

	constructor() {
		super('Filter Patterns By Those With Relation To Patterns');
		this.render = 'alight';
	}

	builder(node) {
		node.addInput(new Rete.Input('patternsInput', 'Patterns to filter', sockets.patterns));
		node.addInput(new Rete.Input('patternsRelateTo', 'Patterns to relate to', sockets.patterns));
		node.addOutput(new Rete.Output('patterns', 'Patterns (array)', sockets.patterns));
		
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
		
		node.info = "A filter node which filters patterns to only those with relation(s) to a specific patterns.";
		
		return node;
	}
	
	async worker(node, inputs, outputs) {
		const patternsToRelateTo = inputs['patternsRelateTo'][0];
		const validRelations = node.data['RelationType'].map(type => type.value);
		
		const outputPatterns = [];
		
		inputs['patternsInput'][0].forEach(function(pattern){ //for each pattern
			var patternMatches = pattern.PatternsLinks.some(function(pLink){ //for each link in each pattern
				if(patternsToRelateTo.map(pattern => pattern.Title).includes(pLink.To)){ //get if the pattern is even linked
					if(pLink.Type && pLink.Type.find(type => validRelations.includes(type))){ //if the pLink has a type, and includes one of the ones we are looking for
						return true;
					}
				}
			});
			if(patternMatches){
				outputPatterns.push(pattern);
			}
		});
		
		outputs['patterns'] = outputPatterns;
	}
}