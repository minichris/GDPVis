import $ from 'jquery';
import React from "react";
import ReactDOM from "react-dom";
import {Patterns, Games, PatternCategories, GameCategories} from '../loaddata.js';
import {ChangePatternSelection} from '../graph.js';
import {setWindowHistory} from '../index.js';

import DocumentViewerToolbar from './components/DocumentViewerToolbar.js';
import DocumentViewerTableOfContents from './components/DocumentViewerTableOfContents.js';
import DocumentResizer from './components/DocumentResizer.js';

import GamePage from './pagetypes/GamePage.js';
import PatternPage from './pagetypes/PatternPage.js';
import CategoryPage from './pagetypes/CategoryPage.js';
import SpecialPage from './pagetypes/SpecialPage.js';

//-------------------------------------------------------------------------
//The following section contains the Browser react components
//-------------------------------------------------------------------------

global.documentViewerOpenSize = "65%";

export class DocumentViewer extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            title: null,
            prevtitle: "Special:UnreachablePage"
        };
		this.internalPageRef = React.createRef();
		
		this.displayDocumentViewer = function(show){
			if(show){
				document.getElementById("DocumentViewer").style.display = "flex";
				document.getElementById("DocumentViewer").style.width = global.documentViewerOpenSize;
				document.getElementById("DocumentViewer").style.minWidth = null;
				document.getElementById("DocumentViewer").style.padding = "10px 10px 10px 0px"
				document.getElementById("DocumentViewer").style.borderWidth = "2px 2px 2px 0px";
				
				let scrollableElement = document.querySelector("#DocumentContainer");
				if(scrollableElement){
					scrollableElement.scrollTop = 0; //scroll the inner back to the top on page change
				}
				$( "#ShowFiltersButton" ).ready(function() {
					$("#ShowFiltersButton").hide();
				});
			}
			else{
				document.getElementById("DocumentViewer").style.width = "0"
				document.getElementById("DocumentViewer").style.minWidth = "0"
				document.getElementById("DocumentViewer").style.padding = "0px"
				document.getElementById("DocumentViewer").style.borderWidth = "0px"
				setTimeout(function(){
					document.getElementById("DocumentViewer").style.display = "none";			
				}, 500);
				$("#ShowFiltersButton").show();
			}
		}
    }
	
    componentDidUpdate(){		
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
				elements[i].onclick = function (event) {
					if(event.target.attributes['title']){
						eventLinkClicked(event.target.attributes['title'].value);
					}
				}
			}
		}
		console.log("Detected broken links: ",brokenLinks);
		
		function eventLinkClicked(linkClickedTitle, forceUpdateFilters = false){
			if(linkClickedTitle){ //if the title isn't undefined

				//if the pattern isn't in the graph, or we are force updating the graph
				if(!global.isPatternCurrentlyFiltered(linkClickedTitle) || forceUpdateFilters){
					global.updateReteFiltersFromQuery(linkClickedTitle);
				}
				else{ //if it was in the graph and we aren't force updating the graph
					ChangePatternSelection(linkClickedTitle); //select the pattern
					global.docViewerComponent.setState({title: linkClickedTitle});
					setWindowHistory(false);
				}
			}
		}
		
		if( $("#HeadingFilterText").length == 0 ){	
			let headingText = $(".firstHeading").text();
			$(".firstHeading").after( '<p id="HeadingFilterText">Filter to only patterns relating to ' + headingText + '...</p>' );
			
			//setting up page links for in browser linking
			$("#HeadingFilterText, .selflink").wrap( "<a href='javascript:;'></a>" ).click(function(event){
				eventLinkClicked(headingText, true);
			});
		}	
    }
	
	shouldComponentUpdate(nextProps, nextState){
		return nextState.title != this.state.title;
	}

    getSnapshotBeforeUpdate(prevProps, prevState) {
        if(prevState.title != this.state.prevtitle){
            this.state.prevtitle = prevState.title;
        }
        return null;
    }
	
    render(){
        let pageTitle = this.state.title;
        if(pageTitle == null){
            return(<div><h1>Error</h1><p>Null browser set up</p></div>);
        }
        console.log("Creating a document viewer for page '" + pageTitle + "', it is of type: " + getPageType(pageTitle) + ". prevtitle: " + this.state.prevtitle);
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
                pageToRender = <SpecialPage ref={this.internalPageRef} title={pageTitle} prevtitle={this.state.prevtitle}/>;
                break;
            default:
                pageToRender = (
					<div ref={this.internalPageRef}>
						<span>Debug page, Title {this.state.title}, prevTitle {this.state.prevtitle}</span>
					</div>
                );
                break;
        }

        return(
			<>
				<div id="DocumentContainer">
					<DocumentViewerTableOfContents internalPage={this.internalPageRef} />
					<div id ="InsertedPageOuter">
						<DocumentResizer Parent={this} />
						{pageToRender}
					</div>
				</div>
				<DocumentViewerToolbar pageTitle={this.state.title} />
			</>
		);
    }
}


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