//-------------------------------------------------------------------------
//The following section contains the Browser react components
//-------------------------------------------------------------------------
class DocumentViewer extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            title: "Special:VGTropes"
        };
    }

    componentDidMount(){
        $("#DocumentViewer").addClass("HasInsertedPage");
    }

    componentDidUpdate(){
        document.getElementById("DocumentViewer").scrollTop = 0;
    	$("#DocumentViewer").find("a[href]").click(function(e){
    		DocumentViewerEventHandler(e);
    	});
        setWindowHistory(docViewerComponent.state.title);
    }

    render(){
        let pageTitle = this.state.title;
        if(pageTitle == null){
            return(<div><h1>Error</h1><p>Null browser set up</p></div>);
        }
        console.log("Creating a document viewer for page '" + pageTitle + "', it is of type: " + getPageType(pageTitle));
        let pageToRender;
        switch(getPageType(pageTitle)){
            case "Pattern Category":
            case "Game Category":
                pageToRender = <CategoryPage title={pageTitle.replace('Category:', '')}/>;
                break;
            case "Game":
                pageToRender = <GamePage title={pageTitle}/>;
                break;
            case "Pattern":
                pageToRender = <PatternPage title={pageTitle}/>;
                break;
            case "Special":
                pageToRender = <SpecialPage title={pageTitle}/>;
                break;
        }
        return(pageToRender);
    }
}

//function for handling link clicks in the document browser
function DocumentViewerEventHandler(e){
	//prevent the link from acutally working
	e.stopPropagation();
	e.preventDefault();
	//get where the link was going to
	var linkClicked = e.target.attributes['title'].value;
    if(getPageType(linkClicked) == "Other"){ //if this is a special page
        window.open(e.target.attributes['href'].value, '_blank'); //open in a new tab
    }
    else{
    	//get some new filters based on the selected link and update the filter list
    	Filters = generateReleventFilters(linkClicked);
    	refreshGraph(performFiltering(Patterns));

    	//check if the link click was a pattern that would result in a pattern in the node-link diagram being selected
    	if(checkPatternCurrentlyFiltered(linkClicked)){
    		ChangePatternSelection(linkClicked); //select the pattern
    	}
        else{
            //handle the document viewer
            docViewerComponent.setState({title: linkClicked});
        }
        filterlistComponent.setState({filters: Filters});
    	filterlistComponent.forceUpdate();
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
                {pageTitlesInCategory.map((title) =>
                    <a key={title} title={title} href={'http://virt10.itu.chalmers.se/index.php/' + title.replace(' ', '_')}>{title}</a>
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
                {gamePatternsWithReasons.map((patternreason) =>
                    <div key={patternreason.pattern + "listObject"}>
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
        				<li>Clicking the "Filters" button will display the currently enabled filters.</li>
        				<li>In the filters menu, the filters are appiled in order, top to bottom. There is currently no way to do "OR" logic.</li>
        				<li>The filters only update when you press "Apply Filters".</li>
        				<li>Not applying enough filtering will cause a message to come up warning you that you are trying to display too many nodes. It is highly recomended you heed this warning.</li>
                        <li>The visualization starts with example filters which only show <b>patterns found in the game <i>"World of Warcraft"</i></b> and <b>patterns in the <i>Negative Patterns</i> category</b>.</li>
                        <li>Hovering over the links between nodes shows a tooltip which explains the context of the link from the articles and any "relations" the articles have.</li>
                        <li>The current filters (but not the current page) are saved to the URL. Copy / bookmark the url to save your filters.</li>
                        <li>Game and Category pages are generated in-browser.</li>
        			</ul>
        			<h2>Planned</h2>
        			<ul>
        				<li>Currently, the nodes on the graph have random colours and links have random strengths. At some point these will be given meaning.</li>
                        <li>The currently appiled filters should be shown at the bottom of the graph in a human readable format.</li>
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
                <div className="insertedPage SpecialPage">
                    <h1>Error: Not all special pages are supported, yet.</h1>
                </div>
            );
        }
    }
}
