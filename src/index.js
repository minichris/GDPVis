import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import React from "react";
import ReactDOM from "react-dom";
import './style.css';

import {Patterns, Games, PatternCategories, GameCategories, loadPatterns, loadGames} from './loaddata.js';
import {WarningDialog} from './warningdialog.js';
import {Tooltip, LinkTooltip, LinkExpandedTooltip, PatternTooltip} from './tooltip.js';
import {getBrowserComponentSingleton, getPageType, DisplayDocumentViewer} from './browser.js';
import {getGraphComponentSingleton} from './graph.js';
import {SearchBox} from './search.js';
import {FilterGraph, VisualFilterModule} from './visualfilter.js';
import {performFiltering, generateReleventFilters} from './oldfilters.js';

var docViewerComponent, toolTipComponent, seachBoxComponent, graphComponent, graphSelectBoxComponent, warningDialogComponent, visualFilterComponent, filterGraph;

global.Filters = [];

$( document ).ready(function() {
	var requiredDataLoadedPromise = Promise.all([loadPatterns(), loadGames()]);
	docViewerComponent = getBrowserComponentSingleton(document.getElementById("DocumentViewer"));
	graphComponent = getGraphComponentSingleton(document.getElementById("Graph"));
	//graphSelectBoxComponent = ReactDOM.render(<GraphSelectBox />, document.getElementById("Search"));
	warningDialogComponent = ReactDOM.render(<WarningDialog />, document.getElementById("WarningDialog"));
	requiredDataLoadedPromise.then(function() {
		createGameToPatternRelations();
		loadFiltersorDefaults();
		//bindFilters();
		//applyFilters();
		$("#Search").show();
		$("#Graph").show();
		$("#LoadingAjax").hide();
		seachBoxComponent = ReactDOM.render(<SearchBox />, document.getElementById("SearchBoxOuter"));
		toolTipComponent = ReactDOM.render(<Tooltip />, document.getElementById("Tooltip"));
		DisplayDocumentViewer(true);
		
		//set up the filter graph stuff
		filterGraph = new FilterGraph();
		filterGraph.initialize();
		filterGraph.graphNodes[1].outputPort.connectPort(filterGraph.graphNodes[0].inputPorts[0]);
		visualFilterComponent = ReactDOM.render(<VisualFilterModule FilterGraphObject={filterGraph} />, document.getElementById("VisualFilterModule"));
	});
});

//Adds members to the game array of associated patterns
function createGameToPatternRelations(){
	Games.forEach(function(game){
		game.LinkedPatterns = Patterns.filter(pattern => pattern.PatternsLinks.some(pLink => pLink.To == game.name))
	});
}

//Given a set of filtered patterns, refreshes the graph with these patterns
global.refreshGraph = function(filteredPatterns){
	graphComponent.setState({patterns: filteredPatterns});
	//graphSelectBoxComponent.setState({patterns: filteredPatterns});
	setWindowHistory(docViewerComponent.state.title);
}

//Function to find if a pattern is in the list of currently filtered patterns
function checkPatternCurrentlyFiltered(patternName){
	//get the currently filtered patterns
	var currentlyFilteredPatterns = performFiltering(global.Filters);
	//check if the page we are looking for is in the current patterns
	return (currentlyFilteredPatterns.find(fPattern => fPattern.Title == patternName) != null);
}

//-------------------------------------------------------------------------
//The following section controls the saving and loading Filters from the URL
//-------------------------------------------------------------------------
function loadFiltersorDefaults(){
	var urlParams = new URLSearchParams( new URL(window.location).search);
	if(urlParams.has('data')) { //if the url has Filters in the GET request
		global.Filters = JSON.parse(atob(urlParams.get('data')))["filters"]; //parse the Filters
		let pageToDisplay = JSON.parse(atob(urlParams.get('data')))["currentPage"];
		docViewerComponent.setState({title: pageToDisplay});
	}
	else {
		//set example Filters
		global.Filters = [{Type: "game", Value: "World of Warcraft"},
		{Type: "pattern_category", Value: "Negative Patterns"}];
	}
}

function setWindowHistory(currentPage){
	let saveData = {
		filters: global.Filters, //current Filters
		currentPage: currentPage //current browser page
	}
	let encoded = btoa(JSON.stringify(saveData));
	window.history.pushState('VGTropes', 'VGTropes', '?data=' + encoded);
}
