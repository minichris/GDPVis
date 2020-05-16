import Rete from "rete";
import sockets from '../../sockets.js';
import DropDownControl from '../../controls/DropDown.js';
import {Games} from '../../../loadDataUtil.js';

export default class SingularGame extends Rete.Component {

	constructor() {
		super('Singular Game');

		this.category = "Information Stores";
	}

	builder(node) {
		node.addOutput(new Rete.Output('games', 'Games (array)', sockets.games));
		
		const nodeDropDownList = Games.map(function(game){return ({value: game.name, label: game.name})});
		node.addControl(new DropDownControl(node, "Game", nodeDropDownList, "Game"));
		
		node.info = "A starting node that outputs one game.";
		
		return node;
	}
	
	async worker(node, inputs, outputs) {
		outputs['games'] = {data: Games.filter(game => (game.name == node.data['Game'].value)), text: node.data['Game'].value};
	}
}