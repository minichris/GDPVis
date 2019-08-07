/*
VISUAL BASED FILTERING RULES
Nodes only have exactly one output port.
Port to port connections are one to one.
Any port can connect to a wildcard type input port, but wildcard ports shouldn't be used as output ports.
*/

//This is where all the possible types of links will be stored for the entire visual filtering systemLanguage
var portTypes = [
	{Type: "Pattern Array", Color: "purple"},
	{Type: "Game Array", Color: "green"},
	{Type: "Wildcard Array", Color: "gray", WildcardType: true} //This type will accept a connection to any other type
]

//static method for getting portType object from portTypeName
function getPortType(portTypeName){
	return portTypes.find(type => type.Type == portTypeName);
}

var listTypes = [
	{Type: "Pattern Category", Content: function(){return PatternCategories}},
	{Type: "Game Category", Content: function(){return GameCategories}},
	{Type: "Game", Content: function(){return Games}},
	{Type: "Pattern", Content: function(){return Patterns}},
	{Type: "Relation Type", Content: function(){throw "not implemented yet"; return false;}},
	{Type: "Number", Content: function(){
		var list = [];
		for (var i = 0; i <= 99; i++) {
			list.push(i);
		}
		return list;
	}}
]

class List {
	constructor(name, type) {
		this.name = name; //Friendly name of the port
		this.type = type; //listType of the port
		this.selectedItem = null;
	}
	
	
	//shorthand for getting the possible selection of the list
	getItems(){
		return this.type.Content();
	}
	
	//validates the input before setting the selected item
	validatedSetItem(item){
		//if the array actually contains this item
		if(this.getItems().indexOf(item) > 0){
			this.selectedItem = item;
			return true;
		}
		else{
			throw "List doesn't contain item given to set to";
			return false;
		}
	}
}

class Port {
	constructor(name, type, facing, owner) {
		this.name = name; //Friendly name of the port
		this.initialType = type //portType to set this back to on disconnect, if connecting changed the type
		this.type = type; //portType of the port
		this.facing = facing; //The facing of the port, needed to find compatibilty
		this.owner = owner; //reference to filter which owns this port
		this.connectedPort = null; //reference to the port we are connected to
	}
	
	//if this is an input port, get the connected output port's data
	connectedPortData(){
		if(this.facing == "input"){
			if(this.connectedPort){
				return this.connectedPort.owner.getOutputData();
			}
			else{
				throw "can only get connected port data if one is connected";
				return false;
			}
		}
		else{
			throw "can only get the connected port data from an input port";
			return false;
		}
	}
	
	//tries to connect this port to a forign port. Returns bool on success / fail.
	connectPort(forignPort, force) {
		if((this.type == forignPort.type || forignPort.type.WildcardType || this.type.WildcardType) //if the ports types are compatible
		&& this.facing != forignPort.facing //if they are not facing the same direction
		){
			if(forignPort.connectedPort != null){ //if the forign port already has a connection
				if(force){ //if we are forcing our connection
					forignPort.disconnectPort(); //disconnect the forign port
				}
				else{
					throw "tried to connect to a port that already has a connection with no force";
					return false;
				}
			}
			//at this point the forign port will be unconnected from any other port
			//handle this side of the connection
			this.connectedPort = forignPort; //connect this port to the forign port
			this.owner.portConnectedEvent(this); //dispatch the connection event to our owning filter node
			//handle the forign side of the connection
			forignPort.connectedPort = this; //connect the forign port to this port
			forignPort.owner.portConnectedEvent(forignPort); //dispatch the connection event to the forign owning filter node
			return true;
		}
		else{
			if(!(this.facing != forignPort.facing)){
				throw "tried to connect ports which are facing the same direction.";
			}
			if(!(this.type == forignPort.type || forignPort.type.WildcardType || this.type.WildcardType)){
				throw "tried to connect ports that aren't wildcard ports of different types";
			}
			if(!(forignPort.connectedPort == null)){
				throw "tried to connect to a taken port";
			}
			return false;
		}
	}
	
	//disconnected this port from any forign ports
	disconnectPort(){
		let forignPort = this.connectedPort;
		if(forignPort != null){
			forignPort.connectedPort = null; //disconnect the forign side of the connection
			forignPort.owner.portDisconnectedEvent(forignPort); //call event
			this.connectedPort = null; //disconnect this side of the connection
			this.owner.portDisconnectedEvent(this); //call event
			return true;
		}
		else{
			throw "tried to disconnect an unconnected port.";
			return false;
		}
	}
	
