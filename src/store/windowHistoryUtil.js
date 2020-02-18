export function setWindowHistory(store){
	try {
		let saveData = {
			page: store.getState().present.page, //current browser page
			filters: store.getState().present.filters //current Filters
		}
		
		if(Object.keys(saveData.filters.nodes).length > 0){
			window.history.replaceState('GDPVis', 'GDPVis', '?data=' + encodeJSONtoString(saveData));
			console.info("Attempted to save to window history with data", saveData);
		}
		else{
			throw(new Error("Nodes length is not greater than 0"));
		}
	}
	catch(exception){
		console.warn("Failed at saving in setWindowHistory", exception);
	}
}

export function getURLasStoreData(defaultStoreData){
	var urlParams = new URLSearchParams( new URL(window.location).search);
	if(urlParams.has('data')) { //if the url has Filters in the GET request
		let data = decodeJSONfromString(urlParams.get('data'));
		return Object.assign({}, defaultStoreData, {
			page: data.page, 
			filters: data.filters
		});
	}
}

//FUNCTIONS FOR ENCODING / DECODING JSON
function encodeJSONtoString(JSONData){
	return btoa(unescape(encodeURIComponent(JSON.stringify(JSONData))));
}

function decodeJSONfromString(string){
	return JSON.parse(decodeURIComponent(escape(atob(string))));
}