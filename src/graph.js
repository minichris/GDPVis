var RelationshipColors = {
	//goes R, G, B
	"Potentially Conflicting With": [255, 30, 30],
	"Possible Closure Effects": [100, 30, 30],
	"Can Instantiate": [30, 30, 255],
	"Can Be Instantiated By": [30, 30, 255],
	"Can Modulate": [30, 255, 30],
	"Can Be Modulated By": [30, 255, 30],
	"Hyperlinks To": [50, 50, 50]
}

class Graph extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			patterns: []
		}
		this.svg = React.createRef();
	}

	createNodes(patterns){
		function getGroup(){
			return Math.floor(Math.random() * 12) + 1;
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

	//Gets all the relationships a link is allowed to show
	LinkEnabledRelationships(sourcePatternName, targetPatternName){
		let currentAllowedRelationships = this.refs.RelationshipSelector.state;
		let linkRelationships = getSharedPatternRelationships([sourcePatternName,targetPatternName]);
		let outputRelationships = [];
		for (var relationship in currentAllowedRelationships) { //for each property in currentAllowedRelationships
			if (currentAllowedRelationships.hasOwnProperty(relationship)) { //if the property is unique to currentAllowedRelationships
				outputRelationships[relationship] = ( currentAllowedRelationships[relationship] && linkRelationships[relationship] );
			}
		}
		
		/*if(Object.values(outputRelationships).filter(b => b).length > 0){ //if it should be shown
			console.log("------------");
			console.log(sourcePatternName + " & " + targetPatternName);
			console.log(linkRelationships);
		}*/
		
		return outputRelationships;
	}

	createLinks(patterns){	
		let graph = this;
		var linksObject = []; //array to store the output of the function
		var includedPatternNames = patterns.map(pattern => pattern.Title); //all included pattern's names
		patterns.forEach(function(pattern){
			pattern["PatternsLinks"].forEach(function(pLink){
				if(includedPatternNames.includes(pLink.To)){ //if the link is to a pattern that is included
					let enabledLinkCount = Object.values(graph.LinkEnabledRelationships(pattern.Title, pLink.To)).filter(b => b);
					if(enabledLinkCount.length > 0){
						linksObject.push({ //create the array member
							source: pattern.Title,
							target: pLink.To,
							value: 1
						});
					}
				}
			});
		});
		return linksObject;
	}
	
	

	componentDidUpdate(){
		$(this.svg.current).find("g").empty();
		this.generateGraph(this.state.patterns);
	}


	generateGraph(patterns) {
		let nodesData = this.createNodes(patterns);
		let linksData = this.createLinks(patterns);

		var svg = d3.select(this.svg.current);
		var width = 300;
		var height = 300;

		var root = svg.select("g");

		svg.call(d3.zoom().scaleExtent([1/4, 2]).on("zoom", function(){ //Allows the graph to be zoomed and panned
			root.attr("transform", d3.event.transform);
		}));


		var color = d3.scaleOrdinal(d3.schemeCategory20); //set the color scheme

		var simulation = d3.forceSimulation()
			.force("link", d3.forceLink().id(function(d) { return d.id; }).strength(0.05)) //sets up the links to use the nodes ID, rather then its index in the list
			.force("gravity", d3.forceManyBody().strength(10).distanceMin(1000)) //stops nodes from being pushed all the way to the edge
			.force("charge", d3.forceManyBody().strength(-50).distanceMax(1500)) //stops nodes being stuck too close together
			.force("center", d3.forceCenter(width / 2, height / 2)); //makes the nodes gravitate toward the center (useful for when they spawn)


		var link = root.append("g")
			.attr("class", "links")
			.selectAll("line")
			.data(linksData)
			.enter().append("line")
			.attr("stroke-width", function(d) {
				return Math.sqrt(d.value);
			})
			.attr("stroke", function(d) {
				return generateLinkColor(d);
			});

		var node = root.append("g")
			.attr("class", "nodes")
			.selectAll("svg")
			.data(nodesData)
			.enter().append("svg")
			.attr("id", function(d) {
				return "Node_" + d.id.replace(/[\W_]/g,'_');
			})
			.attr("class", "node")
			.call(d3.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended));
				
		var circle = node.append("circle")
		.attr("r", 5)
		.attr("fill", function(d) {
			return color(d.group);
		});
			
		node.append("text")
		.attr("y", 3.5)
		.attr("x", 7)
		.attr("fill", function(d) {
			return color(d.group);
		})
		.attr("text-anchor", "start")
		.text(function(d) {
			return d.id;
		});
		
		root.selectAll("rect").each(function(d){
			console.log(this);
			console.log(d);
		});
		
		$(this.svg.current).click(function(e) { //clicking the background
			if(e.target.parentNode.id == "GraphOuter"){
				console.log(event);
				DisplayDocumentViewer(false);
			}
		});

		var tooltip = d3.select("#Tooltip");
		circle.on("mouseover", function(d) {
			tooltip.transition() //add the tooltip when the user mouses over the node
				.duration(200).style("opacity", .9);
			tooltip.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 28) + "px");
			toolTipComponent.setState({d: d, type: "Pattern"});
			})
	    .on("mouseout", function(d) { //remove the tooltip when the user stops mousing over the node
	      tooltip.transition().duration(500).style("opacity", 0);
	    })
		.on("click", function(d) { //Click to open the relevent article
			ChangePatternSelection(d.id);
		});

		link.on("mouseover", function(d) {
			tooltip.transition() //add the tooltip when the user mouses over the node
				.duration(200).style("opacity", .9);
			tooltip.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 28) + "px");
			toolTipComponent.setState({d: d, type: "Link"});
		})
		.on("mouseout", function(d) { //remove the tooltip when the user stops mousing over the node
	      tooltip.transition().duration(500).style("opacity", 0);
	    });

		simulation.nodes(nodesData).on("tick", function ticked() { //Set the nodes tick function
			link
				.attr("x1", function(d) {
					return d.source.x;
				})
				.attr("y1", function(d) {
					return d.source.y;
				})
				.attr("x2", function(d) {
					return d.target.x;
				})
				.attr("y2", function(d) {
					return d.target.y;
				});

			node
				.attr("x", function(d) {
					return d.x;
				})
				.attr("y", function(d) {
					return d.y;
				});
		});

		simulation.force("link").links(linksData); //Start the simulation of the links

		function validate(x, a, b) { //function to decide with a node is outside the bounds of the graph
			if (x < a) x = a;
			if (x > b) x = b;
			return x;
		}

		function dragstarted(d) { //when the user start to drag the node with the mouse
			if (!d3.event.active) simulation.alphaTarget(0.3).restart();
			d.fx = d.x;
			d.fy = d.y;
		}

		function dragged(d) { //when the user is dragging a node with the mouse
			d.fx = d3.event.x;
			d.fy = d3.event.y;
		}

		function dragended(d) { //when the user stops dragging the node with the mouse
			if (!d3.event.active) simulation.alphaTarget(0);
			d.fx = null;
			d.fy = null;
		}

		function generateLinkColor(link){
			
			let color = [80,80,80]; //rgb

			if(checkForRelation([link.source,link.target],"Potentially Conflicting With")){
				for(let i = 0; i < 3; i++){
					color[i] = color[i] + RelationshipColors["Potentially Conflicting With"][i]
				}
			}
			
			if(checkForRelation([link.source,link.target],"Possible Closure Effects")){
				for(let i = 0; i < 3; i++){
					color[i] = color[i] + RelationshipColors["Possible Closure Effects"][i]
				}
			}
			
			if(checkForRelation([link.source,link.target],"Can Instantiate") || checkForRelation([link.source,link.target],"Can Be Instantiated By")){
				for(let i = 0; i < 3; i++){
					color[i] = color[i] + RelationshipColors["Can Be Instantiated By"][i]
				}
			}

			if(checkForRelation([link.source,link.target],"Can Modulate") || checkForRelation([link.source,link.target],"Can Be Modulated By")){
				for(let i = 0; i < 3; i++){
					color[i] = color[i] + RelationshipColors["Can Be Modulated By"][i]
				}
			}	
			
			return ("rgb(" + color[0] + ", " + color[1] +", " + color[2] + ")");
		}
	}

	render(){
		let nodesData = this.createNodes(this.state.patterns);
		let linksData = this.createLinks(this.state.patterns);
		return(
			<div id="GraphOuter">
				<FilterModule ref="FilterModule" />
				<svg ref={this.svg} width="100%" height="auto" viewBox="0 0 300 300">
					<g id="stillHere"></g>
					<text x="0" y="300" style={{fill: 'white'}}>
						Displaying {nodesData.length} nodes and {linksData.length} links.
					</text>
				</svg>
				<RelationshipSelector ref="RelationshipSelector" />
			</div>
		);
	}
}