	//gets an array of compatible nodes objects (spawned from their classes)
	getCompatibleNodes(){
		//get an array of all the node classes that currently exist, removing webkit keys that cause warnings in the browser
		let nodeClasses = Object.keys(window).filter(key => !key.match("webkit")).map(key => window[key]).filter(key => typeof key == "function").map(key => key.prototype).filter(key => key instanceof FilterNode);
		//run the classes constructors to make them generate their port setups.
		let nodeClassesAsObject = [];
		nodeClasses.forEach(nodeClass => nodeClassesAsObject.push(new nodeClass.constructor()));
		//filter the facing
		if(this.facing == "input"){
			//filter classes to those which have an output node
			nodeClassesAsObject = nodeClassesAsObject.filter(NodeClass => NodeClass.outputPort != null);
			if(!this.type.WildcardType){ //if this ports type isn't a wildcard and therefore needs to be checked
				//check for compatible outputs
				return nodeClassesAsObject.filter(NodeClass => NodeClass.outputNode.type == this.type || NodeClass.outputNode.type.type.WildcardType);
			}
			else{ //if it is a wildcard type, no type filtering needed
				return nodeClassesAsObject;
			}
		}
		if(this.facing == "output"){
			//filter classes to those that have an input node
			nodeClassesAsObject = nodeClassesAsObject.filter(NodeClass => NodeClass.inputPorts.length > 0);
			if(!this.type.WildcardType){ //if this ports type isn't a wildcard and therefore needs to be checked
				//check for compatible inputs
				return nodeClassesAsObject.filter(NodeClass => NodeClass.inputPorts.filter(port => port.type == this.type || port.type.WildcardType).length > 0);
			}
			else{ //if it is a wildcard type, no type filtering needed
				return nodeClassesAsObject;
			}
		}
		throw "an unknown error happened in getCompatibleNodes(), facing: "+this.facing+", type: "+this.type;
		return false;
	}
	
		
	//utility method for getting the most appropriate input to attach to
	getMatchingPort(forignFilterNode, connect, force){
		if(this.facing == "input"){
			if(this.type.WildcardType || forignFilterNode.outputPort.type.WildcardType){ //any output will do
				if(connect){
					this.connectPort(forignFilterNode.outputPort, force);
				}
				return forignFilterNode.outputPort;
			}
			if(forignFilterNode.outputPort.type == this.type){ //types match
				if(connect){
					this.connectPort(forignFilterNode.outputPort, force);
				}
				return forignFilterNode.outputPort;
			}
			return false; //failed to get matching port
		}
		if(this.facing == "output"){
			let bestPort = forignFilterNode.inputPorts.find(port => port.type == this.type);
			if(bestPort != null){
				if(connect){
					this.connectPort(bestPort, force);
				}
				return bestPort;
			}
			bestPort = forignFilterNode.inputPorts.find(port => port.type.WildcardType)
			if(bestPort != null){
				if(connect){
					this.connectPort(bestPort, force);
				}
				return bestPort;
			}
			if(this.type.WildcardType){
				if(connect){
					this.connectPort(forignFilterNode.inputPorts[0], force);
				}
				return forignFilterNode.inputPorts[0];
			}
			else{
				//no matching ports
				return false;
			}
		}
	}
}

class FilterNode {
    constructor() {
		this.inputPorts = []; //place to store an array of input ports
		this.inputLists = []; //place to store an array of input lists
		this.outputPort = null; //place to store the one and only output port
		this.canBeRemoved = true; //if the filter can be deleted from the graph by the user
		this.posX = 0; //the filters x position on the graph
		this.posY = 0; //the filters y position on the graph
    }
	
	toJSON(){
		return ({
			inputPorts: this.inputPorts,
			inputLists: this.inputLists,
			outputPort: this.outputPort,
			canBeRemoved: this.canBeRemoved,
			posX: this.posX,
			posY: this.posY,
			className: this.constructor.name
		})
	}
	
	//method called by ports when they are attached to other ports, can be overridden in base classes
	portConnectedEvent(port){
	}
	
	//method called by port when they are disconnected from other ports, can be ovridden in base classes
	portDisconnectedEvent(port){
		
	}
	
