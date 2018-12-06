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