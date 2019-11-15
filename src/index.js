import {startLogger} from './logger.js';
import 'augmented-ui/augmented.css'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import React from "react";
import ReactDOM from "react-dom";

import {Patterns, Games, PatternCategories, GameCategories, getAllData} from './loaddata.js';
import WarningDialog from './warningdialog.js';
import Tooltip from './tooltip.js';
import {DocumentViewer, getPageType} from './browser';
import DocumentViewerOpenButton from './browser/components/DocumentViewerOpenButton.js';
import {Graph, ChangePatternSelection} from './graph.js';
import SearchBox from './search.js';
import ReteFilterModule from './rete';
import updateReteComponentFromSearch from './rete/updateReteComponentFromSearch.js';
import './style.css';
import getExampleData from './rete/exampledata.js';
import {BackButtonComponent, getURLasJSON, InternalHistory} from './history.js';

var reteFilterComponent, currentlyFilteredData = [], prevFilteredData;
var historyObj;
global.ignoreSettingHistoryOnce = true;

$( document ).ready(function() {
	startLogger();
	$("body").removeClass("loading");
	var requiredDataLoadedPromise = getAllData(); 
	global.docViewerComponent = ReactDOM.render(<DocumentViewer />, document.getElementById("DocumentViewer"));
	ReactDOM.render(<DocumentViewerOpenButton />, document.getElementById("DocumentViewerOpenButtonOuter"));
	historyObj = ReactDOM.render(<BackButtonComponent />, document.getElementById("BackButtonOuter"));
	var warningDialogComponent = ReactDOM.render(<WarningDialog />, document.getElementById("WarningDialog"));
	var toolTipComponent = ReactDOM.render(<Tooltip />, document.getElementById("Tooltip"));
	global.graphComponent = ReactDOM.render(<Graph ToolTipComponent={toolTipComponent} WarningDialogComponent={warningDialogComponent} />, document.getElementById("Graph"));
	requiredDataLoadedPromise.then(function() {
		$("#LoadingAjax").hide();
		$("body").addClass("fullyloaded");
		var seachBoxComponent = ReactDOM.render(<SearchBox />, document.getElementById("SearchBoxOuter"));
		reteFilterComponent = ReactDOM.render(<ReteFilterModule />, document.getElementById("VisualFilterModule"));
		global.rete = reteFilterComponent; //for debugging
		loadFiltersorDefaults();
		
		$("body > header > h1").click(function(){
			var pageJson = [];
			pageJson["filters"] = getExampleData();
			pageJson["currentPage"] = "Special:GDPVis";
			initializeFromStateObject(pageJson);
			
		});
		
		$(window).on('popstate',function(event) {
			historyObj.goBack();
		});
		
		let versionString = "version: " + VERSION.slice(0,8) + " " + BRANCH + " " + COMMITHASH.slice(0,7);
		$("#VersionString").text(versionString);
	});
});

global.updateReteFiltersFromQuery = function(query){
	let pageType = getPageType(query);
	let template = updateReteComponentFromSearch(reteFilterComponent, pageType, query);
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
				filters: reteFilterComponent.editor.toJSON() //current Filters
			}
		}
		console.log("trying to setWindowHistory() with", saveData);
		
		if(Object.keys(saveData.filters.nodes).length > 0){
			if(replace){
				historyObj.replaceState(saveData);
			}
			else{
				historyObj.pushState(saveData);
			}
			console.log("Success in setWindowHistory()", historyObj.state.InternalHistory);
		}
		else{
			throw(new Error("Nodes length is not greater than 0"));
		}
	}
	catch(exception){
		console.warn("Failed at saving in setWindowHistory", exception);
		console.log(reteFilterComponent);
	}
}

export function initializeFromStateObject(stateObject){
	reteFilterComponent.initialize(stateObject["filters"]);
	docViewerComponent.setState({title: stateObject["currentPage"]});
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