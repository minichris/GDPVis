var Patterns;
var Games;
var PatternCategories;
var GameCategories;

$( document ).ready(function() {
	var requiredDataLoadedPromise = Promise.all([loadPatterns(), loadGames()]);

	requiredDataLoadedPromise.then(function() {
		bindFilters();
		applyFilters();

		$("#Search").show();
		$("#Graph").show();
		$("#LoadingAjax").hide();
	});
});

function refreshGraph(filteredPatterns){
	resetGraph();
	generateGraph({
		nodes: createNodesObject(filteredPatterns),
		links: createLinksObject(filteredPatterns)
	});
	setWindowHistory(Filters);
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

function patternCategoryFilter(inputPatterns, inputPatternSubcategory){ //filters a list of patterns to only ones that are found in a pattern subcategory
	var outputPatterns = inputPatterns.filter(pattern => pattern.Categories.some(category => category == inputPatternSubcategory));
	return outputPatterns;
}

function gameCategoryFilter(inputPatterns, inputGameSubcategory){ //filters a list of patterns to only ones that link to games found in a game subcategory
	var gamesOfCategory = Games.filter(game => game.categories.includes(inputGameSubcategory));
	var outputPatterns = inputPatterns.filter(pattern => pattern.PatternsLinks.some(pLink => gamesOfCategory.some(game => game.name == pLink.To)));
	return outputPatterns;
}

function gameFilter(inputPatterns, inputGame){ //filters a list of patterns to only ones that link to a specific game
	var outputPatterns = inputPatterns.filter(pattern => pattern.PatternsLinks.some(pLink => pLink.To == inputGame));
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
				outputPatterns = gameFilter(outputPatterns, filter.Value);
				console.log("Filtering output to only patterns which link to the game: " + filter.Value);
				break;
			case "count":
				outputPatterns = outputPatterns.slice(0, filter.Value);
				console.log("Filtering output to a count of: " + filter.Value);
				break;
		}
	});
	console.log("_________________________");
	return outputPatterns;
}

function createNodesObject(patterns){
	function getGroup(){
		return Math.floor(Math.random() * 6) + 1;
	}

	var nodesObject = [];  //array to store the output of the function
	patterns.forEach(function(pattern){
		nodesObject.push({
			id: pattern.Title,
			group: getGroup()
		});
	});

	return nodesObject;
}

function createLinksObject(patterns){
	var linksObject = []; //array to store the output of the function
	var includedPatternNames = patterns.map(pattern => pattern.Title); //all included pattern's names
	patterns.forEach(function(pattern){
		pattern["PatternsLinks"].forEach(function(pLink){
			if(includedPatternNames.includes(pLink.To)){ //if the link is to a pattern that is included
				linksObject.push({ //create the array member
					source: pattern.Title,
					target: pLink.To,
					value: 1
				});
			}
		});
	});
	return linksObject;
}


//-------------------------------------------------------------------------
//The following section controls the saving and loading filters from the URL
//-------------------------------------------------------------------------
var Filters;
var urlParams = new URLSearchParams( new URL(window.location).search);
if(urlParams.has('filters')) { //if the url has filters in the GET request
	Filters = JSON.parse(atob(urlParams.get('filters'))); //parse the filters
}
else {
	Filters = [{Type: "game", Value: "World of Warcraft"}, {Type: "pattern_category", Value: "Negative Patterns"}]; //set example filters
}

function setWindowHistory(filters){
	let encoded = btoa(JSON.stringify(filters));
	//encoded = [];
	//filters.forEach((filter, index) => encoded.push(index + "=" + filter.Type + "," + filter.Value));
	//encoded.join('&');
	//window.history.pushState('VGTropes', 'VGTropes', '?' + encoded);
	window.history.pushState('VGTropes', 'VGTropes', '?filters=' + encoded);
}
