import React from "react";

export default class DocumentViewerOpenButton extends React.Component{
	constructor(props){
		super(props);
	}
	
	documentOpenButtonClick(event){
		global.docViewerComponent.displayDocumentViewer(true);
	}
	
	render(){
		return(
			<div onClick={this.documentOpenButtonClick.bind(this)} id="DocumentViewerOpenButton" title="Open the document viewer" augmented-ui="tl-clip bl-clip r-clip exe">{"<"}</div>
		);
	}
}