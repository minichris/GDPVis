var svg = d3.select("svg"),
	width = +svg.attr("width"),
	height = +svg.attr("height");

var color = d3.scaleOrdinal(d3.schemeCategory20); //set the color scheme

var simulation = d3.forceSimulation()
	.force("link", d3.forceLink().id(function(d) { return d.id; })) //sets up the links to use the nodes ID, rather then its index in the list
	.force("gravity", d3.forceManyBody().strength(50).distanceMin(200)) //stops nodes from being pushed all the way to the edge
	.force("charge", d3.forceManyBody().strength(-50).distanceMax(150)) //stops nodes being stuck too close together
	.force("center", d3.forceCenter(width / 2, height / 2)); //makes the nodes gravitate toward the center (useful for when they spawn)

d3.json("nodes.json", function(error, graph) {
	if (error) throw error; //error handling

	var link = svg.append("g")
		.attr("class", "links")
		.selectAll("line")
		.data(graph.links)
		.enter().append("line")
		.attr("stroke-width", function(d) {
			return Math.sqrt(d.value);
		});

	var node = svg.append("g")
		.attr("class", "nodes")
		.selectAll("circle")
		.data(graph.nodes)
		.enter().append("circle")
		.attr("r", 5)
		.attr("fill", function(d) {
			return color(d.group);
		})
		.call(d3.drag()
			.on("start", dragstarted)
			.on("drag", dragged)
			.on("end", dragended));

	node.append("title").text(function(d) { return d.id; }); //Set the nodes title text to be its ID

	simulation.nodes(graph.nodes).on("tick", ticked); //Set the nodes tick function

	simulation.force("link").links(graph.links); //Start the simulation of the links

	function ticked() {
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
	}
});

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