	//method called to get the output of this node, should be overridden in base classes
	getOutputData(){
		if(this.inputPorts.some(port => port.connectedPort == null)){
			return false;
		}
	}
	
	//method for properly setting the output ports of a filter, returns port on success
    setOutputPort(portTypeName, portTitle){
		//getting and checking the type of the port
		if(getPortType(portTypeName) == null){
			throw "Tried to add port with unknown portType.";
			return false;
		}
		//checking the name of the port doesn't already exist on this filter
		if(this.outputPort != null){
			throw "An output port already exists."
			return false;
		}
		else{ //Success
			this.outputPort = new Port(portTitle, getPortType(portTypeName), "output", this);
			return this.outputPort;
		}
	}

	//method for properly adding input ports to a filter, returns port on success
    addInputPort(portTypeName, portTitle){
		//getting and checking the type of the port
		if(getPortType(portTypeName) == null){
			throw "Tried to add port with unknown portType.";
			return false;
		}
		//checking the name of the port doesn't already exist on this filter
		if(this.inputPorts.filter(port => port.Name == portTitle).length > 0){
			throw "A port with the name given already exists."
			return false;
		}
		else{ //Success
			let newPort = new Port(portTitle, getPortType(portTypeName), "input", this);
			this.inputPorts.push(newPort);
			return newPort;
		}
	}
	
	//method for properly adding lists to a filter, returns list on success
	addInputList(listTypeName, listTitle){
		//getting and checking the type of the list
		if(listTypes.find(type => type.Type == listTypeName) == null){
			throw "Tried to add list with unknown portType.";
			return false;
		}
		//checking the name of the list doesn't already exist on this filter
		if(this.inputLists.filter(list => list.Name == listTitle).length > 0){
			throw "A list with the name given already exists."
			return false;
		}
		else{ //Success
			let newList = new List(listTitle, listTypes.find(type => type.Type == listTypeName));
			this.inputLists.push(newList);
			return newList;
		}
	}
}

//a filter node that just outputs all of the patterns in the system
class AllPatternsNode extends FilterNode{
	constructor(){
		super();
		this.setOutputPort("Pattern Array", "All Patterns");
		this.canBeRemoved = false; //prevent removal of allpatterns, allgames and output node
	}
	
	getOutputData(){
		super.getOutputData();
		return Patterns; //global patterns set in load_data.js
	}
}

//a filter node that just outputs all of the games in the system
class AllGamesNode extends FilterNode{
	constructor(){
		super();
		this.setOutputPort("Game Array", "All Games");
		this.canBeRemoved = false; //prevent removal of allpatterns, allgames and output node
	}
	
	getOutputData(){
		super.getOutputData();
		return Games; //global game set in load_data.js
	}
}

//a filter node that filters patterns by their pattern category
class PatternsByPatternCategoryNode extends FilterNode{
	constructor(){
		super();
		this.addInputPort("Pattern Array", "Patterns to Filter");
		this.addInputList("Pattern Category", "Pattern Category");
		this.setOutputPort("Pattern Array", "Output Patterns");
	}
	
	getOutputData(){
		super.getOutputData();
		let inputPatterns = this.inputPorts[0].connectedPortData();
		let inputCategory = this.inputPorts[0].selectedItem;
		return inputPatterns.filter(pattern => pattern.Categories.some(cate => cate == inputCategory));
	}
}

//a filter node that filters games by their game category
class GamesByGameCategoryNode extends FilterNode{
	constructor(){
		super();
		this.addInputPort("Game Array", "Games to Filter");
		this.addInputList("Game Category", "Game Category");
		this.setOutputPort("Game Array", "Output Games");
	}
	
	getOutputData(){
		super.getOutputData();
		let inputGames = this.inputPorts[0].connectedPortData();
		let inputCategory = this.inputLists[0].selectedItem;
		return inputGames.filter(game => game.Categories.some(cate => cate == inputCategory));
	}
}

//a filter node that filters patterns by those which are linked to a game
class PatternsLinkedToGameNode extends FilterNode{
	constructor(){
		super();
		this.addInputPort("Pattern Array", "Patterns to Filter");
		this.addInputList("Game", "Game");
		this.setOutputPort("Pattern Array", "Output Patterns");
	}
	
	getOutputData(){
		super.getOutputData();
		let inputPatterns = this.inputPorts[0].connectedPortData();
		let inputGame = this.inputLists[0].selectedItem;
		return inputPatterns.filter(pattern => (pattern.PatternsLinks.some(pLink => pLink.To == inputGame)));
	}
}

