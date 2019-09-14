import Rete from "rete";
import sockets from '../../sockets.js';
import DropDownControl from '../../controls/DropDown.js';
import {Patterns} from '../../../loaddata.js';

export default class FilterGamesByLinkedToPatternComponent extends Rete.Component {

	constructor() {
		super('Filter Games to Those Linked To A Pattern');
		this.render = 'alight';
	}

	builder(node) {
		node.addInput(new Rete.Input('gamesInput', 'Games to filter', sockets.games));
		node.addOutput(new Rete.Output('games', 'Games (array)', sockets.games));
		
		const nodeDropDownList = Patterns.map(function(pattern){return ({value: pattern.Title, label: pattern.Title})});
		node.addControl(new DropDownControl(this.editor, "Pattern", nodeDropDownList));
		
		node.info = "A filter node that filters games by those which are linked to a pattern.";
		
		return node;
	}
	
	async worker(node, inputs, outputs) {
		outputs['games'] = inputs['gamesInput'][0].filter(game => (game.LinkedPatterns.some(pattern => pattern.Title == node.data['Pattern'].value)));
	}
}