class GraphSelectBox extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			patterns: [],
			value: null
		}
		this.select2 = React.createRef();
	}

	shouldComponentUpdate(nextProps, nextState){
		//since this component makes use of select2, and therefore react...
		//doesn't know that it needs updating. This prevents us needing to put...
		//forceUpdate() after everything.
		return true;
	}

	handleChange(event) {
		if(event.target.value != this.state.value && this.state.value != null){
			this.setState({value: event.target.value});
			ChangePatternSelection( this.state.value );
		}
   	}

	componentDidUpdate(){
		$("#SearchSelect").select2({
			width: '100%',
			placeholder: "No pattern selected...",
			allowClear: true
		})
		.on("change", this.handleChange.bind(this));

		if(this.state.value != null){
			$("#SearchSelect").val(this.state.value).trigger('change');
		}
		else{
			$("#SearchSelect").val('').trigger('change');
		}
	}

	render(){
		return(
			<select ref={this.select2} id="SearchSelect" placeholder="Select a pattern...">
				<option></option>
				{this.state.patterns.map((pat, i) =>
					<option key={i} value={pat.Title}>{pat.Title}</option>
				)}
			</select>
		);
	}
}

class RelationshipSelector extends React.Component{
	constructor(props) {
		super(props);
		this.state = {
			modulates: true,
			instantiates: true,
			conflicts: true,
			closureeffects: true,
			hyperlinked: true
		};

		this.handleInputChange = this.handleInputChange.bind(this);
	}
	
