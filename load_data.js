var Patterns;
var Games;
var GameCategories;


$( document ).ready(function() {
	loadPatterns().done(function() {
		loadGames().done(function() {
			//refreshGraph();
		});
	});
});

var filteredPatterns;
function refreshGraph(){
	filteredPatterns = gameCategoryFilter(Patterns, "Social Media Games");
	filteredPatterns = userFilter(filteredPatterns);
	resetGraph();
	generateGraph({
		nodes: createNodesObject(filteredPatterns),
		links: createLinksObject(filteredPatterns)
	});
}

function loadPatterns(){
	var request = $.ajax({
		url: "AllPatterns.json",
		dataType: "json"
	});
	request.done(function(data) {
		Patterns = data;
	});
	return request;
}

function loadGames(){
	var request = $.ajax({
		url: "AllGames.json",
		dataType: "json"
	});
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

function gameCategoryFilter(inputPatterns, inputGameSubcategory){
	var gamesOfCategory = Games.filter(game => game.categories.includes(inputGameSubcategory));
	console.log("Found " + gamesOfCategory.length + " games in the category " + inputGameSubcategory);
	outputPatterns = inputPatterns.filter(pattern => pattern.PatternsLinks.some(pLink => gamesOfCategory.some(game => game.name == pLink.To)));
	return outputPatterns;
}

function userFilter(inputPatterns){
	var outputPatterns = inputPatterns; //outputPatterns is the list of patterns we will be operating on the most
	var filtersValues = getFilters(); //gets the current filters from the GUI
	console.log("_________FILTERS_________");
	filtersValues.forEach(function(filter){
		switch(filter.Type){
			case "game_category":
				outputPatterns = gameCategoryFilter(outputPatterns, filter.Value);
				console.log("Filtering output to only pages which link to games in the subcategory: " + filter.Value);
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
					source: pLink.From,
					target: pLink.To,
					value: 1
				});
			}
		});
	});	
	return linksObject;
}