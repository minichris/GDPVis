import Rete from "rete";
import sockets from '../../sockets.js';
import DropDownControl from '../../controls/DropDown.js';
import {GameCategories} from '../../../loaddata.js';

export default class FilterGamesByCategoryComponent extends Rete.Component {

	constructor() {
		super('Filter Games by Category');
		this.render = 'alight';
		this.info = "A filter node that filters games by a game category.";
	}

	builder(node) {
		node.addInput(new Rete.Input('gamesInput', 'Games to filter', sockets.games));
		node.addOutput(new Rete.Output('games', 'Games (array)', sockets.games));
		
		const nodeDropDownList = GameCategories.map(function(cat){return ({value: cat, label: cat})});
		node.addControl(new DropDownControl(this.editor, "GameCategory", nodeDropDownList));
		
		return node;
	}
	
	async worker(node, inputs, outputs) {
		outputs['games'] = inputs['gamesInput'][0].filter(game => game.categories.some(cate => cate == node.data['GameCategory'].value));
	}
}