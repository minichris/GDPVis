import React from "react";
import ReactDOM from "react-dom";

import Rete from "rete";
import ConnectionPlugin from 'rete-connection-plugin';
import AlightRenderPlugin from 'rete-alight-render-plugin';
import ContextMenuPlugin from 'rete-context-menu-plugin';
import AreaPlugin from 'rete-area-plugin';

import components from './nodes';

var exampleData = {
  "id": "tasksample@0.1.0",
  "nodes": {
	"1": {
	  "id": 1,
	  "data": {},
	  "inputs": {},
	  "outputs": {
		"patterns": {
		  "connections": [
			{
			  "node": 2,
			  "input": "patternsInput",
			  "data": {}
			}
		  ]
		}
	  },
	  "position": [
		122.00706961593409,
		358.67667621567676
	  ],
	  "name": "All Patterns"
	},
	"2": {
	  "id": 2,
	  "data": {
		"PatternCategory": "Patterns"
	  },
	  "inputs": {
		"patternsInput": {
		  "connections": [
			{
			  "node": 1,
			  "output": "patterns",
			  "data": {}
			}
		  ]
		}
	  },
	  "outputs": {
		"patterns": {
		  "connections": [
			{
			  "node": 3,
			  "input": "patternsInput",
			  "data": {}
			}
		  ]
		}
	  },
	  "position": [
		406.4642415064035,
		283.10176466205877
	  ],
	  "name": "Filter Patterns by Category"
	},
	"3": {
	  "id": 3,
	  "data": {},
	  "inputs": {
		"patternsInput": {
		  "connections": [
			{
			  "node": 2,
			  "output": "patterns",
			  "data": {}
			}
		  ]
		}
	  },
	  "outputs": {},
	  "position": [
		696.4694657285974,
		289.77895576332656
	  ],
	  "name": "Display Patterns"
	}
  }
};

export class ReteFilterModule extends React.Component {
	filtersButtonClick(event){
		//Do nothing
	}
	
	componentDidMount(){
		var container = document.querySelector('#rete');


		var editor = new Rete.NodeEditor('tasksample@0.1.0', container);
		editor.use(AlightRenderPlugin);
		editor.use(ConnectionPlugin);
		editor.use(ContextMenuPlugin);
		editor.use(AreaPlugin);

		var engine = new Rete.Engine('tasksample@0.1.0');

		components.list.map(c => {
		  editor.register(c);
		  engine.register(c);
		});

		editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => {
			await engine.abort();
			var json = editor.toJSON();
			await engine.process(json, 3);
			console.log(json);
		});



		editor.fromJSON(exampleData).then(() => {
		  editor.view.resize();
		});

		editor.trigger('process');
	}
	
	render(){
		return (
		<>
			<button onClick={this.filtersButtonClick.bind(this)} id="ShowFiltersButton" style={{display: "inline-block"}} className="btn btn-light" data-toggle="collapse" data-target="#FilterPanel">Filters</button>
			<div id="FilterPanel" className="collapse">
				<div id="rete"></div>
			</div>
		</>
		);
	}
}