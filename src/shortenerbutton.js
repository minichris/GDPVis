import React from "react";
import $ from "jquery";

import tippy from 'tippy.js';

export default class ShortenerButton extends React.Component{
	constructor(props) {
		super(props);
		this.state = {
			url: null,
			copyMode: false
		};
	}

	shortenerButtonClick(){
		var thisButton = this;
		if(!this.state.copyMode){
			$.ajax({
				url: "https://gdpv.is/createshorturl.php",
				type: "POST",
				data: {
					url: window.location.href
				},
				dataType: "json"
			}).then(function(data){
				thisButton.setState({
					url: data.success,
					copyMode: true
				});
			});
		}
		else{
			var copyText = document.querySelector("#ShortenerInput");
			copyText.select();
			document.execCommand("copy");
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