//a filter node that filters games by those which are linked to a pattern
class GamesLinkedToPatternNode extends FilterNode{
	constructor(){
		super();
		this.addInputPort("Game Array", "Games to Filter");
		this.addInputList("Pattern", "Pattern");
		this.setOutputPort("Game Array", "Output Games");
	}
	
	getOutputData(){
		super.getOutputData();
		let inputGames = this.inputPorts[0].connectedPortData();
		let inputPattern = this.inputLists[0].selectedItem;
		return inputGames.filter(game => (game.LinkedPatterns.some(pattern => pattern == inputPattern)));
	}
}

//a filter node which filters patterns by those which have a relation to another pattern
//UNFINISHED
class PatternsWithRelationToPatternNode extends FilterNode{
	constructor(){
		super();
		this.addInputPort("Pattern Array", "Patterns to Filter");
		this.addInputList("Pattern", "Pattern");
		this.addInputList("Relation Type", "Relation Type");
		this.setOutputPort("Pattern Array", "Output Patterns");
	}
	
	getOutputData(){
		super.getOutputData();
		throw "getOutputData not implemented yet";
	}
}

//a filter node which filters patterns by those which DON'T have a relation to another pattern
//UNFINISHED
class PatternsWithoutRelationToPatternNode extends FilterNode{
	constructor(){
		super();
		this.addInputPort("Pattern Array", "Patterns to Filter");
		this.addInputList("Pattern", "Pattern");
		this.addInputList("Relation Type", "Relation Type");
		this.setOutputPort("Pattern Array", "Output Patterns");
	}
	
	getOutputData(){
		super.getOutputData();
		throw "getOutputData not implemented yet";
	}
}

//a filter node which filters games by those which share patterns with other games
class GamesSharingPatternsWithGameNode extends FilterNode{
	constructor(){
		super();
		this.addInputPort("Game Array", "Games to Filter");
		this.addInputList("Game", "Game");
		this.addInputList("Number", "Minimum Patterns To Share");
		this.addInputList("Number", "Maximum Patterns To Share");
		this.setOutputPort("Game Array", "Output Games");
	}
	
	getOutputData(){
		super.getOutputData();
		let gamesArray = this.inputPorts[0].connectedPortData();
		let gameQuery = this.inputLists[0].selectedItem();
		let minimumAmount = this.inputLists[1].selectedItem();
		let maximumAmount = this.inputLists[2].selectedItem();
		
		let minimumArray = gamesArray.filter(game => 
			game.LinkedPatterns.filter(pattern => 
				pattern.PatternsLinks.some(pLink => 
					pLink.To == gameQuery.name)).length >= minimumAmount);
		let maximumArray = gamesArray.filter(game => 
			game.LinkedPatterns.filter(pattern => 
				pattern.PatternsLinks.some(pLink => 
					pLink.To == gameQuery.name)).length <= maximumAmount);
		
		return minimumArray.filter(value => -1 !== maximumArray.indexOf(value)); //find array intersection of minimum and maximum arrays
	}
}

//a filter node which filters patterns by those found in games
//UNFINISHED
class PatternsByThoseFoundInGamesNode extends FilterNode{
	constructor(){
		super();
		this.addInputPort("Pattern Array", "Patterns to Filter");
		this.addInputPort("Game Array", "Games to Filter");
		this.setOutputPort("Pattern Array", "Output Patterns");
	}
	
	getOutputData(){
		super.getOutputData();
		throw "getOutputData not implemented yet";
	}
}

//a filter node which filters games by those that use patterns
class GamesByThoseWhichUsePatternsNode extends FilterNode{
	constructor(){
		super();
		this.addInputPort("Game Array", "Games to Filter");
		this.addInputPort("Pattern Array", "Patterns to Filter");
		this.setOutputPort("Game Array", "Output Games");
	}
	
	getOutputData(){
		super.getOutputData();
		let gamesArray = this.inputPorts[0].connectedPortData();
		let patternsArray = this.inputPorts[1].connectedPortData();
		return gamesArray.filter(game => game.LinkedPatterns.some(pattern => patternsArray.indexOf(pattern) > 0));
	}
}

