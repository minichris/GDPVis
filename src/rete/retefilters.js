import React from "react";
import ReactDOM from "react-dom";

import Rete from "rete";
import ConnectionPlugin from 'rete-connection-plugin';
import AlightRenderPlugin from 'rete-alight-render-plugin';
import ContextMenuPlugin from 'rete-context-menu-plugin';
import AreaPlugin from 'rete-area-plugin';
import ReactRenderPlugin from 'rete-react-render-plugin';
import LifecyclePlugin from 'rete-lifecycle-plugin';

import getExampleData from './exampledata.js';

import components from './nodes';
import './style.css';

export class ReteFilterModule extends React.Component {
	constructor(props){
		super(props);
	}
	
	getEditorAsJSON(){
		return this.editor.toJSON();
	}

	filtersButtonClick(event){
	}
	
	componentDidMount(){
		this.engine = new Rete.Engine('tasksample@0.1.0');

		components.list.map(c => {
			this.engine.register(c);
		});
		
		this.engine.process(getExampleData());
		
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

		this.editor.fromJSON(getExampleData()).then(() => {
			this.editor.view.resize();
		});

		this.editor.trigger('process');
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