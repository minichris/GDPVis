import Rete from "rete";
import sockets from '../../sockets.js';
import DropDownControl from '../../controls/DropDown.js';
import SpinnerControl from '../../controls/Spinner.js';
import {Games} from '../../../loaddata.js';

export default class FilterGamesToThoseWhichSharePatternsWithAGameComponent extends Rete.Component {

	constructor() {
		super('Filter Games To Those Which Share An Amount Of Patterns With A Game');
		this.render = 'alight';
	}

	builder(node) {
		node.addInput(new Rete.Input('gamesInput', 'Games to filter', sockets.games));
		node.addOutput(new Rete.Output('games', 'Games (array)', sockets.games));
		
		const nodeDropDownList = Games.map(function(game){return ({value: game.name, label: game.name})});
		node.addControl(new DropDownControl(this.editor, "Game", nodeDropDownList, "Game"));	
		
		node.addControl(new SpinnerControl(this.editor, "SharedAmount", 10, "Required Amount of Shared Patterns"));
		
		node.info = "A filter node which filters games by those which share patterns with other games.";
		
		return node;
	}
	
	async worker(node, inputs, outputs) {	
		let minimumArray = inputs['gamesInput'][0].filter(game => 
			game.LinkedPatterns.filter(pattern => 
				pattern.PatternsLinks.some(pLink => 
					pLink.To == node.data['Game'].value)).length >= node.data['SharedAmount'].value);
		
		
		outputs['games'] = minimumArray;
		
	}
}