//a sub-class that certain other classes will inherit from 
class ArrayToolNode extends FilterNode{
	constructor(){
		super();
		this.addInputPort("Wildcard Array", "Array 1");
		this.addInputPort("Wildcard Array", "Array 2");
		this.setOutputPort("Wildcard Array", "Output Array");
	}
	
	getOutputData(){
		super.getOutputData();
	}
		
	portConnectedEvent(port){
		super.portConnectedEvent(port);
		
		if( //if we are still in the starting state
			this.inputPorts[0].type == getPortType("Wildcard Array") &&
			this.inputPorts[1].type == getPortType("Wildcard Array") &&
			this.outputPort.type == getPortType("Wildcard Array")
		){
			this.inputPorts[0].type = port.connectedPort.type;
			this.inputPorts[1].type = port.connectedPort.type;
			this.outputPort.type = port.connectedPort.type;
		}
	}
	
	portDisconnectedEvent(port){
		if( //check if all the ports are unconnected
			this.inputPorts[0].connectedPort == null &&
			this.inputPorts[1].connectedPort == null &&
			this.outputPort.connectedPort == null
		){ //reset them back to how they started
			this.inputPorts[0].type = getPortType("Wildcard Array");
			this.inputPorts[1].type = getPortType("Wildcard Array");
			this.outputPort.type = getPortType("Wildcard Array");
		}
		
	}
}

//a filter node which combines arrays
class ArrayUnionNode extends ArrayToolNode{
	constructor(){
		super();
	}
		
	getOutputData(){
		super.getOutputData();
		let arrA = this.inputPorts[0].connectedPortData();
		let arrB = this.inputPorts[1].connectedPortData();
		return arrA.concat(arrB);
	}
}

//a filter node which intersects arrays
class ArrayIntersectionNode extends ArrayToolNode{
	constructor(){
		super();
	}
		
	getOutputData(){
		super.getOutputData();
		let arrA = this.inputPorts[0].connectedPortData();
		let arrB = this.inputPorts[1].connectedPortData();
		return arrA.filter(x => arrB.includes(x));
	}
}

//a filter node which finds the difference in arrays
class ArrayDifferenceNode extends ArrayToolNode{
	constructor(){
		super();
	}
	
	getOutputData(){
		super.getOutputData();
		let arrA = this.inputPorts[0].connectedPortData();
		let arrB = this.inputPorts[1].connectedPortData();
		return arrA.filter(x => !arrB.includes(x));
	}
}

//a node which the GUI links to as the final output of the filtering system
class OutputNode extends FilterNode{
	constructor(){
		super();
		this.addInputPort("Wildcard Array", "Filtered Items");
		this.canBeRemoved = false; //prevent removal of allpatterns, allgames and output node
	}
	
	//although this node doesn't have an output port, it does need this method 
	//as it is the final node in the graph, and the output of this method is
	//what is displayed to the user
	getOutputData(){
		super.getOutputData();
		return this.inputPorts[0].connectedPort.owner.getOutputData();
	}
}

//object that wraps the entire backend for the filering system
class FilterGraph{
	constructor(){
		this.graphNodes = [];
	}
	
	//for when an empty filtering system is loaded
	initialize(){
		if(this.graphNodes.length > 0){
			throw "trying to initialize an existing graph";
			return false;
		}
		let outputNode = this.addFilter(OutputNode, 2, 0);
		outputNode.posX = 540;
		outputNode.posY = 350;
		let patternsNode = this.addFilter(AllPatternsNode, 0, 0);
		patternsNode.posX = 150;
		patternsNode.posY = 220;
		let gamesNode = this.addFilter(AllGamesNode, 0, 2);
		gamesNode.posX = 150;
		gamesNode.posY = 460;
		return true;
	}
	
	//function for adding to the array of filters
	addFilter(filterClass, x, y){
		let newFilterNode = new filterClass;
		newFilterNode.posX = x;
		newFilterNode.posY = y;
		this.graphNodes.push(newFilterNode);
		return newFilterNode;
	}
	
	//function for removing from the array of filters
	removeFilter(filterObject){
		if(filterObject.canBeRemoved){
			var index = this.graphNodes.indexOf(filterObject);
			if (index > -1) {
				this.graphNodes.splice(index, 1);
				return true
			}
			else{
				throw "tried to remove filter that doesn't exist";
			}
		}
		else{
			throw "tried to remove filter that is set non-removeable";
		}
	}

	serializeArray(){
		return Flatted.stringify(this.graphNodes); //stringyify the copy
	}
	
