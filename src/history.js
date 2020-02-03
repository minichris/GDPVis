//-------------------------------------------------------------------------
//The following section controls the saving and loading Filters from the URL
//-------------------------------------------------------------------------

import React from "react";
import {initializeFromStateObject} from './index.js';
import $ from 'jquery';

export class BackButtonComponent extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			InternalHistory: []
		}
	}
	
	getState(){
		return(this.state.InternalHistory[this.state.InternalHistory.length - 1])
	}
	
	pushState(stateObject){
		if(this.currentLastState == stateObject){
			console.warn("Tried to push state which is same as current state, ignored.");
			return;
		}
		
		if(global.ignoreSettingHistoryOnce){
			console.warn("Tried to set history while we are ignoring one set of the history, ignored.");
			global.ignoreSettingHistoryOnce = false;
			return;
		}
		
		this.setState({
			InternalHistory: this.state.InternalHistory.concat(stateObject)
		});
			
		const dataUrl = encodeJSONtoString(stateObject)
		window.history.replaceState('GDPVis', 'GDPVis', '?data=' + dataUrl);
		console.log("Pushed state to history", stateObject, this.state.InternalHistory);
	}
	
	replaceState(stateObject){		
		var historyArr = [...this.state.InternalHistory];
		historyArr[historyArr.length - 1] = stateObject;
		this.setState({
			InternalHistory: historyArr
		});
		
		const dataUrl = encodeJSONtoString(stateObject)
		window.history.replaceState('GDPVis', 'GDPVis', '?data=' + dataUrl);
		console.log("Replaced state in history", stateObject, this.state.InternalHistory);
	}
	
	currentLastState(){
		if(this.state.InternalHistory.length){
			return this.state.InternalHistory.slice(-1)[0];
		}
		else{
			return null;
		}
	}
	
	goBack(){
		global.ignoreSettingHistoryOnce = true;
		var historyArr = this.state.InternalHistory.slice(0); //Copy the array
		historyArr.pop(); //remove the last element of the array (the current state)
		this.setState({
			InternalHistory: historyArr
		});
		console.log("Current state is: ", this.currentLastState());
		
		const stateObject = this.currentLastState();
		const dataUrl = encodeJSONtoString(stateObject);
		window.history.replaceState('GDPVis', 'GDPVis', '?data=' + dataUrl);
		console.log("Popped state in history, going back to", stateObject);
		
		initializeFromStateObject(stateObject);
		
		return stateObject;
	}

	componentDidMount(){
		$(window).on('popstate',function() {
			this.goBack();
		});
	}
	
	backButtonClick(){
		if(this.currentLastState()){
			this.goBack();
		}
	}
	
	backButtonTitle(){
		var previousStateTexts = [];
		for(var i = 0; i < (Math.min(5, this.state.InternalHistory.length)); i++){
			var pageTitle = this.state.InternalHistory[i].currentPage;
			var pageFiltersCount = Object.values(this.state.InternalHistory[i].filters.nodes).length;
			previousStateTexts.push("\n(" + (i+1) + ") " + pageTitle + " with " + pageFiltersCount + " filter nodes");
		}
		if(this.state.InternalHistory.length > 5){
			previousStateTexts.push("\n...");
		}
		if(this.state.InternalHistory.length > 0){
			return "Click to go back. There is " + this.state.InternalHistory.length + " states in history. The last 5 are: " + previousStateTexts;
		}
		else{
			return "Click to go back. There is nothing in the history."
		}
	}
	
	render(){
		var disabledClass = "disabled aug-clickable";
		if(this.state.InternalHistory.length > 0){
			disabledClass = "enabled aug-clickable";
		}
		return(
			<div id="BackButtonOuter">
				<div onClick={this.backButtonClick.bind(this)} className={disabledClass} id="BackButton" title={this.backButtonTitle()} augmented-ui="tl-clip tr-clip b-clip exe">🢃</div>
			</div>
		);
	}
}

export function getURLasJSON(){
	var urlParams = new URLSearchParams( new URL(window.location).search);
	if(urlParams.has('data')) { //if the url has Filters in the GET request
		return decodeJSONfromString(urlParams.get('data'));
	}
	else{
		return null;
	}
}


//FUNCTIONS FOR ENCODING / DECODING JSON
export function encodeJSONtoString(JSONData){
	return btoa(unescape(encodeURIComponent(JSON.stringify(JSONData))));
}

export function decodeJSONfromString(string){
	return JSON.parse(decodeURIComponent(escape(atob(string))));
}