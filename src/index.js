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

import {difference} from 'lodash';

var currentlyFilteredData = [];
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
	getAllData().then(function() {
		$("body").addClass("fullyloaded"); //hide the loading stuff and add some different css rules
		$("body").empty(); //remove all the loading content from body
		$("body").append("<div id='appContainer'></div>"); //add a container, rendering to the body causes react to throw an ugly error
		ReactDOM.render(<LoadedApp />, document.getElementById("appContainer"));
		loadFiltersorDefaults(); //load some data into the system
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
global.refreshGraph = function(newFilteredData){
	function checkSetDifferent(arrayA, arrayB){ //true if different
		return (difference(arrayA,arrayB).length !== 0) && 
			(arrayA.length != arrayB.length);
	}

	//don't bother updating unless its different
	if(checkSetDifferent(newFilteredData,currentlyFilteredData).length !== 0){ 
		if(newFilteredData.length > 0){
			console.warn("Tried to call global.refreshGraph with an empty array.");
			return;
		}
		console.log("New data, refreshing graph", currentlyFilteredData, newFilteredData);
		currentlyFilteredData = newFilteredData;
		let dataType;
		if(currentlyFilteredData[0] && currentlyFilteredData[0].name){
			dataType = "Games"
		}
		else if(currentlyFilteredData[0] && currentlyFilteredData[0].Title){
			dataType = "Patterns"
		}
		else{
			dataType = null;
		}
		global.graphComponent.setState({displayData: currentlyFilteredData, dataType: dataType});
	}
	else{
		console.warn("Something tried to call global.refreshGraph with the same data it already contains.", currentlyFilteredData, newFilteredData);
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
		
		if(Object.keys(saveData.filters.nodes).length > 0){
			if(replace){
				console.log("trying to replaceState from setWindowHistory() with", saveData);
				global.historyObj.current.replaceState(saveData);
			}
			else{
				console.log("trying to pushState from setWindowHistory() with", saveData);
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
		console.info("Loading state from defaults", pageJson);
	}
	else{
		console.info("Loading state from url", pageJson);
	}
	initializeFromStateObject(pageJson);
}