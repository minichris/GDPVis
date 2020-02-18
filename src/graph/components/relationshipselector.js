import React from 'react';
import {getRelationshipColor} from '../index.js';

export default class RelationshipSelector extends React.Component{
	constructor(props) {
		super(props);
		this.state = {
			modulates: true,
			instantiates: true,
			conflicts: true,
			closureeffects: true,
			hyperlinked: true
		};

		this.handleInputChange = this.handleInputChange.bind(this);
	}
	
	handleInputChange(event) {
		const target = event.target;
		const value = target.type === 'checkbox' ? target.checked : target.value;
		const name = target.name;

		this.setState({
		  [name]: value
		});
		
		this.props.owner.forceUpdate();
	}
	
	render(){
		return(
			<div id="RelationshipSelector" className="aug" augmented-ui="bl-clip tr-clip b-clip exe">
				<span>Visible Relationship Lines</span>
				<form>
					<label style={{color: getRelationshipColor("Can Modulate")}}>
						<input
							name="modulates"
							type="checkbox"
							checked={this.state.modulates}
							onChange={this.handleInputChange} />
						Modulates / Modulated By
					</label>
					<br />
					<label style={{color: getRelationshipColor("Can Instantiate")}}>
						<input
							name="instantiates"
							type="checkbox"
							checked={this.state.instantiates}
							onChange={this.handleInputChange} />
						Instantiates / Instantiated By
					</label>
					<br />
					<label style={{color: getRelationshipColor("Potentially Conflicting With")}}>
						<input
							name="conflicts"
							type="checkbox"
							checked={this.state.conflicts}
							onChange={this.handleInputChange} />
						Potentially Conflicting
					</label>
					<br />
					<label style={{color: getRelationshipColor("Possible Closure Effects")}}>
						<input
							name="closureeffects"
							type="checkbox"
							checked={this.state.closureeffects}
							onChange={this.handleInputChange} />
						Possible Closure Effects
					</label>
					<br />
					<label style={{color: getRelationshipColor("Hyperlinks To")}}>
						<input
							name="hyperlinked"
							type="checkbox"
							checked={this.state.hyperlinked}
							onChange={this.handleInputChange} />
						Articles Hyperlinked
					</label>
				</form>
			</div>
		);
	}
}