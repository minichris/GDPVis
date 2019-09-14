import React from "react";
import ReactDOM from "react-dom";

import Rete from "rete";
import ConnectionPlugin from 'rete-connection-plugin';
import AlightRenderPlugin from 'rete-alight-render-plugin';
import ContextMenuPlugin from 'rete-context-menu-plugin';
import AreaPlugin from 'rete-area-plugin';
import ReactRenderPlugin from 'rete-react-render-plugin';
import LifecyclePlugin from 'rete-lifecycle-plugin';

import components from './nodes';
import './style.css';

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
              "node": 5,
              "input": "patternsInput",
              "data": {}
            }
          ]
        }
      },
      "position": [
        -99.82572836965808,
        391.62714369277666
      ],
      "name": "All Patterns"
    },
    "3": {
      "id": 3,
      "data": {},
      "inputs": {
        "patternsInput": {
          "connections": [
            {
              "node": 4,
              "output": "patterns",
              "data": {}
            }
          ]
        }
      },
      "outputs": {},
      "position": [
        883.0746137065316,
        223.37042544224636
      ],
      "name": "Output Data"
    },
    "4": {
      "id": 4,
      "data": {
        "PatternCategory": {
          "value": "Negative Patterns",
          "label": "Negative Patterns"
        }
      },
      "inputs": {
        "patternsInput": {
          "connections": [
            {
              "node": 5,
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
        593.593076789012,
        222.17088114454072
      ],
      "name": "Filter Patterns by Category"
    },
    "5": {
      "id": 5,
      "data": {
        "Game": {
          "value": "World of Warcraft",
          "label": "World of Warcraft"
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
              "node": 4,
              "input": "patternsInput",
              "data": {}
            }
          ]
        }
      },
      "position": [
        163.1436367828802,
        274.01041945660154
      ],
      "name": "Filter Patterns to Those Linked To A Game"
    }
  }
};

export class ReteFilterModule extends React.Component {
	constructor(props){
		super(props);
	}
	
	getEditorAsJSON(){
		return this.editor.toJSON();
	}
	
	filtersButtonClick(event){
		if(!this.editor){
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