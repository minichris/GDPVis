var Patterns;
var Games;

var newNodes;

$( document ).ready(function() {
	loadPatterns().done(function() {
		loadGames().done(function() {
			var filteredPatterns = everythingFilter();
			//newNodes = createNodesObject(filteredPatterns);
		});
	});
});

function loadPatterns(){
	console.log("Loading patterns!");
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
	console.log("Loading games!");
	var request = $.ajax({
		url: "AllGames.json",
		dataType: "json"
	});
	request.done(function(data) {
		Games = data;
	});
	return request;
}

var SocialMediaGames;
function everythingFilter(){
	SocialMediaGames = Games.filter(game => game.categories.includes("Social Media Games"));
	SocialMediaGamePatterns = Patterns.filter(pattern => pattern.PatternsLinks.some(pLink => SocialMediaGames.some(game => game.name == pLink.To)));
	console.log(SocialMediaGamePatterns);
	return SocialMediaGamePatterns;
}

//function createNodesObject(patterns){
//	return patterns.map(pattern => {id = pattern.Title, group = (Math.floor(Math.random() * 6) + 1)})
//}