//function for creating a document browser
function CreateDocumentViewer(pageTitle){
    ReactDOM.unmountComponentAtNode(document.getElementById('DocumentViewer'));
	$("#DocumentViewer").html('<div class="insertedPage"></div>');
	$("#DocumentViewer").addClass("HasInsertedPage");
    console.log("Creating a document viewer for page '" + pageTitle + "'");
    switch(getPageType(pageTitle)){
        case "Pattern Category":
        case "Game Category":
            console.log("Attempting to add a game category page to the document browser");
            ReactDOM.render(<CategoryPage category={pageTitle.replace('Category:', '')}/>, document.getElementById('DocumentViewer'));
            break;
        case "Game":
            ReactDOM.render(<GamePage game={pageTitle}/>, document.getElementById('DocumentViewer'));
        default:
        	$(".insertedPage").html(Patterns.find(pattern => pattern.Title == pageTitle).Content);
            break;
    }
	//$("#DocumentViewer").scrollTop(0); //scroll it back to the top for the user
	document.getElementById("DocumentViewer").scrollTop = 0;
	$("#DocumentViewer").find("a[href]").click(function(e){
		DocumentViewerEventHandler(e);
	});
}

//function for handling link clicks in the document browser
function DocumentViewerEventHandler(e){
	//prevent the link from acutally working
	e.stopPropagation();
	e.preventDefault();
	//get where the link was going to
	var linkClicked = e.target.attributes['title'].value;
	//get some new filters based on the selected link and update the filter list
	Filters = generateReleventFilters(linkClicked);
	refreshGraph(performFiltering(Patterns));

	//check if the link click was a pattern that would result in a pattern in the node-link diagram being selected
	if(checkPatternCurrentlyFiltered(linkClicked)){
		ChangePatternSelection(linkClicked); //select the pattern
	}
    else{
        //handle the document viewer
        CreateDocumentViewer(linkClicked);
    }
    filterlistComponent.setState({filters: Filters});
	filterlistComponent.forceUpdate();
}

function CategoryPage(props){
    let pageTitlesInCategory = []; //generic array to hold all the page titles
    //we KNOW it has to be one of the two types of category page
    switch(getPageType(props.category)){
        case "Pattern Category":
            pageTitlesInCategory = patternCategoryFilter(Patterns, props.category).map(pattern => pattern.Title);
            break;
        case "Game Category":
            pageTitlesInCategory = Games.filter(game => game.categories.some(cat => cat == props.category)).map(game => game.name);
            break;
    }
    return(
        <div className="insertedPage CategoryPage">
            <h1>{props.category}</h1>
            <ul>{pageTitlesInCategory.map((title) =>
                <li key={title}>
                    <a title={title} href={'http://virt10.itu.chalmers.se/index.php/' + title.replace(' ', '_')}>{title}</a>
                </li>)}
            </ul>
        </div>
    );
}

class GamePage extends React.Component  {
    componentDidMount() {
        $("#DocumentViewer").find("a[href]").click(function(e){
    		DocumentViewerEventHandler(e);
    	});
    }

    getPatternLink(title){
        return ('http://virt10.itu.chalmers.se/index.php/' + title.replace(' ', '_'));
    }

    render() {
        var game = Games.find(game => game.name == this.props.game);
        var gamePatterns = pageFilter(Patterns, game.name);

        return(
            <div className="insertedPage GamePage">
                <h1>{game.name}</h1>
                <h2>About</h2>
                <p>[insert info here]</p>
                <h2>Gameplay</h2>
                {gamePatterns.map((pattern) =>
                    <li key={pattern.Title}>
                        <a title={pattern.Title} href={this.getPatternLink(pattern.Title)}>{pattern.Title}</a>
                    </li>
                )}
            </div>
        );
    }
}
