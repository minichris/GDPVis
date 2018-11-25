function resetGraph(){
	ClearSelection();
	$("svg").empty();
}

function generateGraph(data) {
	console.log("Displaying " + data.nodes.length + " nodes and " + data.links.length + " links.");
	var svg = d3.select("svg");
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
		.data(data.links)
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
		.data(data.nodes)
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

	simulation.nodes(data.nodes).on("tick", function ticked() { //Set the nodes tick function
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

	simulation.force("link").links(data.links); //Start the simulation of the links

	$('#SearchSelect').empty();
	node.each(function(node){
		$('#SearchSelect').append($("<option></option>").attr("value",node.id).text(node.id));
	});
	ClearSelection();
	$('#SearchSelect').select2({ width: '100%' });

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

$('#SearchSelect').change(function(){
	if($('#SearchSelect').val() != undefined){
		ChangePatternSelection($('#SearchSelect').val());
	}
});

//function which handles changing the currently selected pattern
function ChangePatternSelection(newSelectionID){
	//handle the document DocumentViewer
	docViewerComponent.setState({title: newSelectionID});

	//handle the search box
	if($('#SearchSelect').val() != newSelectionID){
		$("#SearchSelect").val(newSelectionID).trigger("change");
	}

	//handle the highlighted node
	var nodeIDToHighlight = "#Node_" + newSelectionID.replace(/[\W_]/g,'_');
	$(".SelectedNode").removeClass('SelectedNode');
	$(nodeIDToHighlight).addClass('SelectedNode');
}

function ClearSelection(){
	$("#SearchSelect").val("");
	$(".SelectedNode").removeClass('SelectedNode');
}

function getPatternRelationsText(sourcePattern, targetPattern){ //get the relation between a pattern
	var relationsTexts = [];
	if(sourcePattern.PatternsLinks.find(plink => plink.To == targetPattern.Title) != null){ //if a pLink actually exists
		relationsTexts = sourcePattern.PatternsLinks.find(plink => plink.To == targetPattern.Title).AssociatedRelations;
	}
	return relationsTexts;
}

//-------------------------------------------------------------------------
//The following section contains the Tooltip react components
//-------------------------------------------------------------------------

class Tooltip extends React.Component{
	constructor(props) {
		super(props);
		this.state = {
			d: null,
			type: null
		};
	}

	render(){
		let subcomponent;
		if(this.state.d != null){
			switch(this.state.type){
				case "Link":
					subcomponent = (<LinkTooltip SourcePattern={this.state.d.source.id} TargetPattern={this.state.d.target.id} />);
					break;
				case "Pattern":
					subcomponent = (<PatternTooltip Pattern={this.state.d.id} />);
					break;
				case null:
					subcomponent = (<p>nothing to see here</p>);
					break;
			}
		}
		else{
			subcomponent = (<span>No inner tooltip loaded.</span>);
		}
		return(subcomponent);
	}
}

class LinkTooltip extends React.Component{
	getPatternLinksHTML(sourcePattern, targetPattern){
		var targetLink = $(sourcePattern.Content).find("a[href]").filter(function(linkIndex, linkDOM){ //for each link
			var afterRelations = $(linkDOM).parent().prevAll("h2").find("#Relations").length == 0;
			var linksToTargetPattern = ($(linkDOM).text() == targetPattern.Title);
			return linksToTargetPattern && afterRelations;
		});
		$(targetLink).parent().find("a").not(targetLink).contents().unwrap();
		$(targetLink).addClass("TooltipHighlighted");
		return targetLink.parent().html();
	}

	formatRelationTexts(sourcePattern, targetPattern){
		return getPatternRelationsText(sourcePattern, targetPattern).map(function(relation){
			return '<span class="TooltipHighlighted">' + sourcePattern.Title + "</span> " + relation.toLowerCase() + ' <span class="TooltipHighlighted">' + targetPattern.Title + "</span>";
		}).join('<br>');
	}

	generateLinkTooltipHTML(pattern1, pattern2){
		//get all the relation texts
		var relationTexts = [this.formatRelationTexts(pattern1, pattern2), this.formatRelationTexts(pattern2, pattern1)].filter(function(para) { return para != null; }).join('<br>');

		//get both possible sides of the relevent paragraphs, then remove any which are blank
		var releventParagraphs = [this.getPatternLinksHTML(pattern1, pattern2), this.getPatternLinksHTML(pattern2, pattern1)].filter(function(para) { return para != null; }).join('<hr>');

		return(
			[relationTexts, releventParagraphs].join('<hr>')
		);
	}

	render(){
		var pattern1 = Patterns.find(pattern => pattern.Title == this.props.SourcePattern);
		var pattern2 = Patterns.find(pattern => pattern.Title == this.props.TargetPattern);
		return(
			<div id="TooltipInner" dangerouslySetInnerHTML={{__html: this.generateLinkTooltipHTML(pattern1, pattern2)}}></div>
		);
	}
}

class PatternTooltip extends React.Component{
	render(){
		let parser = new DOMParser();
		let patternObj = Patterns.find(pattern => pattern.Title == this.props.Pattern);
		let xmlObject = parser.parseFromString(patternObj.Content, "text/xml");
		let discriptionText = $(xmlObject).find("#mw-content-text > p > i").first().text();
		return(
			<div id="TooltipInner">
				{this.props.Pattern}<br />
				<i>{discriptionText}</i>
			</div>
		);
	}
}
