import $ from 'jquery';
import React from "react";

export class WarningDialog extends React.Component{
	constructor(props) {
    	super(props);
    	this.state = {
			Count: 0
    	};
  	}
	
	handleShowAnywayButtonClick(event){
		$("#TooManyDialogModal").hide();
		global.refreshGraph(performFiltering());
	}
	
	handleAddLimiterButtonClick(event){
		$("#TooManyDialogModal").hide();
		global.Filters.push({Type: "count", Value: 50});
		//updateFiltersGUI();
		global.refreshGraph(performFiltering());
	}
	
	handleCancelButtonClick(event){
		$("#TooManyDialogModal").hide();
	}
	
	render(){
		return(
			<div className="modal" id="TooManyDialogModal" tabIndex="-1" role="dialog">
				<div className="modal-dialog" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<h5 className="modal-title" id="exampleModalLabel">Warning: high amount of elements</h5>
							<button onClick={this.handleCancelButtonClick.bind(this)} type="button" id="TooManyCloseButton" className="close" data-dismiss="modal" aria-label="Close">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div className="modal-body">
							The graph you are trying to display will contain <span id="TooManyDialogPatternCount">{this.state.Count}</span> patterns! This high amount may cause your browser to become unresponsive. Add a limiter to prevent this?
						</div>
						<div className="modal-footer">
							<button onClick={this.handleShowAnywayButtonClick.bind(this)} type="button" id="TooManyIgnoreButton" className="btn btn-danger">Show anyway</button>
							<button onClick={this.handleAddLimiterButtonClick.bind(this)}  type="button" id="TooManyOkButton" className="btn btn-primary">Add limiter</button>
						</div>
					</div>
				</div>
			</div>
		);
	}
}