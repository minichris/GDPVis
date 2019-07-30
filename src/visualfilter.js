/*
VISUAL BASED FILTERING RULES
Nodes may only have one output port.
Port to port connections are one to one.
Any port can connect to a wildcard type input port, but wildcard ports shouldn't be used as output ports.
*/

//This is where all the possible types of links will be stored for the entire visual filtering systemLanguage
var portTypes = [
	{Type: "Pattern Array"},
	{Type: "Game Array"},
	{Type: "Wildcard Array", WildcardType: true} //This type will accept a connection to any other type
]

class Port {
	constructor(name, type, facing, owner) {
		this.name = name; //Friendly name of the port
		this.type = type; //portType of the port
		this.facing = facing; //The facing of the port, needed to find compatibilty
		this.owner = owner; //reference to filter which owns this port
		this.connectedPort = null; //reference to the port we are connected to
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
}

class FilterNode {
    constructor() {
		this.inputPorts = [];
		this.outputPort = null;
    }
	
	
	//function for getting portType object from portTypeName
	getPortType(portTypeName){
		return portTypes.find(type => type.Type == portTypeName);
	}
	
	//function for properly setting the output ports of a filter, returns true on success
    setOutputPort(portTypeName, portName){
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
			this.outputPort = new Port(portName, this.getPortType(portTypeName), "output", this);
			return true;
		}
	}

	//function for properly adding input ports to a filter, returns true on success
    addInputPort(portTypeName, portName){
		//getting and checking the type of the port
		if(this.getPortType(portTypeName) == null){
			throw "Tried to add port with unknown portType.";
			return false;
		}
		//checking the name of the port doesn't already exist on this filter
		if(this.inputPorts.filter(port => port.Name == portName).length > 0){
			throw "A port with the name given already exists."
			return false;
		}
		else{ //Success
			this.inputPorts.push(new Port(portName, this.getPortType(portTypeName), "input", this));
			return true;
		}
	}
}

class AllPatternsNode extends FilterNode{
	constructor(){
		super();
		this.setOutputPort("Pattern Array", "All Patterns");
	}
}

class OutputNode extends FilterNode{
	constructor(){
		super();
		this.addInputPort("Wildcard Array", "Filtered Items");
	}
}

var allPattternsNode = new AllPatternsNode();
var outputNode = new OutputNode();