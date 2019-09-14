import CombinerBase from './CombinerBase.js'

export default class ArrayUnionNode extends CombinerBase {
	
	constructor() {
		super('Array Union (A∪B)');
	}
	
	async worker(node, inputs, outputs) {
		outputs['output'] = this.arrayUnique(inputs['array1'][0].concat(inputs['array2'][0]));
	}

}