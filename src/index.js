import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import React from "react";
import ReactDOM from "react-dom";

import {Patterns, Games, PatternCategories, GameCategories, loadPatterns, loadGames} from './loaddata.js';
import {WarningDialog} from './warningdialog.js';
import {Tooltip, LinkTooltip, LinkExpandedTooltip, PatternTooltip} from './tooltip.js';
import {DocumentViewer, getPageType, DisplayDocumentViewer} from './browser.js';
import {Graph} from './graph.js';
import {SearchBox} from './search.js';
import {FilterGraph, VisualFilterModule} from './visualfilter.js';
import {performFiltering, generateReleventFilters} from './oldfilters.js';
import {loadFiltersorDefaults, setWindowHistory} from './saving.js';

import './style.css';

var seachBoxComponent, graphSelectBoxComponent, warningDialogComponent, visualFilterComponent, filterGraph;

global.Filters = [];

$( document ).ready(function() {
	var requiredDataLoadedPromise = Promise.all([loadPatterns(), loadGames()]);
	global.docViewerComponent = ReactDOM.render(<DocumentViewer />, document.getElementById("DocumentViewer"));
	global.graphComponent = ReactDOM.render(<Graph />, document.getElementById("Graph"));
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
		global.toolTipComponent = ReactDOM.render(<Tooltip />, document.getElementById("Tooltip"));
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
	global.graphComponent.setState({patterns: filteredPatterns});
	//graphSelectBoxComponent.setState({patterns: filteredPatterns});
	setWindowHistory(global.docViewerComponent.state.title);
}