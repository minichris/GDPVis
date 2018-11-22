//function for creating a document browser
function CreateDocumentViewer(pageTitle){
	$("#DocumentViewer").html('<div class="insertedPage"></div>');
	$("#DocumentViewer").addClass("HasInsertedPage");
    console.log("Creating a document viewer for page '" + pageTitle + "'");
    switch(getPageType(pageTitle)){
        case "Pattern Category":
        case "Game Category":
            console.log("Attempting to add a game category page to the document browser");
            ReactDOM.render(<GameCategoryPage category={pageTitle.replace('Category:', '')}/>, document.getElementById('DocumentViewer'));
            break;
        default:
        	$(".insertedPage").html(Patterns.find(pattern => pattern.Title == pageTitle).Content);
            break;
    }
	$("#DocumentViewer").scrollTop(0); //scroll it back to the top for the user
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

function GameCategoryPage(props){
    function getGamesInCategory(searchCategory){
        return Games.filter(game => game.categories.some(cat => cat == searchCategory));
    }
    let gamesNames =  getGamesInCategory(props.category).map(game => game.name);
    return(
        <div className="insertedPage"><h1>{props.category}</h1><ul>{gamesNames.map((gameName) => <li>{gameName}</li>)}</ul></div>
    );
}
