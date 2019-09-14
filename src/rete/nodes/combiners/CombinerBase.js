import Rete from "rete";
import sockets from '../../sockets.js';

export default class CombinerBase extends Rete.Component {

	constructor(title) {
		super(title);
		this.render = 'alight';
	}
	
	connected(connection){
		if(connection.input.node.name == this.name){
			let self = connection.input.node;
			self.inputs.forEach(function(input){
				input.socket = connection.output.socket;
			});
			self.outputs.forEach(function(output){
				output.socket = connection.output.socket;
			});
			self.update();
		}
	};
	
	disconnected(connection) {
		if(connection.input.node.name == this.name){
			let self = connection.input.node;
			console.log(self);
			self.inputs.forEach(function(input){
				input.socket = sockets.wildcard;
			});
			self.outputs.forEach(function(output){
				output.socket = sockets.wildcard;
			});
			self.update();
		}
	}
	
	arrayUnique(array) {
		var a = array.concat();
		for(var i=0; i<a.length; ++i) {
			for(var j=i+1; j<a.length; ++j) {
				if(a[i] === a[j])
					a.splice(j--, 1);
			}
		}
		return a;
	}

	builder(node) {
		node.addInput(new Rete.Input('array1', 'Array 1', sockets.wildcard));
		node.addInput(new Rete.Input('array2', 'Array 2', sockets.wildcard));
		node.addOutput(new Rete.Output('output', 'Output (array)', sockets.wildcard));
		
		return node;
	}
}