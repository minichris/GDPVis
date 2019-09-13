import $ from 'jquery';
import React from "react";
import {Patterns, Games, PatternCategories, GameCategories} from './loaddata.js';
import {getPatternOneWayRelationTexts, RelationshipColors} from './graph.js';

//-------------------------------------------------------------------------
//The following section contains the Tooltip react components
//-------------------------------------------------------------------------

export class Tooltip extends React.Component{
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
				case "LinkExpanded":
					subcomponent = (<LinkExpandedTooltip SourcePattern={this.state.d.source.id} TargetPattern={this.state.d.target.id} />);
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

function getRelationColorContribution(link){
	let red = 0, green = 0, blue = 0;

	if(checkForRelation("Potentially Conflicting With")){
		red = 255;
	}
	
	if(checkForRelation("Possible Closure Effects")){
		red = 100;
	}
	
	if(checkForRelation("Can Instantiate") || checkForRelation("Can Be Instantiated By")){
		blue = 255;
	}

	if(checkForRelation("Can Modulate") || checkForRelation("Can Be Modulated By")){
		green = 255;
	}	
	
	if(red != 0 || green != 0 || blue != 0){
		return ("rgb(" + red + ", " + green +", " + blue + ")");
	}
	else{
		return "#999"; //regular gray if it doesn't
	}
}

export class LinkTooltip extends React.Component{
	formatRelationTexts(sourcePattern, targetPattern){
		let oneWayRelationTexts = getPatternOneWayRelationTexts(sourcePattern.Title, targetPattern.Title);
		
		if(oneWayRelationTexts == null){
			return null;
		}
		
		
		return oneWayRelationTexts.map(function(relation){
			function getRelationColors(){
				if (typeof RelationshipColors[relation] !== 'undefined'){
					return RelationshipColors[relation].flat();
				}
				else{
					return "50,50,50";
				}
			}
			
			return 	`<span class="TooltipHighlighted">
						${sourcePattern.Title}
					</span>
					<span style="color: rgb(${getRelationColors()})">
						${relation.toLowerCase()}
					</span> 
					<span class="TooltipHighlighted">
						${targetPattern.Title}
					</span>`
		}).join('<br>');
	}

	generateLinkTooltipHTML(pattern1, pattern2){
		/*//get all the relation texts
		var relationTexts = [this.formatRelationTexts(pattern1, pattern2), this.formatRelationTexts(pattern2, pattern1)].filter(function(para) { return para != null; }).join('<br>');*/
		
		var relationTexts = [this.formatRelationTexts(pattern1, pattern2), this.formatRelationTexts(pattern2, pattern1)].filter(function(para) { return para != null; }).join('<hr>');
		return(
			"<span class='TooltipTitle'>" + 
			relationTexts
			+ "</span><div class='FindOutMoreText'>Click to find out more...</div>"
		);
		
		/*
		//get both possible sides of the relevent paragraphs, then remove any which are blank
		var releventParagraphs = [this.getPatternLinksHTML(pattern1, pattern2), this.getPatternLinksHTML(pattern2, pattern1)].filter(function(para) { return para != null; }).join('<hr>');

		return(
			[relationTexts, releventParagraphs].join('<hr>')
		);
		*/
	}

	render(){
		var pattern1 = Patterns.find(pattern => pattern.Title == this.props.SourcePattern);
		var pattern2 = Patterns.find(pattern => pattern.Title == this.props.TargetPattern);
		return(
			<div id="TooltipInner" dangerouslySetInnerHTML={{__html: this.generateLinkTooltipHTML(pattern1, pattern2)}}></div>
		);
	}
}

export class LinkExpandedTooltip extends LinkTooltip{
	getPatternLinksHTML(sourcePattern, targetPattern){
		var targetLink = $(sourcePattern.Content).find("a[href]").filter(function(linkIndex, linkDOM){ //for each link
			var afterRelations = $(linkDOM).parent().prevAll("h2").find("#Relations").length == 0;
			var linksToTargetPattern = ($(linkDOM).text() == targetPattern.Title);
			return linksToTargetPattern && afterRelations;
		});
		$(targetLink).parent().find("a").not(targetLink).contents().unwrap();
		$(targetLink).addClass("TooltipHighlighted").removeAttr("href");
		return targetLink.parent().html();
	}
	
	generateExpandedLinkTooltipHTML(pattern1, pattern2){
		//get all the relation texts		
		var relationTexts = [this.formatRelationTexts(pattern1, pattern2), this.formatRelationTexts(pattern2, pattern1)].filter(function(para) { return para != null; }).join('<hr>');
		
		//get both possible sides of the relevent paragraphs, then remove any which are blank
		var releventParagraphs = [this.getPatternLinksHTML(pattern1, pattern2), this.getPatternLinksHTML(pattern2, pattern1)].filter(function(para) { return para != null; }).join('<hr>');

		return(
			`<span class="TooltipTitle">Relation Types</span></br>
			<span class="TooltipBrief Relation">
				${relationTexts}
			</span>
			<hr>
			<span class="TooltipTitle">Relevent Paragraphs</span></br>
			<span class="TooltipBrief">
				${releventParagraphs}
			</span>
			<div class='FindOutMoreText'>Click anywhere to close...</div>
			`
		);
	}

	render(){
		var pattern1 = Patterns.find(pattern => pattern.Title == this.props.SourcePattern);
		var pattern2 = Patterns.find(pattern => pattern.Title == this.props.TargetPattern);
		return(
			<div id="TooltipInner" dangerouslySetInnerHTML={{__html: this.generateExpandedLinkTooltipHTML(pattern1, pattern2)}}></div>
		);
	}
}

export class PatternTooltip extends React.Component{
	render(){
		let parser = new DOMParser();
		let patternObj = Patterns.find(pattern => pattern.Title == this.props.Pattern);
		let xmlObject = parser.parseFromString(patternObj.Content, "text/xml");
		let discriptionText = $(xmlObject).find("#mw-content-text > p > i").first().text();
		return(
			<div id="TooltipInner">
				<span className="TooltipTitle">{this.props.Pattern}</span><br />
				<span className="TooltipBrief">{discriptionText}</span><br />
				<div className="FindOutMoreText">Click to find out more...</div>
			</div>
		);
	}
}