	deserializeArray(input){
		function copyProperties(sourceObj, targetObj){
			for(var propertyName in sourceObj) {
				if(propertyName != "className"){
					targetObj[propertyName] = sourceObj[propertyName];
				}
			}
		}
		
		let parsedInput = Flatted.parse(input, function(k,v){
			//console.log(k);
			//console.log(v);
			if(v == null){
				return null;
			}
			if(v.hasOwnProperty("facing")){ //its probably a Port
				let newPortObj = new Port();
				copyProperties(v, newPortObj);
				return newPortObj;
			}
			if(v.hasOwnProperty("posX")){ //its probably a FilterNode
				let newFilterInstance = new window[v.className]; //create a new object of the correct class
				copyProperties(v, newFilterInstance);
				return newFilterInstance;
			}
			if(v.hasOwnProperty("selectedItem")){ //its probably a List
				let newListObj = new List();
				copyProperties(v, newListObj);
				return newListObj;
			}
			return v;
		}); //parse the input
		
		function fixUpPorts(port){ //rebuilds the circular reference
			if(port != null && port.connectedPort != null){ //if the port and its connection are not null
				port.connectedPort.connectedPort = port;
			}
		}
		
		parsedInput.forEach(node => fixUpPorts(node.outputPort));
		parsedInput.forEach(node => node.inputPorts.forEach(port => fixUpPorts(port)));
		
		return parsedInput;
		
		
		let outputObjects = []; //create a new array for after we have re-classed all the object data
		/*parsedInput.forEach(function(filterData, i){ //we know this will just be an array of filters
			let newFilterInstance = new window[filterData.className]; //create a new object of the correct class
			for(var propertyName in filterData) {
				switch(propertyName){
					case "className":
						//don't do anything with this
						break;
					case "inputPorts":
						let inportPortsAsPortClass = [];
						filterData["inputPorts"].forEach(function(e, i){
							let newPortObj = new Port();
							copyProperties(e, newPortObj);
							newPortObj.owner = newFilterInstance;
							inportPortsAsPortClass.push(newPortObj);
						});
						newFilterInstance["inputPorts"] = inportPortsAsPortClass;
						break;
					case "inputLists":
						let inportListsAsListClass = [];
						filterData["inputLists"].forEach(function(e, i){
							let newListObj = new List();
							copyProperties(e, newListObj);
							inportListsAsListClass.push(newListObj);
						});
						newFilterInstance["inputLists"] = inportListsAsListClass;
						break;
					case "outputPort":
						if(filterData["outputPort"] != null){
							let newPortObj = new Port();
							copyProperties(filterData["outputPort"], newPortObj);
							newPortObj.owner = newFilterInstance;
							newFilterInstance["outputPort"] = newPortObj;
						}
						else{
							newFilterInstance["outputPort"] = null;
						}
						break;
					default:
						newFilterInstance[propertyName] = filterData[propertyName];				
				}
			}
			outputObjects[i] = newFilterInstance;
		});*/
		
		return outputObjects;
	}
}

//var allPattternsNode, patternsByPatternCategoryNode, outputNode;
var testFilterGraph;
function doVisualFilterDebug(){
	testFilterGraph = new testFilterGraph();
	testFilterGraph.initialize();
	testFilterGraph.graphNodes[1].outputPort.connectPort(testFilterGraph.graphNodes[0].inputPorts[0]);
	let orginalData = testFilterGraph.graphNodes;
	console.log(orginalData);
	let newData = testFilterGraph.deserializeArray(testFilterGraph.serializeArray());
	console.log(newData);
	console.log(orginalData == newData);
	orginalData.forEach(function(arrayEle, i){
		console.log(arrayEle.constructor.name)
		for(var propertyName in orginalData[i]) {
			console.log(propertyName);
			console.log(orginalData[i][propertyName] == newData[i][propertyName]);
		}
	});
	
	/*allPattternsNode = new AllPatternsNode();
	patternsByPatternCategoryNode = new PatternsByPatternCategoryNode();
	outputNode = new OutputNode();

	allPattternsNode.outputPort.getMatchingPort(patternsByPatternCategoryNode, true);
	patternsByPatternCategoryNode.outputPort.getMatchingPort(outputNode, true);

	patternsByPatternCategoryNode.inputLists[0].selectedItem = "Negative Patterns";
	console.log("doVisualFilterDebug() output follows:");
	console.log(outputNode.getOutputData());*/
}

