import startLogger from './logger.js';
import 'augmented-ui/augmented.css'
import 'bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import $ from 'jquery';
import React from "react";
import ReactDOM from "react-dom";

import {getAllData} from './loadDataUtil.js';
import DocumentViewer from './browser';

import Graph from './graph';
import SearchBox from './search';
import ReteFilterModule from './rete';
import './style.css';
import './mobile-style.css';
import HistoryButtonsComponent from './history';

import {difference} from 'lodash';

import { Provider } from 'react-redux';

import store from './store';
import {goHome} from './store/actions';

import ShortenerButton from './shortenerbutton.js';

var currentlyFilteredData = [];

class LoadedApp extends React.Component{
	constructor(props){
		super(props);
		this.graphRef = React.createRef();
	}

	componentDidUpdate(){
		global.graphComponent = this.graphRef.current;
	}

	componentDidMount(){
		global.graphComponent = this.graphRef.current;
	}

	titleClick(){
		store.dispatch(goHome());
	}
	
	render(){
		return(
			<Provider store={store}>
				<header>
					<h1 onClick={this.titleClick.bind(this)}>GDPVis</h1>
					<span id="VersionString">{"version: " + BRANCH + " " + COMMITHASH.slice(0,7)}</span>
					<SearchBox />
				</header>
				<div id="Content">
					<div id="GraphLayout">
						<ReteFilterModule/>
						<Graph ref={this.graphRef}>
							<ShortenerButton/>
						</Graph>
					</div>
					<DocumentViewer/>
					<HistoryButtonsComponent/>
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
	});
});

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