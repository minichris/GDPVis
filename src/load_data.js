var Patterns;
var Games;
var PatternCategories;
var GameCategories;
var docViewerComponent, toolTipComponent, seachBoxComponent, graphComponent, graphSelectBoxComponent, warningDialogComponent;

$( document ).ready(function() {
	var requiredDataLoadedPromise = Promise.all([loadPatterns(), loadGames()]);
	docViewerComponent = ReactDOM.render(<DocumentViewer />, document.getElementById("DocumentViewer"));
	graphComponent = ReactDOM.render(<Graph />, document.getElementById("Graph"));
	graphSelectBoxComponent = ReactDOM.render(<GraphSelectBox />, document.getElementById("Search"));
	warningDialogComponent = ReactDOM.render(<WarningDialog />, document.getElementById("WarningDialog"));
	requiredDataLoadedPromise.then(function() {
		loadFiltersorDefaults();
		bindFilters();
		applyFilters();
		$("#Search").show();
		$("#Graph").show();
		$("#LoadingAjax").hide();
		seachBoxComponent = ReactDOM.render(<SearchBox />, document.getElementById("SearchBoxOuter"));
		toolTipComponent = ReactDOM.render(<Tooltip />, document.getElementById("Tooltip"));
	});
});

function refreshGraph(filteredPatterns){
	graphComponent.setState({patterns: filteredPatterns});
	graphSelectBoxComponent.setState({patterns: filteredPatterns});
	setWindowHistory(docViewerComponent.state.title);
}

function loadMessageUpdater(){
	$("#LoadingAjax > span").text("Currently loaded " + Math.floor(100 * CurrentFileLoadPercentage) + "% of file " + CurrentLoadingFile + "/2.");
}

var CurrentFileLoadPercentage;
var CurrentLoadingFile = 0;

function loadViaAjax(inputURL){
	CurrentLoadingFile += 1; //increase the currently downloading file
	var request = $.ajax({
		url: inputURL,
		dataType: "json",
        xhr: function () {
			var xhr = new window.XMLHttpRequest();
			xhr.addEventListener("progress", function (evt) { //progress event
				if (evt.lengthComputable) {
					CurrentFileLoadPercentage = evt.loaded / evt.total; // load percentage
					loadMessageUpdater();
				}
			}, false);
			return xhr;
		}
	});
	return request;
}

function loadPatterns(){
	var request = loadViaAjax("AllPatterns.json");
	request.done(function(data) {
		Patterns = data;
		PatternCategories = new Set();
		Patterns.map(pattern => pattern.Categories).flat().forEach(function(subcategory){
			PatternCategories.add(subcategory);
		});
		PatternCategories = Array.from(PatternCategories);
	});
	return request;
}

function loadGames(){
	var request = loadViaAjax("AllGames.json");
	request.done(function(data) {
		Games = data;
		GameCategories = new Set();
		Games.map(game => game.categories).flat().forEach(function(subcategory){
			GameCategories.add(subcategory);
		});
		GameCategories = Array.from(GameCategories); //turn the set into an array
	});
	return request;
}