class VisualFilterConnection extends React.Component{
	allFilterComponentsMounted() {
		let outputDOM = ReactDOM.findDOMNode(this.props.output);
		//console.log(outputDOM);
		let inputDOM = ReactDOM.findDOMNode(this.props.input);
		let outputCircle = $(outputDOM).find(".nodePort.output > .portCircle")[0];
		let inputCircle = $(inputDOM).find(".nodePort.input > .portCircle")[this.props.connectedPortNumber];
		let posX1 = outputCircle.getBoundingClientRect().x - $("#VisualFilterViewer")[0].getBoundingClientRect().x;
		let posY1 = outputCircle.getBoundingClientRect().y - $("#VisualFilterViewer")[0].getBoundingClientRect().y + 10;
		let posX2 = inputCircle.getBoundingClientRect().x - $("#VisualFilterViewer")[0].getBoundingClientRect().x;
		let posY2 = inputCircle.getBoundingClientRect().y - $("#VisualFilterViewer")[0].getBoundingClientRect().y;
		let width = (posX2 - posX1);
		let height = (posY2 - posY1) + 10;
		let self = ReactDOM.findDOMNode(this);
		self.style.webkitTransform =
			self.style.transform = 
				'translate(' + posX1 + 'px, ' + posY1 + 'px)';
		self.style.width = width + "px";
		self.style.height = height + "px";
		self.setAttribute("viewBox", "0 0 " + width + " " + height);
		let path = self.children[0];
		path.setAttribute("d", "M0,0 C"+ width +",0 0,"+height+" "+ width +","+height);
		path.style.stroke = this.props.output.props.filterObj.outputPort.type.Color;
	}
	
	render(){
		return(
			<svg id="VisualFilterConnections" viewBox="0 0 100 100">
				<path d="M0,0 C100,0 0,100 100,100 Z" />
			</svg>
		);
	}
}

var fakeConnectionData = {
	x: 0,
	y: 0,
	color: "black"
};
class FakeConnection extends React.Component{
	constructor(props){
		super(props);
	}
	
	componentDidMount(){
		let comp = this;
		document.addEventListener("mousemove", function(event){			
			let posX1 = fakeConnectionData.x;
			let posY1 = fakeConnectionData.y;
			let posX2 = event.x;
			let posY2 = event.y - 100;
			
			let width = (posX2 - posX1);
			let height = (posY2 - posY1);
			let selfDom = ReactDOM.findDOMNode(comp);
			selfDom.style.webkitTransform =
				selfDom.style.transform = 
					'translate(' + posX1 + 'px, ' + posY1 + 'px)';
			selfDom.style.width = width + "px";
			selfDom.style.height = height + "px";
			selfDom.setAttribute("viewBox", "0 0 " + width + " " + height);
			let path = selfDom.children[0];
			path.setAttribute("d", "M0,0 C"+ width +",0 0,"+height+" "+ width +","+height);
			path.style.stroke = fakeConnectionData.color;
		});
	}
	
	render(){
		return(
			<svg className="fake" id="VisualFilterConnections" viewBox="0 0 100 100">
				<path d="M0,0 C100,0 0,100 100,100 Z" />
			</svg>
		);
	}
}



class VisualFilterPort extends React.Component{
	constructor(props){
		super(props);
	}
	
	componentDidMount(){
		let self = this;
		$(ReactDOM.findDOMNode(this)).find(".portCircle").on("click", function(event){
			fakeConnectionData.x = event.pageX - $('#VisualFilterViewer').offset().left;
			fakeConnectionData.y = event.pageY - $('#VisualFilterViewer').offset().top;
			fakeConnectionData.color = self.props.port.port.type.Color;
		});
	}
	
	render(){
		let port = this.props.port;
		return(
			<div className={"nodePort " + port.facing}>
				<span style={{color: port.type.Color}} className="portCircle"></span>
				<span className="portLabel">{port.name}</span>
			</div>
		);
	}
}

class VisualFilterNode extends React.Component{
	constructor(props){
		super(props);
	}
	
