import React from "react";

export default class DocumentResizer extends React.Component{
	constructor(props){
		super(props);
	}
	
	initResize() {
		function disableSelect(event) {
			event.preventDefault();
		}

		function Resize(e) {
			global.documentViewerOpenSize = Math.max((window.innerWidth - e.clientX), 330) + 'px';
			document.getElementById("DocumentViewer").style.width = global.documentViewerOpenSize;
		}

		function stopResize() {
			window.removeEventListener('mousemove', Resize, false);
			window.removeEventListener('mouseup', stopResize, false);
			window.removeEventListener('selectstart', disableSelect);
			document.getElementById("DocumentViewer").style.transition = null;
			global.graphComponent.state.tooltipEventsEnabled = true;
		}
		
		window.addEventListener('mousemove', Resize, false);
		window.addEventListener('mouseup', stopResize, false);
		window.addEventListener('selectstart', disableSelect);
		
		document.getElementById("DocumentViewer").style.transition = "none";
		global.graphComponent.state.tooltipEventsEnabled = false;
	}
	
	
	render(){
		return(
			<div onMouseDown={this.initResize.bind()} id="DocumentResizer"></div>
		);
	}
}