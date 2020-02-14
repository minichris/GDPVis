import {startLogger} from './logger.js';
import 'augmented-ui/augmented.css'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import React from "react";
import ReactDOM from "react-dom";

import {getAllData} from './loaddata.js';
import DocumentViewer, {getPageType} from './browser';

import {Graph} from './graph.js';
import SearchBox from './search.js';
import ReteFilterModule from './rete';
import './style.css';
import './mobile-style.css';
import getExampleData from './rete/exampledata.js';
import {encodeJSONtoString, getURLasJSON} from './history.js';

import {difference} from 'lodash';

import { Provider } from 'react-redux';

import store, {changeFilters, updateFromSearch} from './store.js';

var currentlyFilteredData = [];
global.ignoreSettingHistoryOnce = true;

class LoadedApp extends React.Component{
	constructor(props){
		super(props);
		//this.docViewerRef = React.createRef();
		//this.reteFilterRef = React.createRef();
		this.graphRef = React.createRef();
		//global.historyObj  = React.createRef();
	}
	
	updateGlobals(){
		//global.docViewerComponent = this.docViewerRef.current;
		//global.reteFilterComponent = this.reteFilterRef.current;
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
		//<BackButtonComponent ref={global.historyObj} />
		return(
			<Provider store={store}>
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
					
				</div>
			</Provider>
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
	store.dispatch(updateFromSearch(query));
}

//Given a set of filtered patterns, refreshes the graph with these patterns
global.refreshGraph = function(newFilteredData, type){
	function checkSetDifferent(arrayA, arrayB){ //true if different
		return (difference(arrayA,arrayB).length !== 0) || 
			(arrayA.length != arrayB.length);
	}

	function getGraphFriendlyDataType(type){
		switch(type){
			case "games":
				return "Games";
			case "patterns":
				return "Patterns";
			default:
				return null;
		}
	}

	//don't bother updating unless its different
	if(checkSetDifferent(newFilteredData,currentlyFilteredData).length !== 0){ 
		console.log("New data, refreshing graph", currentlyFilteredData, newFilteredData);
		currentlyFilteredData = newFilteredData;
		global.graphComponent.setState({displayData: currentlyFilteredData, dataType: getGraphFriendlyDataType(type)});
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

export function initializeFromStateObject(stateObject){
	//global.reteFilterComponent.initialize(stateObject["filters"]);
	//global.docViewerComponent.setState({title: stateObject["currentPage"]});
	//global.docViewerComponent.displayDocumentViewer(true);
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