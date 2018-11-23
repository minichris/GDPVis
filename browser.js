//function for creating a document browser
class DocumentViewer extends React.Component{
    constructor(props) {
        super(props);
        this.state = {
            title: null
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

    render() {
        var game = Games.find(game => game.name == this.props.title);
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
