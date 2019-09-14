import CombinerBase from './CombinerBase.js'

export default class ArrayDifferenceNode extends CombinerBase {
	
	constructor() {
		super('Array Difference');
	}
	
	async worker(node, inputs, outputs) {
		outputs['output'] = this.arrayUnique(inputs['array1'][0].filter(x => !inputs['array2'][0].includes(x)));
	}

}