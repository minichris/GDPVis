import $ from 'jquery';

export var Patterns;
export var Games;
export var PatternCategories;
export var GameCategories;


var CurrentFileLoadPercentage;
var CurrentLoadingFile = 0;

//The common setup for loading JSON, including progress text system
function loadViaAjax(inputURL){
	function loadMessageUpdater(){
		$("#LoadingAjax > span").text("Currently loaded " + Math.floor(100 * CurrentFileLoadPercentage) + "% of file " + CurrentLoadingFile + "/2.");
	}
	
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

//Loads and transforms the patterns from the json format
export function loadPatterns(){
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


//Adds members to the game array of associated patterns
export function createGameToPatternRelations(){
	Games.forEach(function(game){
		game.LinkedPatterns = Patterns.filter(pattern => pattern.PatternsLinks.some(pLink => pLink.To == game.name))
	});
}

export function createPatternToGameRelation(){	
	Patterns.forEach(function(pattern){
		pattern.LinkedGames = [];
		pattern.PatternsLinks.forEach(function(pLink){
			let GameObject = Games.find(game => game.name == pLink.To);
			if(GameObject){
				pattern.LinkedGames.push(GameObject);
			}
		});
	});
}

//Loads and transforms the Games from the json format
export function loadGames(){
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