//Give a page title, find the type of the page
function getPageType(pageTitle){
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

function checkPatternCurrentlyFiltered(patternName){
	//get the currently filtered patterns
	var currentlyFilteredPatterns = performFiltering(Patterns);
	//check if the page we are looking for is in the current patterns
	return (currentlyFilteredPatterns.find(fPattern => fPattern.Title == patternName) != null);
}

function generateReleventFilters(pageTitle){
	switch(getPageType(pageTitle)){
		case "Pattern":
			if(checkPatternCurrentlyFiltered(pageTitle)){ //if the pattern is currently visable
				return Filters; //just return the current filters, unchanged
			}
			else{ //if the pattern isn't currently visable
				return([
					{Type: "pattern_linked", Value: pageTitle},
					{Type: "count", Value: 50}
				]);
			}
			break;
		case "Game":
			return([
				{Type: "game", Value: pageTitle},
				{Type: "count", Value: 50}
			]);
			break;
		case "Pattern Category":
			return([
				{Type: "pattern_category", Value: pageTitle.replace('Category:', '')},
				{Type: "count", Value: 50}
			]);
		break;
		case "Game Category":
			return([
				{Type: "game_category", Value: pageTitle.replace('Category:', '')},
				{Type: "count", Value: 50}
			]);
			break;
		case "Other":
		case "Special":
			return Filters; //just return the current filters, unchanged
		break;
	}
}

function getPatternData(patternName){
	return Patterns.find(pattern => pattern.Title == patternName);
}

function patternCategoryFilter(inputPatterns, inputPatternSubcategory){ //filters a list of patterns to only ones that are found in a pattern subcategory
	var outputPatterns = inputPatterns.filter(pattern => pattern.Categories.some(category => category == inputPatternSubcategory));
	return outputPatterns;
}

function gameCategoryFilter(inputPatterns, inputGameSubcategory){ //filters a list of patterns to only ones that link to games found in a game subcategory
	var gamesOfCategory = Games.filter(game => game.categories.includes(inputGameSubcategory));
	var outputPatterns = inputPatterns.filter(pattern => pattern.PatternsLinks.some(pLink => gamesOfCategory.some(game => game.name == pLink.To)));
	return outputPatterns;
}

function pageFilter(inputPatterns, inputPage){ //filters a list of patterns to only ones that link to a specific page (game or pattern), including that page
	var outputPatterns = inputPatterns.filter(pattern => (pattern.PatternsLinks.some(pLink => pLink.To == inputPage)) || (pattern.Title == inputPage));
	return outputPatterns;
}

function reverseRelationLookupFilter(inputPatterns, inputPage, relationString){ //filters a list of patterns to only ones that link to a specific page with a relation
	var outputPatterns = inputPatterns.filter(pattern => (pattern.PatternsLinks.some(pLink => pLink.To == inputPage && pLink.AssociatedRelations.some(relation => relation == relationString))));
	outputPatterns.push(Patterns.filter(pattern => pattern.Title == inputPage)[0]); //also include the original page
	return outputPatterns;
}

function patternsLinkedToByPattern(inputPatterns, inputPattern){ //filters a list of patterns to only ones that come FROM a pattern page
	var inputPatternObject = Patterns.filter(pattern => pattern.Title == inputPattern)[0];
	var outputPatterns = inputPatterns.filter(pattern => inputPatternObject.PatternsLinks.map(pLink => pLink.To).includes(pattern.Title));
	outputPatterns.push(inputPatternObject); //also include the original page
	return outputPatterns;
}

function performFiltering(inputPatterns){
	var outputPatterns = inputPatterns; //outputPatterns is the list of patterns we will be operating on the most
	var filtersValues = Filters; //gets the current filters from the GUI
	console.log("_________FILTERS_________");
	filtersValues.forEach(function(filter){
		switch(filter.Type){
			case "pattern_category":
				outputPatterns = patternCategoryFilter(outputPatterns, filter.Value);
				console.log("Filtering output to only patterns which are in the subcategory: " + filter.Value);
				break;
			case "game_category":
				outputPatterns = gameCategoryFilter(outputPatterns, filter.Value);
				console.log("Filtering output to only patterns which link to games in the subcategory: " + filter.Value);
				break;
			case "game":
				outputPatterns = pageFilter(outputPatterns, filter.Value);
				console.log("Filtering output to only patterns which link to the game: " + filter.Value);
				break;
			case "count":
				outputPatterns = outputPatterns.slice(0, filter.Value);
				console.log("Filtering output to a count of: " + filter.Value);
				break;
			case "pattern_linked":
				outputPatterns = pageFilter(outputPatterns, filter.Value);
				console.log("Filtering output to only patterns which link to the pattern: " + filter.Value);
				break;
			case "pattern_linked2":
				outputPatterns = patternsLinkedToByPattern(outputPatterns, filter.Value);
				console.log("Filtering output to only patterns which link from the pattern: " + filter.Value);
				break;
			case "conflicting":
				outputPatterns = reverseRelationLookupFilter(outputPatterns, filter.Value, "Potentially Conflicting With");
				console.log("Filtering output to only patterns which conflict with the pattern: " + filter.Value);
				break;
		}
	});
	console.log("_________________________");
	return outputPatterns;
}


//-------------------------------------------------------------------------
//The following section controls the saving and loading filters from the URL
//-------------------------------------------------------------------------
var Filters;
function loadFiltersorDefaults(){
	var urlParams = new URLSearchParams( new URL(window.location).search);
	if(urlParams.has('data')) { //if the url has filters in the GET request
		Filters = JSON.parse(atob(urlParams.get('data')))["filters"]; //parse the filters
		let pageToDisplay = JSON.parse(atob(urlParams.get('data')))["currentPage"];
		docViewerComponent.setState({title: pageToDisplay});
	}
	else {
		//set example filters
		Filters = [{Type: "game", Value: "World of Warcraft"},
		{Type: "pattern_category", Value: "Negative Patterns"}];
	}
}

function setWindowHistory(currentPage){
	let saveData = {
		filters: Filters, //current filters
		currentPage: currentPage //current browser page
	}
	let encoded = btoa(JSON.stringify(saveData));
	window.history.pushState('VGTropes', 'VGTropes', '?data=' + encoded);
}
