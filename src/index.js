import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import React from "react";
import ReactDOM from "react-dom";

import {Patterns, Games, PatternCategories, GameCategories, getAllData} from './loaddata.js';
import {WarningDialog} from './warningdialog.js';
import Tooltip from './tooltip.js';
import {DocumentViewer, getPageType} from './browser';
import {Graph, ChangePatternSelection} from './graph.js';
import {SearchBox} from './search.js';
import ReteFilterModule from './rete';
import updateReteComponentFromSearch from './rete/updateReteComponentFromSearch.js';
import './style.css';
import getExampleData from './rete/exampledata.js';

var seachBoxComponent, warningDialogComponent, reteFilterComponent, currentlyFilteredData = [];

$( document ).ready(function() {
	$("body").removeClass("loading");
	var requiredDataLoadedPromise = getAllData(); 
	global.docViewerComponent = ReactDOM.render(<DocumentViewer />, document.getElementById("DocumentViewer"));
	warningDialogComponent = ReactDOM.render(<WarningDialog />, document.getElementById("WarningDialog"));
	global.graphComponent = ReactDOM.render(<Graph WarningDialogComponent={warningDialogComponent} />, document.getElementById("Graph"));
	requiredDataLoadedPromise.then(function() {
		$("#Graph").show();
		$("#LoadingAjax").hide();
		seachBoxComponent = ReactDOM.render(<SearchBox />, document.getElementById("SearchBoxOuter"));
		global.toolTipComponent = ReactDOM.render(<Tooltip />, document.getElementById("Tooltip"));
		global.docViewerComponent.displayDocumentViewer(true);
		reteFilterComponent = ReactDOM.render(<ReteFilterModule />, document.getElementById("VisualFilterModule"));
		
		loadFiltersorDefaults();
		
		$("body > header > h1").click(function(){
			global.docViewerComponent.setState({
				title: "Special:VGTropes"
			});
			global.docViewerComponent.displayDocumentViewer(true);
		});
		
		$(window).on('popstate',function(event) {
			handlePopState(event);
		});
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
	setWindowHistory();
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



//-------------------------------------------------------------------------
//The following section controls the saving and loading Filters from the URL
//-------------------------------------------------------------------------
function getURLasJSON(){
	var urlParams = new URLSearchParams( new URL(window.location).search);
	if(urlParams.has('data')) { //if the url has Filters in the GET request
		return JSON.parse(decodeURIComponent(escape(atob(urlParams.get('data')))));
	}
	else{
		return null;
	}
}

function loadFiltersorDefaults(){
	function initializeRete(data){
		reteFilterComponent.engine.process(data);
		reteFilterComponent.editor.fromJSON(data).then(() => {
			reteFilterComponent.editor.view.resize();
			reteFilterComponent.editor.trigger('process');
		});
	}
	
	if(getURLasJSON()){
		console.log("Retriving window history");
		let filters = getURLasJSON()["filters"]; //parse the Filters
		
		initializeRete(filters);

		let pageToDisplay = getURLasJSON()["currentPage"];
		docViewerComponent.setState({title: pageToDisplay});
		console.log("Retrived window history:", pageToDisplay, filters);
	}
	else {
		console.log("Couldn't Retrive window history, using example data");
		initializeRete(getExampleData());
		docViewerComponent.setState({title: "Special:VGTropes"});
	}
}

export function setWindowHistory(){
	if(reteFilterComponent && global.docViewerComponent){
		console.log("Setting window history");
		let saveData = {
			currentPage: global.docViewerComponent.state.title, //current browser page
			filters: reteFilterComponent.editor.toJSON() //current Filters
		}
		let encoded = btoa(unescape(encodeURIComponent(JSON.stringify(saveData))));
		window.history.pushState(global.docViewerComponent.state.title, 'VGTropes', '?data=' + encoded);
		console.log("Set window history: ", saveData, JSON.stringify(saveData).length);
		console.log("current history: ", getURLasJSON(), JSON.stringify(getURLasJSON()).length);
		console.log("match: ", JSON.stringify(getURLasJSON()) == JSON.stringify(saveData));
	}
	else{
		console.log("Couldn't set window history, rete / docviewer invalid");
	}
}

function handlePopState(event){
	console.log(event);
	loadFiltersorDefaults();
	//window.history.back();
}