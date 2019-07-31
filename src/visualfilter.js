/*
VISUAL BASED FILTERING RULES
Nodes only have exactly one output port.
Port to port connections are one to one.
Any port can connect to a wildcard type input port, but wildcard ports shouldn't be used as output ports.
*/

//This is where all the possible types of links will be stored for the entire visual filtering systemLanguage
var portTypes = [
	{Type: "Pattern Array"},
	{Type: "Game Array"},
	{Type: "Wildcard Array", WildcardType: true} //This type will accept a connection to any other type
]

var listTypes = [
	{Type: "Pattern Category", Content: function(){return PatternCategories}},
	{Type: "Game Category", Content: function(){return GameCategories}},
	{Type: "Game", Content: function(){return Games}},
	{Type: "Pattern", Content: function(){return Patterns}},
	{Type: "Relation Type", Content: function(){throw "not implemented yet"; return false;}}
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
	connectPort(forignPort) {
		if((this.type == forignPort.type || forignPort.type.WildcardType || this.type.WildcardType) && this.facing != forignPort.facing){
			this.connectedPort = forignPort;
			forignPort.connectedPort = this;
			return true;
		}
		else{
			throw "Tried to connect ports which are incompatible.";
			return false;
		}
	}
	
	//gets an array of compatible nodes objects (spawned from their classes)
	getCompatibleNodes(){
		//get an array of all the node classes that currently exist, removing webkit keys that cause warnings in the browser
		let allNodeClasses = Object.keys(window).filter(key => !key.match("webkit")).map(key => window[key]).filter(key => key instanceof FilterNode);
		//run the classes constructors to make them generate their port setups.
		let nodeClassesAsObject = [];
		allNodeClasses.forEach(nodeClass => nodeClassesAsObject.push(nodeClass.constructor()));
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
	getMatchingPort(forignFilterNode, connect){
		if(this.facing == "input"){
			if(this.type.WildcardType || forignFilterNode.outputPort.type.WildcardType){ //any output will do
				if(connect){
					this.connectPort(forignFilterNode.outputPort);
				}
				return forignFilterNode.outputPort;
			}
			if(forignFilterNode.outputPort.type == this.type){ //types match
				if(connect){
					this.connectPort(forignFilterNode.outputPort);
				}
				return forignFilterNode.outputPort;
			}
			return false; //failed to get matching port
		}
		if(this.facing == "output"){
			let bestPort = forignFilterNode.inputPorts.find(port => port.type == this.type);
			if(bestPort != null){
				if(connect){
					this.connectPort(bestPort);
				}
				return bestPort;
			}
			bestPort = forignFilterNode.inputPorts.find(port => port.type.WildcardType)
			if(bestPort != null){
				if(connect){
					this.connectPort(bestPort);
				}
				return bestPort;
			}
			if(this.type.WildcardType){
				if(connect){
					this.connectPort(forignFilterNode.inputPorts[0]);
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
		this.inputPorts = [];
		this.inputLists = [];
		this.outputPort = null;
    }
	
	//method called to get the output of this node,should be overridden in base classes
	getOutputData(){
		if(this.inputPorts.some(port => port.connectedPort == null)){
			return false;
		}
	}
	
	//method for getting portType object from portTypeName
	getPortType(portTypeName){
		return portTypes.find(type => type.Type == portTypeName);
	}
	
	//method for properly setting the output ports of a filter, returns port on success
    setOutputPort(portTypeName, portTitle){
		//getting and checking the type of the port
		if(this.getPortType(portTypeName) == null){
			throw "Tried to add port with unknown portType.";
			return false;
		}
		//checking the name of the port doesn't already exist on this filter
		if(this.outputPort != null){
			throw "An output port already exists."
			return false;
		}
		else{ //Success
			this.outputPort = new Port(portTitle, this.getPortType(portTypeName), "output", this);
			return this.outputPort;
		}
	}

	//method for properly adding input ports to a filter, returns port on success
    addInputPort(portTypeName, portTitle){
		//getting and checking the type of the port
		if(this.getPortType(portTypeName) == null){
			throw "Tried to add port with unknown portType.";
			return false;
		}
		//checking the name of the port doesn't already exist on this filter
		if(this.inputPorts.filter(port => port.Name == portTitle).length > 0){
			throw "A port with the name given already exists."
			return false;
		}
		else{ //Success
			let newPort = new Port(portTitle, this.getPortType(portTypeName), "input", this);
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
		this.patternsPort = this.addInputPort("Pattern Array", "Patterns to Filter");
		this.categoryList = this.addInputList("Pattern Category", "Pattern Category");
		this.setOutputPort("Pattern Array", "Output Patterns");
	}
	
	getOutputData(){
		super.getOutputData();
		let inputPatterns = this.patternsPort.connectedPortData();
		let inputCategory = this.categoryList.selectedItem;
		return inputPatterns.filter(pattern => pattern.Categories.some(cate => cate == inputCategory));
	}
}

//a filter node that filters games by their game category
class GamesByGameCategoryNode extends FilterNode{
	constructor(){
		super();
		this.gamesPort = this.addInputPort("Game Array", "Games to Filter");
		this.categoryList = this.addInputList("Game Category", "Game Category");
		this.setOutputPort("Game Array", "Output Games");
	}
	
	getOutputData(){
		super.getOutputData();
		let inputGames = this.gamesPort.connectedPortData();
		let inputCategory = this.categoryList.selectedItem;
		return inputGames.filter(game => game.Categories.some(cate => cate == inputCategory));
	}
}

//a filter node that filters patterns by those which are linked to a game
class PatternsLinkedToGameNode extends FilterNode{
	constructor(){
		super();
		this.patternsPort = this.addInputPort("Pattern Array", "Patterns to Filter");
		this.gameList = this.addInputList("Game", "Game");
		this.setOutputPort("Pattern Array", "Output Patterns");
	}
	
	getOutputData(){
		super.getOutputData();
		let inputPatterns = this.patternsPort.connectedPortData();
		let inputGame = this.gameList.selectedItem;
		return inputPatterns.filter(pattern => (pattern.PatternsLinks.some(pLink => pLink.To == inputGame)));
	}
}

//a filter node that filters games by those which are linked to a pattern
class GamesLinkedToPatternNode extends FilterNode{
	constructor(){
		super();
		this.gamesPort = this.addInputPort("Game Array", "Games to Filter");
		this.patternList = this.addInputList("Pattern", "Pattern");
		this.setOutputPort("Game Array", "Output Games");
	}
	
	getOutputData(){
		super.getOutputData();
		let inputGames = this.gamesPort.connectedPortData();
		let inputPattern = this.patternList.selectedItem;
		return inputGames.filter(game => (game.LinkedPatterns.some(pattern => pattern == inputPattern)));
	}
}

//a filter node which filters patterns by those which have a relation to another pattern

//a filter node which filters patterns by those which DON'T have a relation to another pattern

//a filter node which filters games by those which share patterns with other games

//a filter node which filters patterns by those found in games

//a filter node which filters games by those that use patterns

//a filter node which combines arrays

//a filter node which intersects arrays

//a filter node which finds the difference in arrays

//a node which the GUI links to as the final output of the filtering system
class OutputNode extends FilterNode{
	constructor(){
		super();
		this.addInputPort("Wildcard Array", "Filtered Items");
	}
	
	//although this node doesn't have an output port, it does need this method 
	//as it is the final node in the graph, and the output of this method is
	//what is displayed to the user
	getOutputData(){
		super.getOutputData();
		return this.inputPorts[0].connectedPort.owner.getOutputData();
	}
}

function doVisualFilterDebug(){
	var allPattternsNode = new AllPatternsNode();
	var patternsByPatternCategoryNode = new PatternsByPatternCategoryNode();
	var outputNode = new OutputNode();

	allPattternsNode.outputPort.getMatchingPort(patternsByPatternCategoryNode, true);
	patternsByPatternCategoryNode.outputPort.getMatchingPort(outputNode, true);

	patternsByPatternCategoryNode.inputLists[0].selectedItem = "Negative Patterns";
	console.log(outputNode.getOutputData());
}