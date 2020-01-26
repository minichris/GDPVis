import {startLogger} from './logger.js';
import 'augmented-ui/augmented.css'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import React from "react";
import ReactDOM from "react-dom";

import {getAllData} from './loaddata.js';
import {DocumentViewer, getPageType} from './browser';
import DocumentViewerOpenButton from './browser/components/DocumentViewerOpenButton.js';
import {Graph} from './graph.js';
import SearchBox from './search.js';
import ReteFilterModule from './rete';
import updateReteComponentFromSearch from './rete/updateReteComponentFromSearch.js';
import './style.css';
import './mobile-style.css';
import getExampleData from './rete/exampledata.js';
import {BackButtonComponent, getURLasJSON} from './history.js';

var currentlyFilteredData = [], prevFilteredData;
global.ignoreSettingHistoryOnce = true;

class LoadedApp extends React.Component{
	constructor(props){
		super(props);
		this.docViewerRef = React.createRef();
		this.reteFilterRef = React.createRef();
		this.graphRef = React.createRef();
		global.historyObj  = React.createRef();
	}
	
	updateGlobals(){
		global.docViewerComponent = this.docViewerRef.current;
		global.reteFilterComponent = this.reteFilterRef.current;
		global.graphComponent = this.graphRef.current;
	}

	componentDidUpdate(){
		this.updateGlobals();
	}

	componentDidMount(){
		this.updateGlobals();
	}

	titleClick(){
		var pageJson = [];
		pageJson["filters"] = getExampleData();
		pageJson["currentPage"] = "Special:GDPVis";
		initializeFromStateObject(pageJson);
	}
	
	render(){
		return(
			<>
				<header>
					<h1 onClick={this.titleClick}>GDPVis</h1>
					<span id="VersionString">{"version: " + BRANCH + " " + COMMITHASH.slice(0,7)}</span>
					<SearchBox />
				</header>
				<div id="Content">
					<div id="GraphLayout">
						<ReteFilterModule ref={this.reteFilterRef} />
						<Graph ref={this.graphRef} />
					</div>
					<DocumentViewer ref={this.docViewerRef}/>
					<DocumentViewerOpenButton />
					<BackButtonComponent ref={global.historyObj} />
				</div>
			</>
		);
	}
}

$( document ).ready(function() {
	startLogger();
	$("body").removeClass("loading");
	var requiredDataLoadedPromise = getAllData();
	requiredDataLoadedPromise.then(function() {
		$("body").addClass("fullyloaded");
		ReactDOM.render(<LoadedApp />, document.getElementsByTagName("body")[0]);
		loadFiltersorDefaults();
	});
});

global.updateReteFiltersFromQuery = function(query){
	let pageType = getPageType(query);
	updateReteComponentFromSearch(global.reteFilterComponent, pageType, query);
	if(!query.includes("GenericSearch:")){ //if it isn't a generic search which would have no real page
		setWindowHistory(false); //add the previous state to the history
		global.docViewerComponent.setState({title: query});
		global.docViewerComponent.displayDocumentViewer(true);
	}
	else{
		setWindowHistory(false); //add the previous state to the history
	}
}

//Given a set of filtered patterns, refreshes the graph with these patterns
global.refreshGraph = function(filteredData){
	if(filteredData != prevFilteredData){ //don't bother updating unless its different
		currentlyFilteredData = filteredData;
		let dataType;
		if(filteredData[0] && filteredData[0].name){
			dataType = "Games"
		}
		else if(filteredData[0] && filteredData[0].Title){
			dataType = "Patterns"
		}
		else{
			dataType = null;
		}
		global.graphComponent.setState({displayData: filteredData, dataType: dataType});
	}
}

//Function to find if a pattern is in the list of currently filtered patterns
global.isPatternCurrentlyFiltered = function(patternName){
	if(currentlyFilteredData[0] && currentlyFilteredData[0].Title){
		//check if the page we are looking for is in the current patterns
		return (currentlyFilteredData.find(fPattern => fPattern.Title == patternName) != null);
	}
	else{
		return false;
	}
}


export function setWindowHistory(replace, forceSaveData){
	try {
		let saveData;
		if(forceSaveData){
			saveData = forceSaveData;
		}
		else{
			saveData = {
				currentPage: global.docViewerComponent.state.title, //current browser page
				filters: global.reteFilterComponent.editor.toJSON() //current Filters
			}
		}
		console.log("trying to setWindowHistory() with", saveData);
		
		if(Object.keys(saveData.filters.nodes).length > 0){
			if(replace){
				global.historyObj.current.replaceState(saveData);
			}
			else{
				global.historyObj.current.pushState(saveData);
			}
			console.log("Success in setWindowHistory()", global.historyObj.current.state.InternalHistory);
		}
		else{
			throw(new Error("Nodes length is not greater than 0"));
		}
	}
	catch(exception){
		console.warn("Failed at saving in setWindowHistory", exception);
		console.log(global.reteFilterComponent);
	}
}

export function initializeFromStateObject(stateObject){
	global.reteFilterComponent.initialize(stateObject["filters"]);
	global.docViewerComponent.setState({title: stateObject["currentPage"]});
	global.docViewerComponent.displayDocumentViewer(true);
}

function loadFiltersorDefaults(){	
	let pageJson = getURLasJSON();
	if(!pageJson){ //if can't get URL as JSON, use default filters
		pageJson = [];
		pageJson["filters"] = getExampleData();
		pageJson["currentPage"] = "Special:GDPVis";
	}
	console.log("Loading state from url or defaults", pageJson);
	initializeFromStateObject(pageJson);
}