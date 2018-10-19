var Patterns;
var Games;

var newNodes;

$( document ).ready(function() {
	loadPatterns().done(function() {
		loadGames().done(function() {
			var filteredPatterns = everythingFilter();
			generateGraph({
				nodes: createNodesObject(filteredPatterns),
				links: createLinksObject(filteredPatterns)
			});
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

function everythingFilter(){
	var SocialMediaGames = Games.filter(game => game.categories.includes("Social Media Games"));
	SocialMediaGamePatterns = Patterns.filter(pattern => pattern.PatternsLinks.some(pLink => SocialMediaGames.some(game => game.name == pLink.To)));
	console.log(SocialMediaGamePatterns);
	return SocialMediaGamePatterns;
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