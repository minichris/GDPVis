import React from "react";

export default class DocumentViewerOpenButton extends React.Component{
	constructor(props){
		super(props);
	}
	
	documentOpenButtonClick(){
		this.props.Parent.displayDocumentViewer(true);
		logger.info("User manually opened document viewer panel @ " + Math.round((new Date()).getTime() / 1000));
	}
	
	render(){
		return(
			<div id="DocumentViewerOpenButtonOuter">
				<div onClick={this.documentOpenButtonClick.bind(this)} id="DocumentViewerOpenButton" className="aug-clickable" title="Open the document viewer" augmented-ui="tl-clip tr-clip b-clip exe">Open Document Viewer</div>
			</div>
		);
	}
}