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

$(function(){
	$("#Search").hide();
	$("#Graph").hide();
	$("#LoadingAjax").show();
});

function refreshGraph(filteredPatterns){
	resetGraph();
	generateGraph({
		nodes: createNodesObject(filteredPatterns),
		links: createLinksObject(filteredPatterns)
	});
	setWindowHistory(Filters);
}

function setWindowHistory(filters){
	let encoded = btoa(JSON.stringify(filters));
	//encoded = [];
	//filters.forEach((filter, index) => encoded.push(index + "=" + filter.Type + "," + filter.Value));
	//encoded.join('&');
	//window.history.pushState('VGTropes', 'VGTropes', '?' + encoded);
	window.history.pushState('VGTropes', 'VGTropes', '?filters=' + encoded);
}

function loadMessageUpdater(){
	$("#LoadingAjax > span").text("Currently loaded " + Math.floor(100 * CurrentFileLoadPercentage) + "% of file " + CurrentLoadingFile + "/3.");
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

function generatePatternLinkParagraphsFromPatterns(pattern1, pattern2){
	function getPatternLinksHTML(sourcePattern, targetPattern){
		return $(sourcePattern.Content).find("a[href]").filter(function(linkIndex, linkDOM){ //for each link
			var afterRelations = $(linkDOM).parent().prevAll("h2").find("#Relations").length == 0;
			var linksToTargetPattern = ($(linkDOM).text() == targetPattern.Title);
			return linksToTargetPattern && afterRelations;
		}).parent().html();
	}

	return(
		//get both possible sides of the relevent paragraphs, then remove any which are blank
		[getPatternLinksHTML(pattern1, pattern2), getPatternLinksHTML(pattern2, pattern1)].filter(function(para) { return para != null; })
	);
}

function generatePatternLinkParagraphs(){
	return new Promise(resolve => {
		CurrentLoadingFile += 1;
		function parsePattern(index){
			loadMessageUpdater();
			var pattern = Patterns[index];
			pattern.PatternsLinks.forEach(pLink => pLink.Paragraphs = []); //add a blank array to every pLink

			$(pattern.Content).find("a[href]").each(function(linkIndex, linkDOM){ //for each link
					var afterRelations = $(linkDOM).parent().prevAll("h2").find("#Relations").length == 0;
					if( afterRelations ){ //if it is after the relations section
						//Check if the pattern links contain a pLink that has the same "To" as the inner text of the current element
						var matchedPLinks = pattern.PatternsLinks.forEach(function(pLink){
						var surroundingDOM = $(linkDOM).parent();
						//if the link text equals the pLink "To" and the paragraphs don't already contain what we about to enter
						if($(linkDOM).text() == pLink.To && !pLink.Paragraphs.some(paragraph => paragraph == surroundingDOM.html())){
							pLink.Paragraphs.push(surroundingDOM.html());
						}
					});
				}
			CurrentFileLoadPercentage = index / Patterns.length;
			});
			if(index + 1 != Patterns.length){
				setTimeout(function(){ parsePattern(index + 1) }, 2); //give the browser time to keep the page running
			}
			else{
				resolve("Done generating pattern link paragraphs");
			}
		}
		parsePattern(0); //start the parsing
	});
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
