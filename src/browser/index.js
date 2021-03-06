import $ from 'jquery';
import React from "react";
import {Patterns, Games} from '../loadDataUtil.js';
import {ChangePatternSelection} from '../graph';

import DocumentViewerToolbar from './components/DocumentViewerToolbar.js';
import DocumentViewerTableOfContents from './components/DocumentViewerTableOfContents.js';
import DocumentResizer from './components/DocumentResizer.js';
import DocumentViewerOpenButton from './components/DocumentViewerOpenButton.js';

import GamePage from './pagetypes/GamePage.js';
import PatternPage from './pagetypes/PatternPage.js';
import CategoryPage from './pagetypes/CategoryPage.js';
import SpecialPage from './pagetypes/SpecialPage.js';

import tippy from 'tippy.js';
import 'tippy.js/dist/tippy.css';
import './tippy-gdpvis.css';

import { connect } from "react-redux";
import { setBrowserVisibility, updateFromSearch } from "../store/actions";

//-------------------------------------------------------------------------
//The following section contains the Browser react components
//-------------------------------------------------------------------------

class DocumentViewer extends React.Component{
	constructor(props) {
		super(props);
		this.internalPageRef = React.createRef();
		this.tableOfContentsRef = React.createRef();
		this.openSize = "50%";
	}

	displayDocumentViewer(show){
		this.props.dispatch(setBrowserVisibility(show));
	}

	mountOrUpdate(){
		let selfBrowser = this;
		if(this.props.open){
			document.getElementById("DocumentViewer").style.display = "flex";
			document.getElementById("DocumentViewer").style.width = this.openSize;
			document.getElementById("DocumentViewer").style.minWidth = null;
			document.getElementById("DocumentViewer").style.borderWidth = "2px 2px 2px 0px";
			
			let scrollableElement = document.querySelector("#DocumentContainer");
			if(scrollableElement){
				scrollableElement.scrollTop = 0; //scroll the inner back to the top on page change
			}
			$( "#ShowFiltersButton" ).ready(function() {
				$("#ShowFiltersButton").hide();
			});
			$("#DocumentViewerOpenButton").ready(function (){
				$("#DocumentViewerOpenButton").hide();
			});
			logger.info("Document viewer panel was opened (possibly automatic) @ " + Math.round((new Date()).getTime() / 1000));
		}
		else{
			document.getElementById("DocumentViewer").style.width = "0"
			document.getElementById("DocumentViewer").style.minWidth = "0"
			document.getElementById("DocumentViewer").style.borderWidth = "0px"
			setTimeout(function(){
				document.getElementById("DocumentViewer").style.display = "none";			
			}, 500);
			$("#ShowFiltersButton").show();
			$("#DocumentViewerOpenButton").show();
			logger.info("Document viewer panel was closed (possibly automatic) @ " + Math.round((new Date()).getTime() / 1000));
		}


		//setting scrollbar back to top
		let scrollableElement = document.querySelector("#DocumentContainer");
		if(scrollableElement){
			scrollableElement.scrollTop = 0; //scroll the inner back to the top on page change
		}
		//setting up page links for in browser linking
		var elements = document.getElementsByTagName('a');
		var brokenLinks = [];
		for(var i = 0, len = elements.length; i < len; i++) {
			if(elements[i].host == "virt10.itu.chalmers.se"){
				elements[i].setAttribute("data-originallink", elements[i].attributes["href"]);
				elements[i].setAttribute("href", "javascript:;");
				
				if(elements[i].attributes['title'] != null && 
				getPageType(elements[i].attributes['title'].value) != "Other"){
					elements[i].onclick = function () {
						eventLinkClicked(this.attributes['title'].value);
					}									
				}
				else{
					elements[i].className += " broken-link";
					if(elements[i].attributes['title'] != null){
						brokenLinks.push(elements[i].attributes['title'].value);
					}
				}
			}
			else{
				if(elements[i].className != "ignore"){
					elements[i].onclick = function (event) {
						if(event.target.attributes['title']){
							eventLinkClicked(event.target.attributes['title'].value);
						}
					}
				}
			}

			
			if(elements[i].attributes['title']){
				let linkTitle = elements[i].attributes['title'].value;
				let pageType = getPageType(linkTitle);
				if(pageType == "Pattern"){
					let pattern = Patterns.find(pat => pat.Title == linkTitle);
					if(pattern){
						tippy(elements[i], {
							content: function(){
								return "<b>" + pattern.Title + "</b>" + ": " + pattern.ShortDescription;
							},
							theme: 'gdpvis',
							popperOptions: {
								modifiers: {
								  	computeStyle: {
										gpuAcceleration: false
								  	}
								}
							}
						});
					}
				}
			}
		}
		
		if(brokenLinks.length > 0){
			console.info("Detected broken links: ",brokenLinks);
		}
		
		function eventLinkClicked(linkClickedTitle, forceUpdateFilters = false){
			function isPageCurrentlyFiltered(pageName){
				let data = global.graphComponent.state.displayData;
				if(data[0] && data[0].Title){
					return (data.find(fPattern => fPattern.Title == pageName) != null);
				}
				if(data[0] && data[0].name){
					return (data.find(fGame => fGame.name == pageName) != null);
				}
				else{
					return false;
				}
			}
			
			if(linkClickedTitle){ //if the title isn't undefined

				//if the pattern isn't in the graph, or we are force updating the graph
				if(!isPatternCurrentlyFiltered(linkClickedTitle) || forceUpdateFilters){
					selfBrowser.props.dispatch(updateFromSearch(linkClickedTitle));
				}
				else{ //if it was in the graph and we aren't force updating the graph
					ChangePatternSelection(linkClickedTitle); //select the pattern
				}
				logger.info("User clicked a link to " + linkClickedTitle + " @ " + Math.round((new Date()).getTime() / 1000));
			}
		}
		
		if( $("#HeadingFilterText").length == 0 ){	
			let headingText = $(".firstHeading").text();
			$(".firstHeading").after( '<p id="HeadingFilterText">Filter to only patterns relating to ' + headingText + '...</p>' );
			
			//setting up page links for in browser linking
			$("#HeadingFilterText, .selflink").wrap( "<a href='javascript:;'></a>" ).click(function(){
				eventLinkClicked(headingText, true);
			});
		}
		
		this.tableOfContentsRef.current.forceUpdate();
	}

