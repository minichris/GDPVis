import React from "react";
import ReactDOM from "react-dom";
import ReactRenderPlugin, { Node, Socket, Control } from 'rete-react-render-plugin';
import {createNode} from 'rete-context-menu-plugin/src/utils';

import './nodetemplate.css';

export default class VgtropesNode extends Node {
	deleteNodeButtonClicked(){
		const { node, bindSocket, bindControl, editor } = this.props;
		if(!node.userimmutable){
			editor.removeNode(node);
		}
	}
	
	cloneNodeButtonClicked(){
		const { node, bindSocket, bindControl, editor } = this.props;
		const { name, position: [x, y], ...params } = node;
		const component = editor.components.get(name);
		if(!node.userimmutable){
			createNode(component, { ...params, x: x + 10, y: y + 10 }).then(function(newnode){
				editor.addNode(newnode);
			});
		}
	}
	
	getButtonTitle(type, type2){
		const { node, bindSocket, bindControl } = this.props;
		if(!node.userimmutable){
			return type + "this node";
		}
		else{
			return "This node cannot be " + type2;
		}
	}
	
	render() {
		const { node, bindSocket, bindControl } = this.props;
		const { outputs, controls, inputs, selected } = this.state;
		return (
		  <div className={`node ${selected}`}>
			<div className="top">
				<div className="toolbar">
					<button disabled={node.userimmutable} onClick={this.cloneNodeButtonClicked.bind(this)} title={this.getButtonTitle("Clone", "cloned")} className="clone btn btn-light">C</button>
					<button disabled={node.userimmutable} onClick={this.deleteNodeButtonClicked.bind(this)} title={this.getButtonTitle("Delete", "deleted")} className="delete btn btn-danger">X</button>
				</div>
				<div title={node.info} className="title">{node.name}</div>
			</div>
			{/* Outputs */}
			{outputs.map((output) => (
			  <div className="output" key={output.key}>
				<div className="output-title">{output.name}</div>
				<Socket type="output" socket={output.socket} io={output} innerRef={bindSocket} />
			  </div>
			))}
			{/* Controls */}
			{controls.map(control => (
			  <Control className="control" key={control.key} control={control} innerRef={bindControl} />
			))}
			{/* Inputs */}
			{inputs.map(input => (
			  <div className="input" key={input.key}>
				<Socket type="input" socket={input.socket} io={input} innerRef={bindSocket} />
				{!input.showControl() && <div className="input-title">{input.name}</div>}
				{input.showControl() && <Control className="input-control" control={input.control} innerRef={bindControl} />}
			  </div>
			))}
		  </div>
		)
	}
}