import React from "react";
import ReactDOM from "react-dom";
import $ from 'jquery';

import Rete from "rete";
import ConnectionPlugin from 'rete-connection-plugin';
import AlightRenderPlugin from 'rete-alight-render-plugin';
import ContextMenuPlugin from 'rete-context-menu-plugin';
import AreaPlugin from 'rete-area-plugin';
import ReactRenderPlugin from 'rete-react-render-plugin';
import LifecyclePlugin from 'rete-lifecycle-plugin';

import components from './nodes';
import './style.css';

export function toggleFiltersPanel(){
	$("#FilterPanel").toggleClass('out');
	if($("#FilterPanel").hasClass('out')){
		$("#ShowFiltersButton").addClass("btn-danger");
		$("#ShowFiltersButton").removeClass("btn-light");
		$("#ShowFiltersButton").text("X");
	}
	else{
		$("#ShowFiltersButton").addClass("btn-light");
		$("#ShowFiltersButton").removeClass("btn-danger");
		$("#ShowFiltersButton").text("Change Filters");
	}
}

export function closeFiltersPanel(){
	$("#FilterPanel").removeClass('out');
	$("#ShowFiltersButton").addClass("btn-light");
	$("#ShowFiltersButton").removeClass("btn-danger");
	$("#ShowFiltersButton").text("Change Filters");
}

export default class ReteFilterModule extends React.Component {
	constructor(props){
		super(props);
	}
	
	getEditorAsJSON(){
		return this.editor.toJSON();
	}

	filtersButtonClick(event){
		toggleFiltersPanel();
	}
	
	componentDidMount(){
		this.engine = new Rete.Engine('tasksample@0.1.0');

		components.list.map(c => {
			this.engine.register(c);
		});
		
		this.editor = new Rete.NodeEditor('tasksample@0.1.0', document.querySelector('#rete'));
		this.editor.use(AlightRenderPlugin);
		this.editor.use(ConnectionPlugin);
		this.editor.use(ContextMenuPlugin);
		this.editor.use(LifecyclePlugin);
		this.editor.use(AreaPlugin, {
			snap: false,
			scaleExtent: { min: 0.25, max: 1 },
			translateExtent: { width: 6000, height: 3500 }
		});
		this.editor.use(ReactRenderPlugin);
		
		components.list.map(c => {
			this.editor.register(c);
		});

		this.editor.on('process connectioncreated', async () => {
			//ignoring noderemoved, nodecreate, connectionremoved
			await this.engine.abort();
			console.log(this.editor.toJSON());
			await this.engine.process(this.editor.toJSON());
		});
		
		this.editor.on('nodetranslate', function(node, x, y){
			if(document.activeElement.parentElement.className == "controlInner"){
				return false;
			}
		});
		
		let ourEditor = this.editor;
		//custom function for nodes to prevent them from wanting to process every control change even when not completely plugged in
		Rete.Node.prototype.processControlChange = function(){
			if(this.inputs.size + this.outputs.size == this.getConnections().length){
				ourEditor.trigger("process");
			}
		}
		
		//adds delete button to delete node support
		let selfEditor = this.editor;
		$(document).keyup(function (e) {
			if(e.keyCode == 46 && $("#FilterPanel").hasClass("out")) {
				selfEditor.nodes.forEach(function(node){
					if(selfEditor.selected.list.includes(node)){
						selfEditor.removeNode(node);
					}
				});
			}
		});
		
	}
	
	render(){
		return (
		<>
			<button onClick={this.filtersButtonClick.bind(this)} id="ShowFiltersButton" className="btn btn-light" data-toggle="toggle" data-target="#FilterPanel">Change Filters</button>
			<div id="FilterPanel">
				<span id="FilterPanelHeader">Filters Panel</span>
				<div id="rete"></div>
			</div>
		</>
		);
	}
}