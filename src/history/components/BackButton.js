//-------------------------------------------------------------------------
//The following section controls the saving and loading Filters from the URL
//-------------------------------------------------------------------------

import React from "react";
import { ActionCreators as UndoActionCreators } from 'redux-undo';
import { connect } from "react-redux";

class BackButtonComponent extends React.Component{
	constructor(props){
		super(props);
	}
	
	handleClick(){
		if(this.props.history.length > 0){
			this.props.dispatch(UndoActionCreators.undo());
		}
	}

	getTitle(){
		let previousStateTexts = [];
		for(var i = 0; i < (Math.min(5, this.props.history.length)); i++){
			var pageTitle = this.props.history[i].page;
			var pageFiltersCount = Object.values(this.props.history[i].filters.nodes).length;
			previousStateTexts.push("\n(" + (i+1) + ") " + pageTitle + " with " + pageFiltersCount + " filter nodes");
		}
		if(this.props.history.length > 5){
			previousStateTexts.push("\n...");
		}
		if(this.props.history.length > 0){
			return "Click to go back. There is " + this.props.history.length + " states in history. The last 5 are: " + previousStateTexts;
		}
		else{
			return "Click to go back. There is nothing in the history."
		}
	}

	getClassname(){
		var disabledClass = "disabled aug-clickable";
		if(this.props.history.length > 0){
			disabledClass = "enabled aug-clickable";
		}
		return disabledClass;
	}
	
	render(){

		return(
			<div onClick={this.handleClick.bind(this)} className={this.getClassname()} id="BackButton" title={this.getTitle()} augmented-ui="tl-clip br-clip exe">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24">
					<path d="M0 7.33l2.829-2.83 9.175 9.339 9.167-9.339 2.829 2.83-11.996 12.17z"/>
				</svg>
			</div>
		);
	}
}

const mapStateToProps = state => {
	return ({history: state.past});
};

export default connect(mapStateToProps)(BackButtonComponent);