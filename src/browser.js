import $ from 'jquery';
import React from "react";
import ReactDOM from "react-dom";
import {Patterns, Games, PatternCategories, GameCategories} from './loaddata.js';
import {performFiltering, generateReleventFilters, pageFilter, checkPatternCurrentlyFiltered} from './oldfilters.js';
import {setWindowHistory} from './saving.js';

//-------------------------------------------------------------------------
//The following section contains the Browser react components
//-------------------------------------------------------------------------
let openSize = "65%"; //sets the default open size

export class DocumentViewer extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            title: "Special:VGTropes",
            prevtitle: "Special:VGTropes"
        };
		this.internalPageRef = React.createRef();
    }
	
    componentDidUpdate(){
		function documentViewerLinkClickEventHandler(linkElement){
			if(linkElement.attributes['title']){ //if the title isn't undefined
				var linkClickedTitle = linkElement.attributes['title'].value;
				//get some new Filters based on the selected link and update the filter list
				Filters = generateReleventFilters(linkClickedTitle);
				global.refreshGraph(performFiltering());

				//check if the link click was a pattern that would result in a pattern in the node-link diagram being selected
				if(checkPatternCurrentlyFiltered(linkClickedTitle)){
					ChangePatternSelection(linkClickedTitle); //select the pattern
				}
				else{
					//handle the document viewer
					global.docViewerComponent.setState({title: linkClickedTitle});
					//graphSelectBoxComponent.setState({filters: Filters, value: null});
				}
				//updateFiltersGUI();
			}
		}
		
		let scrollableElement = document.querySelector(".insertedPage");
        if(scrollableElement){
			scrollableElement.scrollTop = 0; //scroll the inner back to the top on page change
		}
		var elements = document.getElementsByTagName('a');
		for(var i = 0, len = elements.length; i < len; i++) {
			if(elements[i].host == "virt10.itu.chalmers.se"){
				elements[i].setAttribute("data-originallink", elements[i].attributes["href"]);
				elements[i].setAttribute("href", "javascript:;");
				
				
				elements[i].onclick = function () {
					documentViewerLinkClickEventHandler(this);
				}				
			}
		}
    	/*$(".insertedPage").find("a[href]").click(function(e){
    		this.DocumentViewerEventHandler(e);
    	});*/
        setWindowHistory(global.docViewerComponent.state.title);
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

class DocumentResizer extends React.Component{
	constructor(props){
		super(props);
	}
	
	initResize(e) {
		function disableSelect(event) {
			event.preventDefault();
		}

		function Resize(e) {
			let newOpenWidth = Math.max((window.innerWidth - e.clientX), 330) + 'px';
			openSize = newOpenWidth;
			document.getElementById("DocumentViewer").style.width = newOpenWidth;
		}

		function stopResize(e) {
			window.removeEventListener('mousemove', Resize, false);
			window.removeEventListener('mouseup', stopResize, false);
			window.removeEventListener('selectstart', disableSelect);
			document.getElementById("DocumentViewer").style.transition = null;
			global.graphComponent.state.tooltipEventsEnabled = true;
		}
		
		window.addEventListener('mousemove', Resize, false);
		window.addEventListener('mouseup', stopResize, false);
		window.addEventListener('selectstart', disableSelect);
		
		document.getElementById("DocumentViewer").style.transition = "none";
		global.graphComponent.state.tooltipEventsEnabled = false;
	}
	
	
	render(){
		return(
			<div onMouseDown={this.initResize.bind()} id="DocumentResizer"></div>
		);
	}
}

class DocumentViewerTableOfContents extends React.Component{
	componentDidMount(){
		document.getElementById("TableOfContents").style.display = "none";
	}
	
	componentDidUpdate(prevProps) { //this has to be done in here because it works from what is put into the other component
		$("#TableOfContents").empty();
		$("#DocumentContainer").find(":header").each(function(i, heading){
			let marginSize = (heading.tagName.replace('H','') - 1);
			$("#TableOfContents").append("<div style='margin-left: " + marginSize + "rem'>" + heading.innerText + "</div>");
		});
		$("#TableOfContents > div").click(function(event){
			console.log(event.target.innerHTML);
			$("#DocumentContainer").find(":header").each(function(i, heading){
				console.log(heading);
				if(heading.innerText == event.target.innerHTML){
					heading.scrollIntoView();
				}
			});
		});
	}
	
	render(){
		return(
			<div style={{display: "none"}} id="TableOfContents"></div>
		);
	}
}

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

export class DocumentViewerToolbar extends React.Component{
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
	
	shouldShowToCToggleButton(pageTitle){
		if(getPageType(pageTitle) == "Special"){
			return false;
		}
		else{
			return true;
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
	
	render(){
		return (
			<div id="DocumentViewerToolbar">
				<button onClick={this.tocToggleButtonClick.bind(this)} disabled={!this.shouldShowToCToggleButton(this.props.pageTitle)} title="Toggle Table of Contents Pane" id="TocToggleButton" className="btn btn-light">ToC</button>
				<div id="ExternalLinkGroup">
					<button onClick={this.originalPageButtonClick.bind(this)} disabled={!getOrginalPageLocation(this.props.pageTitle)} title="Visit original article" id="OriginalPageButton" className="btn btn-light"><img src="icons/Original.png" /></button>
					<button onClick={this.editPageButtonClick.bind(this)} disabled={!getEditPageLocation(this.props.pageTitle)} title="Edit original article" id="EditPageButton" className="btn btn-light"><img src="icons/Edit.png" /></button>
					<button onClick={this.discussionPageButtonClick.bind(this)} disabled={!getDiscussionPageLocation(this.props.pageTitle)} title="Visit discussion page" id="DiscussionPageButton" className="btn btn-light"><img src="icons/Discussion.png" /></button>
					<button onClick={this.historyPageButtonClick.bind(this)} disabled={!getHistoryPageLocation(this.props.pageTitle)} title="Visit history page" id="HistoryPageButton" className="btn btn-light"><img src="icons/Original.png" /></button>
				</div>
			</div>
		);
	}
}

//Give a page title, find the type of the page
export function getPageType(pageTitle){
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
	if(PatternCategories.find(cat => cat == pageTitle) != null){
		return "Pattern Category";
	}
	if(GameCategories.find(cat => cat == pageTitle) != null){
		return "Game Category";
	}
	return "Other";
}

export function DisplayDocumentViewer(show){
	if(show){
		document.getElementById("DocumentViewer").style.display = "flex";
		document.getElementById("DocumentViewer").style.width = openSize;
		document.getElementById("DocumentViewer").style.minWidth = null;
		document.getElementById("DocumentViewer").style.padding = "10px 10px 10px 0px"
		document.getElementById("DocumentViewer").style.borderWidth = "2px 2px 2px 0px";
	}
	else{
		document.getElementById("DocumentViewer").style.width = "0"
		document.getElementById("DocumentViewer").style.minWidth = "0"
		document.getElementById("DocumentViewer").style.padding = "0px"
		document.getElementById("DocumentViewer").style.borderWidth = "0px"
		setTimeout(function(){
			document.getElementById("DocumentViewer").style.display = "none";			
		}, 500);
	}
}

class CategoryPage extends React.Component{
    render(){
        let categoryTitle = this.props.title;
        let pageTitlesInCategory = []; //generic array to hold all the page titles
        //we KNOW it has to be one of the two types of category page
        switch(getPageType(categoryTitle)){
            case "Pattern Category":
                pageTitlesInCategory = patternCategoryFilter(Patterns, categoryTitle).map(pattern => pattern.Title);
                break;
            case "Game Category":
                pageTitlesInCategory = Games.filter(game => game.categories.some(cat => cat == categoryTitle)).map(game => game.name);
                break;
        }
        return(
            <div className="insertedPage CategoryPage">
                <h1>{categoryTitle}</h1>
                <div id="CatListBox">
                {pageTitlesInCategory.map((title, i) =>
                    <a key={i} title={title} href={'http://virt10.itu.chalmers.se/index.php/' + title.replace(' ', '_')}>{title}</a>
                )}
                </div>
            </div>
        );
    }
}

class GamePage extends React.Component {
    getPatternLink(title){
        return ('http://virt10.itu.chalmers.se/index.php/' + title.replace(' ', '_'));
    }

    getPatternsReasons(game){
        var gamePatterns = pageFilter(Patterns, game.name);
        var releventParagraphs = [];
        gamePatterns.forEach(function(pattern){
            let parser = new DOMParser();
            let xmlObject = parser.parseFromString(pattern.Content, "text/xml");
            $(xmlObject).find("#mw-content-text").find("p").each(function(){
                if($(this).text().includes(game.name)){
                    releventParagraphs.push({
                        pattern: pattern.Title,
                        reason: "Reasoning: " + $(this).text().replace(game.name, '<b>' + game.name + '</b>')
                    });
                }
            });
        });
        return releventParagraphs;
    }

    render() {
        var game = Games.find(game => game.name == this.props.title);
        var gamePatternsWithReasons = this.getPatternsReasons(game);

        return(
            <div className="insertedPage GamePage">
                <h1>{game.name}</h1>
                <h2>About</h2>
                <p>[insert info here]</p>
                <h2>Gameplay Patterns Used</h2>
                <i>Note: this section is automatically generated from parts of pattern pages on the wiki. It can contain examples which aren't relevent to this game. Read with caution.</i>
                {gamePatternsWithReasons.map((patternreason, i) =>
                    <div key={i}>
                        <h3>{patternreason.pattern}</h3>
                        <p dangerouslySetInnerHTML={{__html: patternreason.reason}}></p>
                        <a title={patternreason.pattern} href={this.getPatternLink(patternreason.pattern)}>Continue reading about "{patternreason.pattern}"...</a>
                    </div>
                )}
            </div>
        );
    }
}

class PatternPage extends React.Component {
    render(){
        let pattern = Patterns.find(pat => pat.Title == this.props.title);
        console.log("Generating page for the following pattern object:");
        console.log(pattern);
        if(pattern != null){ //if the pattern is valid
            return(
                <div className="insertedPage PatternPage" dangerouslySetInnerHTML={{__html: pattern.Content}}></div>
            );
        }
        else{
            return(
                <div className="insertedPage PatternPage">
                    <h1>Error :(</h1>
                    <p>There was an error getting this pattern page.
                    If you know this page exists on the Gameplay Design Pattern Wiki, please report this to an administrator.</p>
                </div>
            );
        }
    }
}

class SpecialPage extends React.Component {
    render(){
        if(this.props.title == "Special:VGTropes"){ //if this is the starting page
            return(
                <div className="insertedPage SpecialPage">
                    <h1>Welcome to VGTropes</h1>
                    <p>
                    VGTropes is a visualization tool built on top of the GameDesignPatterns.org wiki.
                    It can help you browse the collection of patterns, analysis games, contribute to the wiki, and much more.
                    To get started, why not try looking at the <a href="javascript:void(0)" title="Category:Patterns">Patterns category</a> for some inspiration,
                    or try filtering the patterns shown by clicking the "Filters" button in the graph view, or just clicking a node in the graph.
                    </p>
                    <h2>Features</h2>
        			<ul>
        				<li>Clicking on a node will change the currently viewed article.</li>
        				<li>Hovering over a node will show its name.</li>
        				<li>The graph can be zoomed using the mouse wheel and can be panned by clicking and dragging the background.</li>
        				<li>The nodes can be tugged about by click-dragging a node.</li>
        				<li>Clicking the "Filters" button will display the currently enabled Filters.</li>
        				<li>In the Filters menu, the Filters are appiled in order, top to bottom. There is currently no way to do "OR" logic.</li>
        				<li>The Filters only update when you press "Apply Filters".</li>
        				<li>Not applying enough filtering will cause a message to come up warning you that you are trying to display too many nodes. It is highly recomended you heed this warning.</li>
                        <li>The visualization starts with example Filters which only show <b>patterns found in the game <i>"World of Warcraft"</i></b> and <b>patterns in the <i>Negative Patterns</i> category</b>.</li>
                        <li>Hovering over the links between nodes shows a tooltip which explains the context of the link from the articles and any "relations" the articles have.</li>
                        <li>The current Filters (but not the current page) are saved to the URL. Copy / bookmark the url to save your Filters.</li>
                        <li>Game and Category pages are generated in-browser.</li>
        			</ul>
        			<h2>Planned</h2>
        			<ul>
        				<li>Currently, the nodes on the graph have random colours and links have random strengths. At some point these will be given meaning.</li>
                        <li>The currently appiled Filters should be shown at the bottom of the graph in a human readable format.</li>
                        <li>NOT gates, OR gates and multi-selects should be added to filtering.</li>
                        <li>Clicking on nodes should "magnetise" connected nodes around it.</li>
                        <li>A "Creator mode".</li>
                        <li>Make zoom configurable to not zoom, but to weaken gravity.</li>
                        <li>Display the amount of currently loaded Patterns and Links somewhere.</li>
        				<li>Working title!</li>
        			</ul>
                </div>
            );
        }
        else{
            return(
                <OtherPage title={this.props.title} prevtitle={this.props.prevtitle}/>
            );
        }
    }
}

class OtherPage extends React.Component{
    constructor(props) {
        super(props);
        this.handleGoToPrevPage = this.handleGoToPrevPage.bind(this);
    }

    handleGoToPrevPage(e){
        e.preventDefault();
        global.docViewerComponent.setState({title: this.props.prevtitle});
    }

    render(){
        let url = "http://virt10.itu.chalmers.se/index.php/" + this.props.title.replace(' ', '_');
        return(
            <div className="insertediframe">
                <iframe src={url}></iframe>
                <a id="iframebacktext" onClick={this.handleGoToPrevPage} href="javascript:void(0)">While browsing in an iframe, the pattern graph <b>will not</b> update. Click here to return to the last none iframe article you visited...</a>
            </div>
        );
    }
}
