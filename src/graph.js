import $ from 'jquery';
import 'select2';
import 'select2/dist/css/select2.css';
import React from "react";
import * as d3 from 'd3';
import { schemeCategory10 } from 'd3-scale-chromatic';
import {Patterns} from './loaddata.js';
import {setWindowHistory} from './index.js';
import {closeFiltersPanel} from './rete/index.js';
import WarningDialog from './warningdialog.js';
import Tooltip from './tooltip.js';

export var RelationshipColors = {
	//goes R, G, B
	"Potentially Conflicting With": [255, 30, 30],
	"Possible Closure Effects": [100, 30, 30],
	"Can Instantiate": [30, 30, 255],
	"Can Be Instantiated By": [30, 30, 255],
	"Can Modulate": [30, 255, 30],
	"Can Be Modulated By": [30, 255, 30],
	"Hyperlinks To": [170, 170, 170]
}

function getRelationshipColor(relationshipText){
	let color = RelationshipColors[relationshipText];
	return ("rgb(" + color[0] + ", " + color[1] +", " + color[2] + ")");
}

export class Graph extends React.Component{
	constructor(props){
		super(props);
		this.state = {
			displayData: [],
			dataType: null,
			tooltipEventsEnabled: true,
			tooltipRequiresClickClose: false
		}

		this.svg = React.createRef();
		this.warningDialogRef = React.createRef();
		this.toolTipRef = React.createRef();

		this.prevNodesCount = null;
		this.prevLinksCount = null;
		this.zoomLevel = 1;
		this.showWarningLevel = 750;
		this.simulation = null;
	}

	createPatternNodes(patterns){
		function getGroup(){
			return Math.floor(Math.random() * 12) + 1;
		}

		var nodesObject = [];  //array to store the output of the function
		console.log("patterns");
		console.log(patterns);
		patterns.forEach(function(pattern){
			nodesObject.push({
				id: pattern.Title,
				group: getGroup()
			});
		});

		return nodesObject;
	}
	
