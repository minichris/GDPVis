import React from "react";
import {getPageType} from '../index.js';

//given a page's title, returns the orginal page location
function getOrginalPageLocation(pageTitle){
	let pageType = getPageType(pageTitle);
	if(pageType == "Game Category" || pageType == "Pattern Category"){
		return "http://virt10.itu.chalmers.se/index.php/Category:" + pageTitle.replace(/ /g,"_");
	}
	if(pageType == "Special"){
		return false; //lets just ignore special pages for now
		//return "http://virt10.itu.chalmers.se/index.php/Special:" + pageTitle.replace(/ /g,"_");
	}
	return "http://virt10.itu.chalmers.se/index.php/" + pageTitle.replace(/ /g,"_");
}

function getEditPageLocation(pageTitle){
	if(getPageType(pageTitle) == "Game Category" || getPageType(pageTitle) == "Pattern Category"){
		return "http://virt10.itu.chalmers.se/index.php?title=Category:" + pageTitle + "&action=edit";
	}
	if(getPageType(pageTitle) == "Special"){
		return false;
	}
	return "http://virt10.itu.chalmers.se/index.php?title=" + pageTitle + "&action=edit";
}

function getDiscussionPageLocation(pageTitle){
	let pageType = getPageType(pageTitle);
	if(pageType == "Game Category" || pageType == "Pattern Category"){
		return "http://virt10.itu.chalmers.se/index.php/Category_talk:" + pageTitle.replace(/ /g,"_");
	}
	if(pageType == "Special"){
		return false;
	}
	return "http://virt10.itu.chalmers.se/index.php/Talk:" + pageTitle.replace(/ /g,"_");
}

function getHistoryPageLocation(pageTitle){
	if(getPageType(pageTitle) == "Game Category" || getPageType(pageTitle) == "Pattern Category"){
		return "http://virt10.itu.chalmers.se/index.php?title=Category:" + pageTitle + "&action=history";
	}
	if(getPageType(pageTitle) == "Special"){
		return false;
	}
	return "http://virt10.itu.chalmers.se/index.php?title=" + pageTitle + "&action=history";
}

export default class DocumentViewerToolbar extends React.Component{
	constructor(props) {
        super(props);
    }
	
	tocToggleButtonClick(event){
		if(document.getElementById("TableOfContents").style.display == "block"){ //if it was in the visable state, now going hidden
			document.getElementById("TableOfContents").style.display = "";
			document.getElementsByClassName("insertedPage")[0].style.marginLeft = "";	
		}
		else{ //if it was in the hidden state, now going visable
			document.getElementById("TableOfContents").style.display = "block";
			document.getElementsByClassName("insertedPage")[0].style.marginLeft = "200px";	
			document.getElementById("TableOfContents").style.height = document.querySelector("#DocumentContainer").clientHeight + "px";
		}
	}
	
	originalPageButtonClick(event){
		window.open(getOrginalPageLocation(this.props.pageTitle));
	}
	
	editPageButtonClick(event){
		window.open(getEditPageLocation(this.props.pageTitle));
	}
	
	discussionPageButtonClick(event){
		window.open(getDiscussionPageLocation(this.props.pageTitle));
	}
	
	historyPageButtonClick(event){
		window.open(getHistoryPageLocation(this.props.pageTitle));
	}
	
	closeButtonClick(event){
		global.docViewerComponent.displayDocumentViewer(false);
	}
	
	render(){
		return (
			<div id="DocumentViewerToolbar">
				<button onClick={this.tocToggleButtonClick.bind(this)} disabled={this.props.pageTitle.includes("Special:")} title="Toggle Table of Contents Pane" id="TocToggleButton" className="btn btn-light">ToC</button>
				<div id="ExternalLinkGroup">
					<button onClick={this.originalPageButtonClick.bind(this)} disabled={!getOrginalPageLocation(this.props.pageTitle)} title="Visit original article" id="OriginalPageButton" className="btn btn-light"><img src="icons/Original.png" /></button>
					<button onClick={this.editPageButtonClick.bind(this)} disabled={!getEditPageLocation(this.props.pageTitle)} title="Edit original article" id="EditPageButton" className="btn btn-light"><img src="icons/Edit.png" /></button>
					<button onClick={this.discussionPageButtonClick.bind(this)} disabled={!getDiscussionPageLocation(this.props.pageTitle)} title="Visit discussion page" id="DiscussionPageButton" className="btn btn-light"><img src="icons/Discussion.png" /></button>
					<button onClick={this.historyPageButtonClick.bind(this)} disabled={!getHistoryPageLocation(this.props.pageTitle)} title="Visit history page" id="HistoryPageButton" className="btn btn-light"><img src="icons/Original.png" /></button>
				</div>
				<button onClick={this.closeButtonClick.bind(this)} title="Close" id="TocToggleButton" className="btn btn-danger">X</button>
			</div>
		);
	}
}