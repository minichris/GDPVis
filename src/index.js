import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import React from "react";
import ReactDOM from "react-dom";

import {Patterns, Games, PatternCategories, GameCategories, loadPatterns, loadGames, createGameToPatternRelations, createPatternToGameRelation, fixCanInstantiatepLinks} from './loaddata.js';
import {WarningDialog} from './warningdialog.js';
import {Tooltip, LinkTooltip, LinkExpandedTooltip, PatternTooltip} from './tooltip.js';
import {DocumentViewer, getPageType, DisplayDocumentViewer} from './browser.js';
import {Graph} from './graph.js';
import {SearchBox} from './search.js';
import {loadFiltersorDefaults, setWindowHistory} from './saving.js';
import {ReteFilterModule} from './rete/retefilters.js';
import updateReteComponentFromSearch from './rete/updateReteComponentFromSearch.js';
import './style.css';

var seachBoxComponent, reteFilterComponent, graphSelectBoxComponent, warningDialogComponent, visualFilterComponent, filterGraph, currentlyFilteredData;

global.Filters = [];

$( document ).ready(function() {
	var requiredDataLoadedPromise = Promise.all([loadPatterns(), loadGames()]); 
	global.docViewerComponent = ReactDOM.render(<DocumentViewer />, document.getElementById("DocumentViewer"));
	global.graphComponent = ReactDOM.render(<Graph />, document.getElementById("Graph"));
	//graphSelectBoxComponent = ReactDOM.render(<GraphSelectBox />, document.getElementById("Search"));
	warningDialogComponent = ReactDOM.render(<WarningDialog />, document.getElementById("WarningDialog"));
	requiredDataLoadedPromise.then(function() {
		createGameToPatternRelations();
		createPatternToGameRelation();
		fixCanInstantiatepLinks();
		
		loadFiltersorDefaults();
		//bindFilters();
		//applyFilters();
		$("#Search").show();
		$("#Graph").show();
		$("#LoadingAjax").hide();
		seachBoxComponent = ReactDOM.render(<SearchBox />, document.getElementById("SearchBoxOuter"));
		global.toolTipComponent = ReactDOM.render(<Tooltip />, document.getElementById("Tooltip"));
		DisplayDocumentViewer(true);
		
		//set up the filter graph stuff
		global.reteFilterComponent = ReactDOM.render(<ReteFilterModule />, document.getElementById("VisualFilterModule"));
	});
});

global.updateReteFilters = function(query){
	let pageType = getPageType(query);
	updateReteComponentFromSearch(global.reteFilterComponent, pageType, query);
}

//Given a set of filtered patterns, refreshes the graph with these patterns
global.refreshGraph = function(filteredData){
	currentlyFilteredData = filteredData;
	console.log(filteredData);
	if(filteredData[0] && !filteredData[0].name){ //protection against putting games in for now
		global.graphComponent.setState({patterns: filteredData});
		setWindowHistory(global.docViewerComponent.state.title);
	}
}

//Function to find if a pattern is in the list of currently filtered patterns
global.checkPatternCurrentlyFiltered = function(patternName){
	//check if the page we are looking for is in the current patterns
	return (currentlyFilteredData.find(fPattern => fPattern.Title == patternName) != null);
}
