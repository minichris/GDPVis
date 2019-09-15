import {Patterns, Games, PatternCategories, GameCategories} from './loaddata.js';
import {getPageType} from './browser.js';
//------------------------------------------
//OLD FILTERS FUNCTIONS FOR THE OLD FILTERING SYSTEM
//------------------------------------------

//filters a list of patterns to only ones that are found in a pattern subcategory
export function patternCategoryFilter(inputPatterns, inputPatternSubcategory){
	var outputPatterns = inputPatterns.filter(pattern => pattern.Categories.some(category => category == inputPatternSubcategory));
	return outputPatterns;
}

//filters a list of patterns to only ones that link to games found in a game subcategory
export function gameCategoryFilter(inputPatterns, inputGameSubcategory){ 
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
export function reverseRelationLookupFilter(inputPatterns, inputPage, relationString){
	var outputPatterns = inputPatterns.filter(pattern => (pattern.PatternsLinks.some(pLink => pLink.AssociatedRelations && pLink.To == inputPage && pLink.Type.some(relation => relation == relationString))));
	outputPatterns.push(Patterns.filter(pattern => pattern.Title == inputPage)[0]); //also include the original page
	return outputPatterns;
}

//filters a list of patterns to only ones that come FROM a pattern page
export function patternsLinkedToByPattern(inputPatterns, inputPattern){
	var inputPatternObject = Patterns.filter(pattern => pattern.Title == inputPattern)[0];
	var outputPatterns = inputPatterns.filter(pattern => inputPatternObject.PatternsLinks.map(pLink => pLink.To).includes(pattern.Title));
	outputPatterns.push(inputPatternObject); //also include the original page
	return outputPatterns;
}