	componentDidMount(){
		this.mountOrUpdate();
	}
	
	componentDidUpdate(){		
		this.mountOrUpdate();
	}
	
	render(){
		let pageTitle = this.props.title;
		if(pageTitle == null){
			return(<div><h1>Error</h1><p>Null browser set up</p></div>);
		}
		console.info("Creating a document viewer for page '" + pageTitle + "', it is of type: " + getPageType(pageTitle));
		let pageToRender;
		switch(getPageType(pageTitle)){
		case "Pattern Category":
		case "Game Category":
			pageToRender = <CategoryPage ref={this.internalPageRef} title={pageTitle.replace('Category:', '')}/>;
			break;
		case "Game":
			pageToRender = <GamePage ref={this.internalPageRef} title={pageTitle}/>;
			break;
		case "Pattern":
			pageToRender = <PatternPage ref={this.internalPageRef} title={pageTitle}/>;
			break;
		case "Special":
			pageToRender = <SpecialPage ref={this.internalPageRef} title={pageTitle}/>;
			break;
		default:
			pageToRender = (
				<div ref={this.internalPageRef}>
					<span>Debug page, Title {pageTitle}</span>
				</div>
			);
			break;
		}

		return(
			<>
				<div id="DocumentViewer">
					<DocumentViewerToolbar Parent={this} pageTitle={pageTitle} />
					<div id="DocumentContainer">
						<DocumentViewerTableOfContents ref={this.tableOfContentsRef} internalPage={this.internalPageRef} />
						<div id ="InsertedPageOuter">
							<DocumentResizer Parent={this} />
							{pageToRender}
						</div>
					</div>
				</div>
				<DocumentViewerOpenButton Parent={this} />
			</>
		);
	}
}

const mapStateToProps = state => {
	return ({title: state.present.page, open: state.present.browserVisibility});
};

export default connect(mapStateToProps)(DocumentViewer);


//Give a page title, find the type of the page
export function getPageType(pageTitle){
	if(typeof pageTitle != "string"){
		console.error("getPageType() pageTitle should be a string. It was: ", typeof pageTitle, pageTitle);
		throw "getPageType() pageTitle should be a string.";
	}
	
	if(pageTitle.includes("GenericSearch:")){
		return "Pattern Content";
	}
	if(pageTitle.includes("Special:")){
		return "Special";
	}
	if(Patterns.find(pattern => pattern.Title == pageTitle) != null){
		return "Pattern";
	}
	if(Games.find(game => game.name == pageTitle) != null){
		return "Game";
	}
	
	//pattern category names may contain this string, remove it before next tests, but not before
	pageTitle = pageTitle.replace('Category:', '');
	
	let patternCatSize = Patterns.filter(pattern => pattern.Categories.some(category => category == pageTitle)).length;
	let gameCatSize = Games.filter(game => game.categories.some(category => category == pageTitle)).length;
	if(patternCatSize > gameCatSize){
		return "Pattern Category";
	}
	if(patternCatSize < gameCatSize){
		return "Game Category";
	}
	if(patternCatSize == gameCatSize && patternCatSize > 1){
		return "Pattern Category";
	}
	return "Other";
}