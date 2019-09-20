import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import React from "react";
import ReactDOM from "react-dom";

import {Patterns, Games, PatternCategories, GameCategories, getAllData} from './loaddata.js';
import WarningDialog from './warningdialog.js';
import Tooltip from './tooltip.js';
import {DocumentViewer, getPageType} from './browser';
import {Graph, ChangePatternSelection} from './graph.js';
import SearchBox from './search.js';
import ReteFilterModule from './rete';
import updateReteComponentFromSearch from './rete/updateReteComponentFromSearch.js';
import './style.css';
import getExampleData from './rete/exampledata.js';

var reteFilterComponent, currentlyFilteredData = [], prevFilteredData;

$( document ).ready(function() {
	$("body").removeClass("loading");
	var requiredDataLoadedPromise = getAllData(); 
	global.docViewerComponent = ReactDOM.render(<DocumentViewer />, document.getElementById("DocumentViewer"));
	var warningDialogComponent = ReactDOM.render(<WarningDialog />, document.getElementById("WarningDialog"));
	var toolTipComponent = ReactDOM.render(<Tooltip />, document.getElementById("Tooltip"));
	global.graphComponent = ReactDOM.render(<Graph ToolTipComponent={toolTipComponent} WarningDialogComponent={warningDialogComponent} />, document.getElementById("Graph"));
	requiredDataLoadedPromise.then(function() {
		$("#LoadingAjax").hide();
		var seachBoxComponent = ReactDOM.render(<SearchBox />, document.getElementById("SearchBoxOuter"));
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

global.updateReteFiltersFromQuery = function(query){
	let pageType = getPageType(query);
	updateReteComponentFromSearch(reteFilterComponent, pageType, query);
	if(!query.includes("GenericSearch:")){ //if it isn't a generic search which would have no real page
		global.docViewerComponent.setState({title: query});
		global.docViewerComponent.displayDocumentViewer(true);
	}
	setWindowHistory(false);
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



//-------------------------------------------------------------------------
//The following section controls the saving and loading Filters from the URL
//-------------------------------------------------------------------------
function getURLasJSON(forceURL){
	var urlParams;
	if(forceURL){
		urlParams = new URLSearchParams( new URL(forceURL).search);
	}
	else{
		urlParams = new URLSearchParams( new URL(window.location).search);
	}
	if(urlParams.has('data')) { //if the url has Filters in the GET request
		return JSON.parse(decodeURIComponent(escape(atob(urlParams.get('data')))));
	}
	else{
		return null;
	}
}

function loadFiltersorDefaults(forceURL){
	function initializeRete(data){
		reteFilterComponent.editor.fromJSON(data).then(() => {
			reteFilterComponent.editor.view.resize();
			reteFilterComponent.editor.trigger('process');
		});
	}
	
	if(getURLasJSON(forceURL)){
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
	global.docViewerComponent.displayDocumentViewer(true);
}

export function setWindowHistory(replace = false){
	if(reteFilterComponent && global.docViewerComponent){
		if(global.docViewerComponent.state.prevtitle != "Special:UnreachablePage" && currentlyFilteredData != prevFilteredData){	
			console.log("Setting window history");
			let saveData = {
				currentPage: global.docViewerComponent.state.title, //current browser page
				filters: reteFilterComponent.editor.toJSON() //current Filters
			}
			if(saveData.filters.nodes != {}){
				let encoded = btoa(unescape(encodeURIComponent(JSON.stringify(saveData))));
				if(replace){
					window.history.replaceState(global.docViewerComponent.state.title, 'VGTropes', '?data=' + encoded);
					console.log("Replaced window history: ", saveData, JSON.stringify(saveData).length);
				}
				else{
					window.history.pushState(global.docViewerComponent.state.title, 'VGTropes', '?data=' + encoded);
					console.log("Set window history: ", saveData, JSON.stringify(saveData).length);
				}
				console.log("current history: ", getURLasJSON(), JSON.stringify(getURLasJSON()).length);
				console.log("match: ", JSON.stringify(getURLasJSON()) == JSON.stringify(saveData));
				console.log("History length:",window.history.length);
			}
		}
		else{
			console.log("Couldn't set window history, not enough data");
		}
	}
	else{
		console.log("Couldn't set window history, rete / docviewer invalid");
	}
}

function handlePopState(event){
	console.log("History length:",window.history.length);
	loadFiltersorDefaults();
}