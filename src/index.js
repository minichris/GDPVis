import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import React from "react";
import ReactDOM from "react-dom";

import {Patterns, Games, PatternCategories, GameCategories, getAllData} from './loaddata.js';
import {WarningDialog} from './warningdialog.js';
import Tooltip from './tooltip.js';
import {DocumentViewer, getPageType} from './browser';
import {Graph} from './graph.js';
import {SearchBox} from './search.js';
import {loadFiltersorDefaults, setWindowHistory} from './saving.js';
import ReteFilterModule from './rete';
import updateReteComponentFromSearch from './rete/updateReteComponentFromSearch.js';
import './style.css';

var seachBoxComponent, warningDialogComponent, reteFilterComponent, currentlyFilteredData;

global.Filters = [];

$( document ).ready(function() {
	$("body").removeClass("loading");
	var requiredDataLoadedPromise = getAllData(); 
	global.docViewerComponent = ReactDOM.render(<DocumentViewer />, document.getElementById("DocumentViewer"));
	warningDialogComponent = ReactDOM.render(<WarningDialog />, document.getElementById("WarningDialog"));
	global.graphComponent = ReactDOM.render(<Graph WarningDialogComponent={warningDialogComponent} />, document.getElementById("Graph"));
	requiredDataLoadedPromise.then(function() {
		//loadFiltersorDefaults();
		$("#Search").show();
		$("#Graph").show();
		$("#LoadingAjax").hide();
		seachBoxComponent = ReactDOM.render(<SearchBox />, document.getElementById("SearchBoxOuter"));
		global.toolTipComponent = ReactDOM.render(<Tooltip />, document.getElementById("Tooltip"));
		global.docViewerComponent.displayDocumentViewer(true);
		
		//set up the filter graph stuff
		reteFilterComponent = ReactDOM.render(<ReteFilterModule />, document.getElementById("VisualFilterModule"));
	});
});

global.updateReteFilters = function(query){
	let pageType = getPageType(query);
	updateReteComponentFromSearch(reteFilterComponent, pageType, query);
}

//Given a set of filtered patterns, refreshes the graph with these patterns
global.refreshGraph = function(filteredData){
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
	setWindowHistory(global.docViewerComponent.state.title);
}

//Function to find if a pattern is in the list of currently filtered patterns
global.checkPatternCurrentlyFiltered = function(patternName){
	if(currentlyFilteredData[0] && currentlyFilteredData[0].Title){
		//check if the page we are looking for is in the current patterns
		return (currentlyFilteredData.find(fPattern => fPattern.Title == patternName) != null);
	}
	else{
		return false;
	}
}
