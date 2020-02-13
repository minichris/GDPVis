import React from "react";

export default class OtherPage extends React.Component{
	constructor(props) {
		super(props);
	}

	render(){
		let url = "http://virt10.itu.chalmers.se/index.php/" + this.props.title.replace(' ', '_');
		return(
			<div className="insertediframe">
				<iframe src={url}></iframe>
			</div>
		);
	}
}