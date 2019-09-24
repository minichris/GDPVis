//-------------------------------------------------------------------------
//The following section controls the saving and loading Filters from the URL
//-------------------------------------------------------------------------

export class InternalHistory {
	constructor(){
		this.InternalHistory = [];
	}
	
	getState(){
		return(this.InternalHistory[this.InternalHistory.length - 1])
	}
	
	pushState(stateObject){
		this.InternalHistory.push(stateObject);
		const dataUrl = encodeJSONtoString(stateObject)
		window.history.replaceState('VGTropes', 'VGTropes', '?data=' + dataUrl);
		console.log("Pushed state to history", stateObject, this.InternalHistory);
	}
	
	replaceState(stateObject){
		this.InternalHistory[this.InternalHistory.length - 1] = stateObject;
		const dataUrl = encodeJSONtoString(stateObject)
		window.history.replaceState('VGTropes', 'VGTropes', '?data=' + dataUrl);
		console.log("Replaced state in history", stateObject, this.InternalHistory);
	}
	
	goBack(){
		this.InternalHistory.pop();
		const stateObject = this.InternalHistory[this.InternalHistory.length - 1];
		const dataUrl = encodeJSONtoString(stateObject);
		window.history.replaceState('VGTropes', 'VGTropes', '?data=' + dataUrl);
		console.log("Popped state in history", this.InternalHistory);
		return stateObject;
	}
	
}

export function getURLasJSON(){
	var urlParams = new URLSearchParams( new URL(window.location).search);
	if(urlParams.has('data')) { //if the url has Filters in the GET request
		return decodeJSONfromString(urlParams.get('data'));
	}
	else{
		return null;
	}
}


//FUNCTIONS FOR ENCODING / DECODING JSON
export function encodeJSONtoString(JSONData){
	return btoa(unescape(encodeURIComponent(JSON.stringify(JSONData))));
}

export function decodeJSONfromString(string){
	return JSON.parse(decodeURIComponent(escape(atob(string))));
}