	componentDidMount() {
		interact(ReactDOM.findDOMNode(this))
		.draggable({
			modifiers: [ // keep the element within the area of it's parent
				interact.modifiers.restrictRect({ 
					restriction: 'parent',
					endOnly: true
				})
			],
			// call this function on every dragmove event
			onmove: function(event) {
				var target = event.target;
				// keep the dragged position in the data-x/data-y attributes
				var x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
				var y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

				// translate the element
				target.style.webkitTransform =
					target.style.transform = 
						'translate(' + x + 'px, ' + y + 'px)';

				// update the posiion attributes
				target.setAttribute('data-x', x);
				target.setAttribute('data-y', y);
			},
			onend: function(event){
				visualFilterComponent.forceUpdate();
			}
		})
	}
	
	render(){
		let thisFilter = this.props.filterObj;
		let inputPortComponents = thisFilter.inputPorts.map((port, i) => <VisualFilterPort key={i} port={port} /> );
		
		let outputSide;
		if(thisFilter.outputPort){ //if we have an output port
			outputSide = (
				<div className="nodeOutputsSide">
					<VisualFilterPort port={thisFilter.outputPort} />
				</div>
			);
		}
		
		let nodeStyle = {
			transform: 'translate(' + thisFilter.posX + 'px, ' + thisFilter.posY + 'px)'
		};
		
		return(
			<div data-x={thisFilter.posX} data-y={thisFilter.posY} style={nodeStyle} className="node">
				<div className="nodeTitle">{thisFilter.constructor.name}</div>
				<div className="nodeContent">
					<div className="nodeInputSide">
						{inputPortComponents}
					</div>
					{outputSide}
				</div>
			</div>
		);
	}
}

class VisualFilterViewer extends React.Component{
	constructor(props){
		super(props);
		
		this.renderedFilterComponentRefs = [];
		this.renderedConnectionComponentRefs = [];
		
		this.setfilterComponentRef = component => {
			this.renderedFilterComponentRefs.push(component);
		};
		
		this.setConnectionComponentRef = component => {
			this.renderedConnectionComponentRefs.push(component);
		};
	}
	
	componentDidUpdate(){
		this.renderedConnectionComponentRefs.forEach(function(connectionComp, i){
			connectionComp.allFilterComponentsMounted();
		});
	}
	
	
	componentDidMount(){
		this.forceUpdate();
	}
	
	render(){
		//creating the fitler components
		let filtersToShow = this.props.attachedFilterGraph.graphNodes;
		let filterComponents = filtersToShow.map((filterObject, i) => <VisualFilterNode filterObj={filterObject} key={i} ref={this.setfilterComponentRef}/>);
		let self = this;
		//get all the connections between nodes needed
		let connections = [];
		filterComponents.forEach(function(filterComponent){
			//get this components filterObj
			let selfFilterObj = filterComponent.props.filterObj;
			//if this components filterObj has a connected output port
			if(selfFilterObj.outputPort && selfFilterObj.outputPort.connectedPort){
				//find the component which displays the forign port
				let filterComponentIndex = filterComponents.indexOf(filterComponent);
				let forignComponentIndex = filterComponents.findIndex((component) => component.props.filterObj == selfFilterObj.outputPort.connectedPort.owner);
				//get the connected port number
				let connectedPortNumber = selfFilterObj.outputPort.connectedPort.owner.inputPorts.findIndex(port => port == selfFilterObj.outputPort.connectedPort);
				//push to array of connections
				connections.push({
					input: self.renderedFilterComponentRefs[forignComponentIndex], 
					output: self.renderedFilterComponentRefs[filterComponentIndex],
					connectedPortNumber:connectedPortNumber
				});
			}
		});
		//create the connection components
		let connectionComponents = connections.map((connection, i) => <VisualFilterConnection ref={this.setConnectionComponentRef} input={connection.input} output={connection.output} connectedPortNumber={connection.connectedPortNumber} key={i} />);
		
		
		return(
			<div id="VisualFilterViewer">
				{filterComponents}
				{connectionComponents}
				<FakeConnection />
			</div>
		);
	}
}

class VisualFilterModule extends React.Component {
	filtersButtonClick(event){
		visualFilterComponent.forceUpdate();
	}
	
	render(){
		return (
		<>
			<button onClick={this.filtersButtonClick.bind(this)} id="ShowFiltersButton" style={{display: "inline-block"}} className="btn btn-light" data-toggle="collapse" data-target="#FilterPanel">Filters</button>
			<div id="FilterPanel" className="collapse">
				<VisualFilterViewer attachedFilterGraph={this.props.FilterGraphObject} />
			</div>
		</>
		);
	}
}