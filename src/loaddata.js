import $ from 'jquery';

var Patterns, Games, PatternCategories, GameCategories;

export {Patterns, Games, PatternCategories, GameCategories, getAllData};

var CurrentLoadingFile = 0;
var CurrentFileLoadPercentage;

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

function getAllData(){
	return new Promise((resolve, reject) => {
		Promise.all([loadPatterns(), loadGames()]).then(function() {
			createGameToPatternRelations();
			createPatternToGameRelation();
			fixCanInstantiatepLinks();
			resolve("done");
		});
	});
}

//Function for dynamically creating an array of Pattern categories
function createPatternCategories(){
	PatternCategories = new Set();
	Patterns.map(pattern => pattern.Categories).flat().forEach(function(subcategory){
		PatternCategories.add(subcategory);
	});
	PatternCategories = Array.from(PatternCategories);
}

//Loads and transforms the patterns from the json format
function loadPatterns(){
	var request = loadViaAjax("AllPatterns.json");
	request.done(function(data) {
		Patterns = data;
		createPatternCategories();
	});
	return request;
}

//Function for dynamically creating an array of Game categories
function createGameCategories(){
	GameCategories = new Set();
	Games.map(game => game.categories).flat().forEach(function(subcategory){
		GameCategories.add(subcategory);
	});
	GameCategories = Array.from(GameCategories); //turn the set into an array
}

//Function for dynamically creating adding a category to all games called "Game"
function createGameCategoryAll(){
	Games.forEach(game => game.categories.push("Games"));
	GameCategories.push("Games");
}

//Loads and transforms the Games from the json format
function loadGames(){
	var request = loadViaAjax("AllGames.json");
	request.done(function(data) {
		Games = data;
		createGameCategories();
		createGameCategoryAll();
	});
	return request;
}


//Adds members to the game array of associated patterns
function createGameToPatternRelations(){
	Games.forEach(function(game){
		game.LinkedPatterns = Patterns.filter(pattern => pattern.PatternsLinks.some(pLink => pLink.To == game.name))
	});
}

function createPatternToGameRelation(){	
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

//fixes "Can Instantiate With ..." relations to also have "Can Instantiate"
function fixCanInstantiatepLinks(){
	Patterns.forEach(function(pattern){
		pattern.PatternsLinks.forEach(function(pLink){
			if(pLink.Type && pLink.Type.find(type => type.startsWith("Can Instantiate with"))){ 
				pLink.Type.push("Can Instantiate");
			}
		});
	});
}