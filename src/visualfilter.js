//This is where all the possible types of links will be stored for the entire visual filtering systemLanguage
var portTypes = [
	{Type: "Pattern Array"},
	{Type: "Game Array"},
	{Type: "Wildcard Array", WildcardType: true} //This type will accept a connection to any other type
]

class Port {
	constructor(name, type, owner) {
		this.name = name; //Friendly name of the port
		this.type = type; //portType of the port
		this.owner = owner; //reference to filter which owns this port
		this.connectedPort = null; //reference to the port we are connected to
	}
	
	connectPort(forignPort) {
		if(this.type == forignPort.type || forignPort.type.WildcardType || this.type.WildcardType){
			this.connectedPort = forignPort;
			forignPort.connectedPort = this;
		}
		else{
			throw "Tried to connect ports which are incompatible.";
		}
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
			this.outputPort = new Port(portName, this.getPortType(portTypeName), this);
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
			this.inputPorts.push(new Port(portName, this.getPortType(portTypeName), this));
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
outputNode.inputPorts[0].connectPort(allPattternsNode.outputPort);