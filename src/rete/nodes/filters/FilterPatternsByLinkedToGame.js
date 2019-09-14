import Rete from "rete";
import sockets from '../../sockets.js';
import DropDownControl from '../../controls/DropDown.js';
import {Games} from '../../../loaddata.js';

export default class FilterPatternsByLinkedToGameComponent extends Rete.Component {

	constructor() {
		super('Filter Patterns to Those Linked To A Game');
		this.render = 'alight';
	}

	builder(node) {
		node.addInput(new Rete.Input('patternsInput', 'Patterns to filter', sockets.patterns));
		node.addOutput(new Rete.Output('patterns', 'Patterns (array)', sockets.patterns));
		
		const nodeDropDownList = Games.map(function(game){return ({value: game.name, label: game.name})});
		node.addControl(new DropDownControl(this.editor, "Game", nodeDropDownList, "Game"));
		
		node.info = "A filter node that filters patterns by those which are linked to a game.";
		
		return node;
	}
	
	async worker(node, inputs, outputs) {
		outputs['patterns'] = inputs['patternsInput'][0].filter(pattern => (pattern.PatternsLinks.some(pLink => pLink.To == node.data['Game'].value)));
	}
}