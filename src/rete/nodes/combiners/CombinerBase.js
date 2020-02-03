import Rete from "rete";
import sockets from '../../sockets.js';

export default class CombinerBase extends Rete.Component {

	constructor(title) {
		super(title);
		this.render = 'alight';
		this.category = "Array Combiners";
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
	}
	
	disconnected(connection) {
		let self;
		if(connection.input.node.name == this.name){
			self = connection.input.node;
		}
		else if(connection.output.node.name == this.name){
			self = connection.output.node;
		}
		else{
			return;
		}
		let connectionCount = Array.from(self.inputs).map(input => input[1].connections.length).reduce((a, b) => a + b, 0) + Array.from(self.outputs).map(output => output[1].connections.length).reduce((a, b) => a + b, 0);
		if(connectionCount == 0){
			self.inputs.forEach(function(input){
				input.socket = sockets.wildcard;
			});
			self.outputs.forEach(function(output){
				output.socket = sockets.wildcard;
			});
		}
		self.update();
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
		node.addInput(new Rete.Input('array1', 'Array A', sockets.wildcard));
		node.addInput(new Rete.Input('array2', 'Array B', sockets.wildcard));
		node.addOutput(new Rete.Output('output', 'Output (array)', sockets.wildcard));
		
		return node;
	}
}