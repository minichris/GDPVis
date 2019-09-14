import React from "react";
import ReactDOM from "react-dom";

import Rete from "rete";
import ConnectionPlugin from 'rete-connection-plugin';
import AlightRenderPlugin from 'rete-alight-render-plugin';
import ContextMenuPlugin from 'rete-context-menu-plugin';
import AreaPlugin from 'rete-area-plugin';
import ReactRenderPlugin from 'rete-react-render-plugin';

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
        "PatternCategory": {
          "value": "Dynamic Patterns",
          "label": "Dynamic Patterns"
        }
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
        376.4544471810482,
        274.20994997178843
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
      "name": "Output Data"
    }
  }
};

export class ReteFilterModule extends React.Component {
	constructor(props){
		super(props);
	}
	
	filtersButtonClick(event){
		if(!this.editor){
			this.editor = new Rete.NodeEditor('tasksample@0.1.0', document.querySelector('#rete'));
			this.editor.use(AlightRenderPlugin);
			this.editor.use(ConnectionPlugin);
			this.editor.use(ContextMenuPlugin);
			this.editor.use(AreaPlugin);
			this.editor.use(ReactRenderPlugin);
			
			components.list.map(c => {
				this.editor.register(c);
			});
			
			this.editor.on('process nodecreated noderemoved connectioncreated connectionremoved', async () => {
				await this.engine.abort();
				var json = this.editor.toJSON();
				await this.engine.process(json);
			});

			this.editor.fromJSON(exampleData).then(() => {
				this.editor.view.resize();
			});

			this.editor.trigger('process');
		}
	}
	
	componentDidMount(){
		this.engine = new Rete.Engine('tasksample@0.1.0');

		components.list.map(c => {
			this.engine.register(c);
		});
		
		this.engine.process(exampleData);
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