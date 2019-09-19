import React from "react";
import Rete from "rete";
import Select from 'react-select';
import './style.css'

class TextBoxReactComponent extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			currentValue: this.props.getData(this.props.id)
		};
		this.handleChange = this.handleChange.bind(this);
	}
	
	componentDidUpdate(prevProps, prevState, snapshot){
		this.props.putData(this.props.id, this.state.currentValue);
	}
	
	handleChange(event) {
		this.setState({ currentValue: event.target.value });
		this.props.emitter.processControlChange();
	}
	
	preventRetePointerEvents(event){
		//allows the input box to function as normal with reguards to the cursor
		event.stopPropagation();
		return false;
	}
	
	render() {
		return (
			<div className="controlInner">
				<label>{this.props.title}</label>
				<br />
				<input onPointerCancel={this.preventRetePointerEvents.bind(this)} onPointerMove={this.preventRetePointerEvents.bind(this)} type="text" value={this.state.currentValue} onChange={this.handleChange} />
			</div>
		);
	}
}

export default class TextBoxControl extends Rete.Control {
	constructor(emitter, key, title) {
		super(key);
		this.render = "react";
		this.component = TextBoxReactComponent;
		this.props = { 
			emitter: emitter, 
			id: key,
			title: title,
			putData: this.putData.bind(this),
			getData: this.getData.bind(this)
		};
	}
}
