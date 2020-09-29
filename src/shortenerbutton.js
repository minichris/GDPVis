import React from "react";
import $ from "jquery";

import { connect } from "react-redux";

export class ShortenerButton extends React.Component{
	constructor(props) {
		super(props);
		this.state = {
			url: null
		};
	}

	shortenerButtonClick(){
		var thisButton = this;
		$.ajax({
			url: "https://gdpv.is/createshorturl.php",
			type: "POST",
			data: {
				url: window.location.href
			},
			dataType: "json"
		}).then(function(data){
			thisButton.setState({
				url: data.success
			});
		});
	}

	componentDidUpdate(prevProps, prevState){
		if((this.filtersJson !== JSON.stringify(this.props.filters)) ||
			this.page !== this.props.page){
			if(this.props !== prevProps){
				this.setState({
					url: null
				});
			}
		}
	}
	
	render(){
		var content = (<button id="ShortenerButton" onClick={this.shortenerButtonClick.bind(this)} title="Get shortened URL" className="btn btn-light"><img src="icons/Link.png" /></button>);
		if(this.state.url){
			content = <input id="ShortenerInput" disabled type="text" value={this.state.url}></input>;
		}

		return (
			content
		);
	}
}

const mapStateToProps = state => {
	return ({
		page: state.present.page, 
		filters: state.present.filters
	});
};

export default connect(mapStateToProps)(ShortenerButton);