	handleInputChange(event) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;

		this.setState({
		  [name]: value
		});
		
		graphComponent.forceUpdate();
	}
	
	render(){
		return(
			<div id="RelationshipSelector">
				<span>Relationships to Show</span>
				<form>
					<label>
						<input
						name="modulates"
						type="checkbox"
						checked={this.state.modulates}
						onChange={this.handleInputChange} />
						Modulates / Modulated By
					</label>
					<br />
					<label>
						<input
						name="instantiates"
						type="checkbox"
						checked={this.state.instantiates}
						onChange={this.handleInputChange} />
						Instantiates / Instantiated By
					</label>
					<br />
					<label>
						<input
						name="conflicts"
						type="checkbox"
						checked={this.state.conflicts}
						onChange={this.handleInputChange} />
						Potentially Conflicting
					</label>
					<br />
					<label>
						<input
						name="closureeffects"
						type="checkbox"
						checked={this.state.closureeffects}
						onChange={this.handleInputChange} />
						Possible Closure Effects
					</label>
					<br />
					<label>
						<input
						name="hyperlinked"
						type="checkbox"
						checked={this.state.hyperlinked}
						onChange={this.handleInputChange} />
						Articles Hyperlinked
					</label>
				</form>
			</div>
		);
	}
}

//function which handles changing the currently selected pattern
function ChangePatternSelection(newSelectionID){
	//handle the document DocumentViewer
	docViewerComponent.setState({title: newSelectionID});
	DisplayDocumentViewer(true);
	//handle the search box
	graphSelectBoxComponent.setState({value: newSelectionID});

	//handle the highlighted node
	var nodeIDToHighlight = "#Node_" + newSelectionID.replace(/[\W_]/g,'_');
	$(".SelectedNode").removeClass('SelectedNode');
	$(nodeIDToHighlight).addClass('SelectedNode');
}