	createGameNodes(games){
		function getGroup(){
			return Math.floor(Math.random() * 12) + 1;
		}

		var nodesObject = [];  //array to store the output of the function
		console.log("games");
		console.log(games);
		games.forEach(function(game){
			nodesObject.push({
				id: game.name,
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
		console.log(this.state.displayData);
		this.generateGraph(false);
	}


	generateGraph(force) {
		let nodesData, linksData;
		if(this.state.dataType == "Patterns"){
			nodesData = this.createPatternNodes(this.state.displayData);
			linksData = this.createLinks(this.state.displayData);
		}
		if(this.state.dataType == "Games"){
			nodesData = this.createGameNodes(this.state.displayData);
			linksData = [];
		}
		if(!this.state.dataType){
			$("#GraphItemCount").text("Nothing matches this filter setup.");
			return;
		}
		
		if(nodesData.length == this.prevNodesCount && linksData.length == this.prevLinksCount){
			return;
		}
		setWindowHistory(false); //add the previous state to the history
		this.prevNodesCount = nodesData;
		this.prevLinksCount = linksData;
	
		if(nodesData.length > this.showWarningLevel || linksData.length > this.showWarningLevel && !force){
			this.warningDialogRef.current.setState({
				NodeCount: nodesData.length,
				LinkCount: linksData.length,
				display: true
				
			});
			return;
		}
		else{
			this.warningDialogRef.current.setState({
				display: false
			}); //make sure it is hidden if it is not needed
		}
		
		if(nodesData.length > this.showWarningLevel || linksData.length > this.showWarningLevel){
			$("#EmergencyStopButton").show();
		}
		else{
			$("#EmergencyStopButton").hide();
		}

		var svg = d3.select(this.svg.current);
		var width = 300;
		var height = 300;

		var root = svg.select("g");
		let self = this;

		function resizer(){
			let sizeMultiplyer = 0.4 / self.zoomLevel;
			$("g > svg > text").css("font-size", sizeMultiplyer * 0.2 + "cm");
			$("g > svg > circle").attr("r", sizeMultiplyer * 3.5);
			$("g > g > line").attr("stroke-width", sizeMultiplyer * 1.5);
			$("g > svg > circle").css("stroke-width", sizeMultiplyer * 1.5);
			$("g > svg > text").attr("x", sizeMultiplyer * 6);
			$("g > svg > text").attr("y", sizeMultiplyer * 3);
		}
		

		svg.call(d3.zoom().scaleExtent([1/8, 4]).on("zoom", function(){ //Allows the graph to be zoomed and panned
			root.attr("transform", d3.event.transform);
			if(self.zoomLevel != d3.event.transform.k){
				self.zoomLevel = d3.event.transform.k;
				resizer();
			}
		})).on("dblclick.zoom", null);

		var color = d3.scaleOrdinal(schemeCategory10); //set the color scheme

		this.simulation = d3.forceSimulation()
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

		$("#GraphOuter").click(function(e) { //clicking the background
			ChangePatternSelection(false); //clear pattern selection
			closeFiltersPanel();
		});
		
		
		var tooltip = d3.select("#Tooltip");
		
		function showToolTip(show){
			if(show){
				tooltip.style("display", "block");
				tooltip.transition().duration(100).style("opacity", .9);
			}
			else{
				tooltip.transition().duration(250).style("opacity", 0);
				setTimeout(function(){ 
					tooltip.style("display", "none");	
				}, 250);
			}
		}

		let selfGraph = this;
		circle.on("mouseover", function(d) {
			if(selfGraph.state.tooltipEventsEnabled && !selfGraph.state.tooltipRequiresClickClose){
				showToolTip(true);
				tooltip.style("left", (d3.event.pageX + 15) + "px")
					.style("top", (d3.event.pageY - 28) + "px");
				selfGraph.toolTipRef.current.setState({d: d, type: selfGraph.state.dataType});
			}
		})
	    .on("mouseout", function() { //remove the tooltip when the user stops mousing over the node
				if(selfGraph.state.tooltipEventsEnabled && !selfGraph.state.tooltipRequiresClickClose){
					showToolTip(false);
				}
	    })
			.on("click", function(d) { //Click to open the relevent article
				d3.event.stopPropagation();
				ChangePatternSelection(d.id);
			});

		link.on("mouseover", function(d) {
			if(selfGraph.state.tooltipEventsEnabled && !selfGraph.state.tooltipRequiresClickClose){
				showToolTip(true);
				tooltip.style("left", (d3.event.pageX + 15) + "px")
					.style("top", (d3.event.pageY - 28) + "px");
				selfGraph.toolTipRef.current.setState({d: d, type: "Link"});
			}
		})
			.on("mouseout", function() { //remove the tooltip when the user stops mousing over the node
				if(selfGraph.state.tooltipEventsEnabled && !selfGraph.state.tooltipRequiresClickClose){
					showToolTip(false);
				}
			})
			.on("click", function(d) {
				d3.event.stopPropagation();
				if(selfGraph.state.tooltipEventsEnabled){
					selfGraph.state.tooltipRequiresClickClose = true; //require click to close
					showToolTip(true);
					tooltip.style("left", (d3.event.pageX + 15) + "px")
						.style("top", (d3.event.pageY - 28) + "px");
					selfGraph.toolTipRef.current.setState({d: d, type: "LinkExpanded"});
				}
			});
		
		svg.on("click", function(){
			d3.event.stopPropagation();
			if(d3.event.target.id == "MainNodeGraph" || (d3.event.target.tagName == "text" && d3.event.target.className.baseVal == "node")){
				ChangePatternSelection(false); //clear pattern selection
				closeFiltersPanel();
			}
			if(selfGraph.state.tooltipRequiresClickClose && selfGraph.state.tooltipEventsEnabled){
				selfGraph.state.tooltipRequiresClickClose = false;
				showToolTip(false);
			}
		});
		
		$("#GraphItemCount").text("Displaying " + nodesData.length + " nodes and " + linksData.length + " links.");

		this.simulation.nodes(nodesData).on("tick", function ticked() { //Set the nodes tick function
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

		this.simulation.force("link").links(linksData); //Start the simulation of the links
		resizer();

		/*function validate(x, a, b) { //function to decide with a node is outside the bounds of the graph
			if (x < a) x = a;
			if (x > b) x = b;
			return x;
		}*/

		function dragstarted(d) { //when the user start to drag the node with the mouse
			if (!d3.event.active) selfGraph.simulation.alphaTarget(0.3).restart();
			d.fx = d.x;
			d.fy = d.y;
		}

		function dragged(d) { //when the user is dragging a node with the mouse
			d.fx = d3.event.x;
			d.fy = d3.event.y;
		}

		function dragended(d) { //when the user stops dragging the node with the mouse
			if (!d3.event.active) selfGraph.simulation.alphaTarget(0);
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
	
	stopSim(){
		this.simulation.stop();
		$("#EmergencyStopButton").hide();
	}

	render(){		
		return(
			<>
				<div id="GraphOuter">
					<svg ref={this.svg} id="MainNodeGraph" viewBox="0 0 300 300">
						<g id="stillHere"></g>
					</svg>
					<div id="EmergencyStopButtonContainer">
						<button onClick={this.stopSim.bind(this)} title="Stops all graph physics" id="EmergencyStopButton" className="btn btn-danger">Stop graph physics</button>
					</div>
					<span id="GraphItemCount"></span>
					{this.state.dataType == "Patterns" ? <RelationshipSelector owner={this} ref="RelationshipSelector" /> : null}
				</div>
				<WarningDialog ref={this.warningDialogRef} />
				<Tooltip ref={this.toolTipRef} />
				{this.props.children}
			</>
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
		
		this.props.owner.forceUpdate();
	}
	
	render(){
		return(
			<div id="RelationshipSelector" className="aug" augmented-ui="bl-clip tr-clip b-clip exe">
				<span>Visible Relationship Lines</span>
				<form>
					<label style={{color: getRelationshipColor("Can Modulate")}}>
						<input
							name="modulates"
							type="checkbox"
							checked={this.state.modulates}
							onChange={this.handleInputChange} />
						Modulates / Modulated By
					</label>
					<br />
					<label style={{color: getRelationshipColor("Can Instantiate")}}>
						<input
							name="instantiates"
							type="checkbox"
							checked={this.state.instantiates}
							onChange={this.handleInputChange} />
						Instantiates / Instantiated By
					</label>
					<br />
					<label style={{color: getRelationshipColor("Potentially Conflicting With")}}>
						<input
							name="conflicts"
							type="checkbox"
							checked={this.state.conflicts}
							onChange={this.handleInputChange} />
						Potentially Conflicting
					</label>
					<br />
					<label style={{color: getRelationshipColor("Possible Closure Effects")}}>
						<input
							name="closureeffects"
							type="checkbox"
							checked={this.state.closureeffects}
							onChange={this.handleInputChange} />
						Possible Closure Effects
					</label>
					<br />
					<label style={{color: getRelationshipColor("Hyperlinks To")}}>
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

var prevSelectionID;

//function which handles changing the currently selected pattern
export function ChangePatternSelection(currentSelectionID){
	if(currentSelectionID){
		setWindowHistory(false); //add the previous state to the history
		global.docViewerComponent.displayDocumentViewer(true);
		
		//handle the highlighted node
		var nodeIDToHighlight = "#Node_" + currentSelectionID.replace(/[\W_]/g,'_');
		$(".SelectedNode").removeClass('SelectedNode');
		$(nodeIDToHighlight).addClass('SelectedNode');
		
		if(currentSelectionID != prevSelectionID){
			prevSelectionID = currentSelectionID;
			//handle the document DocumentViewer
			global.docViewerComponent.setState({title: currentSelectionID});
		}
	}
	else{
		global.docViewerComponent.displayDocumentViewer(false);
		$(".SelectedNode").removeClass('SelectedNode');
	}
}

//------------------------------
//PATTERN RELATIONSHIP FUNCTIONS
//------------------------------


//Given a pattern name, gets the pattern's data
function getPatternData(patternName){
	return Patterns.find(pattern => pattern.Title == patternName);
}

//Given a source pattern name and a target pattern name, find relation from the source to the target
export function getPatternOneWayRelationTexts(sourcePatternName, targetPatternName){ //get the relation between a pattern
	let sourcePattern = getPatternData(sourcePatternName);
	let targetPattern = getPatternData(targetPatternName);
	let relationsTexts = null;
	if(sourcePattern.PatternsLinks.find(plink => plink.To == targetPattern.Title) != null){ //if a pLink actually exists
		relationsTexts = sourcePattern.PatternsLinks.find(plink => plink.To == targetPattern.Title).Type;
		
		if(!relationsTexts){ //if it only hyperlinks without a "named relation"
			relationsTexts = ["Hyperlinks To"];
		}
	}
	return relationsTexts;
}

//Given two pattern names and a relation text, returns if the 
function checkForRelation(patternNames, relationText){
	if(getPatternOneWayRelationTexts(patternNames[0], patternNames[1]) != null){
		return getPatternOneWayRelationTexts(patternNames[0], patternNames[1]).includes(relationText);
	}
	
	else if(getPatternOneWayRelationTexts(patternNames[1], patternNames[0]) != null){
		return getPatternOneWayRelationTexts(patternNames[1], patternNames[0]).includes(relationText);
	}
	
	else{
		return false;
	}
}

//Given two pattern names, Function to get a list of relationships between two patterns
function getSharedPatternRelationships(patternNames){
	let hasModulates = checkForRelation(patternNames, "Can Modulate") || checkForRelation(patternNames, "Can Be Modulated By");
	let hasInstantiates = checkForRelation(patternNames, "Can Instantiate") || checkForRelation(patternNames, "Can Be Instantiated By");
	let hasConflicting = checkForRelation(patternNames, "Potentially Conflicting With");
	let hasClorsureEffects = checkForRelation(patternNames, "Possible Closure Effects");
	let hasHyperlinked = checkForRelation(patternNames, "Hyperlinks To");
	
	let relationships = {
		modulates: hasModulates,
		instantiates: hasInstantiates,
		conflicts: hasConflicting,
		closureeffects: hasClorsureEffects,
		hyperlinked: hasHyperlinked
	}
	
	return(relationships);
}
