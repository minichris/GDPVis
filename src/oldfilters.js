import {Patterns, Games, PatternCategories, GameCategories} from './loaddata.js';
import {getPageType} from './browser.js';
//------------------------------------------
//OLD FILTERS FUNCTIONS FOR THE OLD FILTERING SYSTEM
//------------------------------------------

//filters a list of patterns to only ones that are found in a pattern subcategory
function patternCategoryFilter(inputPatterns, inputPatternSubcategory){
	var outputPatterns = inputPatterns.filter(pattern => pattern.Categories.some(category => category == inputPatternSubcategory));
	return outputPatterns;
}

//filters a list of patterns to only ones that link to games found in a game subcategory
function gameCategoryFilter(inputPatterns, inputGameSubcategory){ 
	var gamesOfCategory = Games.filter(game => game.categories.includes(inputGameSubcategory));
	var outputPatterns = inputPatterns.filter(pattern => pattern.PatternsLinks.some(pLink => gamesOfCategory.some(game => game.name == pLink.To)));
	return outputPatterns;
}

//filters a list of patterns to only ones that link to a specific page (game or pattern), including that page
export function pageFilter(inputPatterns, inputPage){ 
	var outputPatterns = inputPatterns.filter(pattern => (pattern.PatternsLinks.some(pLink => pLink.To == inputPage)) || (pattern.Title == inputPage));
	return outputPatterns;
}

//filters a list of patterns to only ones that link to a specific page with a relation
function reverseRelationLookupFilter(inputPatterns, inputPage, relationString){
	var outputPatterns = inputPatterns.filter(pattern => (pattern.PatternsLinks.some(pLink => pLink.AssociatedRelations && pLink.To == inputPage && pLink.Type.some(relation => relation == relationString))));
	outputPatterns.push(Patterns.filter(pattern => pattern.Title == inputPage)[0]); //also include the original page
	return outputPatterns;
}

//filters a list of patterns to only ones that come FROM a pattern page
function patternsLinkedToByPattern(inputPatterns, inputPattern){
	var inputPatternObject = Patterns.filter(pattern => pattern.Title == inputPattern)[0];
	var outputPatterns = inputPatterns.filter(pattern => inputPatternObject.PatternsLinks.map(pLink => pLink.To).includes(pattern.Title));
	outputPatterns.push(inputPatternObject); //also include the original page
	return outputPatterns;
}

//Function to find if a pattern is in the list of currently filtered patterns
export function checkPatternCurrentlyFiltered(patternName){
	//get the currently filtered patterns
	var currentlyFilteredPatterns = performFiltering(global.Filters);
	//check if the page we are looking for is in the current patterns
	return (currentlyFilteredPatterns.find(fPattern => fPattern.Title == patternName) != null);
}

//Performs filtering on the global list of patterns with the global current filter setup
export function performFiltering(){
	let outputPatterns = Patterns; //outputPatterns is the list of patterns we will be operating on the most
	let filtersValues = global.Filters; //gets the current Filters from the GUI
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


//For a given page title, generates a relevent filter setup
export function generateReleventFilters(pageTitle){
	switch(getPageType(pageTitle)){
		case "Pattern":
			if(checkPatternCurrentlyFiltered(pageTitle)){ //if the pattern is currently visable
				return null; //just return the current Filters, unchanged
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
			return null; //just return the current Filters, unchanged
		break;
	}
}
