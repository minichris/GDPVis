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
