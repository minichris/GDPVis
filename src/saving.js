//-------------------------------------------------------------------------
//The following section controls the saving and loading Filters from the URL
//-------------------------------------------------------------------------

export function loadFiltersorDefaults(){
	var urlParams = new URLSearchParams( new URL(window.location).search);
	if(urlParams.has('data')) { //if the url has Filters in the GET request
		global.Filters = JSON.parse(atob(urlParams.get('data')))["filters"]; //parse the Filters
		let pageToDisplay = JSON.parse(atob(urlParams.get('data')))["currentPage"];
		docViewerComponent.setState({title: pageToDisplay});
	}
	else {
		//set example Filters
		global.Filters = [{Type: "game", Value: "World of Warcraft"},
		{Type: "pattern_category", Value: "Negative Patterns"}];
	}
	
	if(!global.Filters){ //if global filters somehow ended up null
		global.Filters = [];
	}
}

export function setWindowHistory(currentPage){
	let saveData = {
		filters: global.Filters, //current Filters
		currentPage: currentPage //current browser page
	}
	let encoded = btoa(JSON.stringify(saveData));
	window.history.pushState('VGTropes', 'VGTropes', '?data=' + encoded);
}
