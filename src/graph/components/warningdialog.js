import React from "react";

export default class WarningDialog extends React.Component{
	constructor(props) {
    	super(props);
    	this.state = {
			NodeCount: 0,
			LinkCount: 0,
			display: false
    	};
		
		this.selfRef = React.createRef();
  	}
	
	handleShowAnywayButtonClick(){
		this.setState({
			display: false
		});
		global.graphComponent.generateGraph(true);
	}
	
	handleAddLimiterButtonClick(){
		this.setState({
			display: false
		});
	}
	
	handleCancelButtonClick(){
		this.setState({
			display: false
		});
	}
	
	render(){
		let displayMode = this.state.display ? "block" : "none";
		return(
			<div id="WarningDialog">
				<div style={{display: displayMode}} className="modal" id="TooManyDialogModal" tabIndex="-1" role="dialog">
					<div className="modal-dialog" role="document">
						<div className="modal-content">
							<div className="modal-header">
								<h5 className="modal-title" id="exampleModalLabel">Warning: high amount of elements</h5>
								<button onClick={this.handleCancelButtonClick.bind(this)} type="button" id="TooManyCloseButton" className="close" data-dismiss="modal" aria-label="Close">
									<span aria-hidden="true">&times;</span>
								</button>
							</div>
							<div className="modal-body">
								The graph you are trying to display will contain <span id="TooManyDialogPatternCount">{this.state.NodeCount}</span> nodes and <span id="TooManyDialogPatternCount">{this.state.LinkCount} links</span>! This high amount may cause your browser to become unresponsive.
							</div>
							<div className="modal-footer">
								<button onClick={this.handleShowAnywayButtonClick.bind(this)} type="button" id="TooManyIgnoreButton" className="btn btn-danger">Show anyway</button>
								<button onClick={this.handleAddLimiterButtonClick.bind(this)}  type="button" id="TooManyOkButton" className="btn btn-success">Cancel</button>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}