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

	createLinks(patterns){
		var linksObject = []; //array to store the output of the function
		var includedPatternNames = patterns.map(pattern => pattern.Title); //all included pattern's names
		patterns.forEach(function(pattern){
			pattern["PatternsLinks"].forEach(function(pLink){
				if(includedPatternNames.includes(pLink.To)){ //if the link is to a pattern that is included
					linksObject.push({ //create the array member
						source: pattern.Title,
						target: pLink.To,
						value: 1
					});
				}
			});
		});
		return linksObject;
	}

	componentDidUpdate(){
		$(this.svg.current).empty();
		this.generateGraph(this.state.patterns);
	}

	generateGraph(patterns) {
		let nodesData = this.createNodes(patterns);
		let linksData = this.createLinks(patterns);

		$("#GraphInformationBox").text("Displaying " + nodesData.length + " nodes and " + linksData.length + " links.");

		var svg = d3.select(this.svg.current);
		var width = 300;
		var height = 300;

		var root = svg.append("g");

		svg.call(d3.zoom().scaleExtent([1 / 2, 4]).on("zoom", function(){ //Allows the graph to be zoomed and panned
			root.attr("transform", d3.event.transform);
		}));


		var color = d3.scaleOrdinal(d3.schemeCategory20b); //set the color scheme

		var simulation = d3.forceSimulation()
			.force("link", d3.forceLink().id(function(d) { return d.id; })) //sets up the links to use the nodes ID, rather then its index in the list
			.force("gravity", d3.forceManyBody().strength(50).distanceMin(200)) //stops nodes from being pushed all the way to the edge
			.force("charge", d3.forceManyBody().strength(-50).distanceMax(150)) //stops nodes being stuck too close together
			.force("center", d3.forceCenter(width / 2, height / 2)); //makes the nodes gravitate toward the center (useful for when they spawn)


		var tooltip = d3.select("#Tooltip");
		$("#Tooltip").css("opacity", 0); //Define the div for the tooltip

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
			.selectAll("circle")
			.data(nodesData)
			.enter().append("circle")
			.attr("r", 5)
			.attr("id", function(d) {
				return "Node_" + d.id.replace(/[\W_]/g,'_');
			})
			.attr("fill", function(d) {
				return color(d.group);
			})
			.call(d3.drag()
				.on("start", dragstarted)
				.on("drag", dragged)
				.on("end", dragended));

		node.on("mouseover", function(d) {
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
				.attr("cx", function(d) {
					return validate(d.x, 0, width);
				})
				.attr("cy", function(d) {
					return  validate(d.y, 0, height);
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
			function checkForRelation(relation){
				return(
					getPatternRelationsText(getPatternData(link.source), getPatternData(link.target)).includes(relation) ||
					getPatternRelationsText(getPatternData(link.target), getPatternData(link.source)).includes(relation)
				);
			}

			if(checkForRelation("Potentially Conflicting With")){
				return "yellow"; //if it is conflicting
			}
			else{
				return "#999"; //regular gray if it doesn't
			}
		}
	}

	render(){
		return(
			<svg ref={this.svg} width="100%" height="auto" viewBox="0 0 300 300"></svg>
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

//function which handles changing the currently selected pattern
function ChangePatternSelection(newSelectionID){
	//handle the document DocumentViewer
	docViewerComponent.setState({title: newSelectionID});

	//handle the search box
	graphSelectBoxComponent.setState({value: newSelectionID});

	//handle the highlighted node
	var nodeIDToHighlight = "#Node_" + newSelectionID.replace(/[\W_]/g,'_');
	$(".SelectedNode").removeClass('SelectedNode');
	$(nodeIDToHighlight).addClass('SelectedNode');
}

function getPatternRelationsText(sourcePattern, targetPattern){ //get the relation between a pattern
	var relationsTexts = [];
	if(sourcePattern.PatternsLinks.find(plink => plink.To == targetPattern.Title) != null){ //if a pLink actually exists
		relationsTexts = sourcePattern.PatternsLinks.find(plink => plink.To == targetPattern.Title).AssociatedRelations;
	}
	return relationsTexts;
}
