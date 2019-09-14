import React from "react";
import Rete from "rete";
import Select from 'react-select';
import './style.css'

class DropDownReactComponent extends React.Component {
	
	constructor(props) {
		super(props);
		this.state = {
			selectedOption: this.props.getData(this.props.id)
		};
	}
	
	componentDidUpdate(prevProps, prevState, snapshot){
		this.props.putData(this.props.id, this.state.selectedOption);
	}
	
	handleChange(selectedOption) {
		this.setState({ selectedOption });
		this.props.emitter.trigger("process");
	};
	
	render() {
		const { selectedOption } = this.state;

		return (
			<>
				<label>{this.props.title}</label>
				<Select classNamePrefix="react-select" value={selectedOption} onChange={this.handleChange.bind(this)} options={this.props.options} />
			</>
		);
	}
}

export default class DropDownControl extends Rete.Control {
	constructor(emitter, key, options, title) {
		super(key);
		this.render = "react";
		this.component = DropDownReactComponent;
		this.props = { 
			emitter: emitter, 
			id: key,
			options: options,
			title: title,
			putData: this.putData.bind(this),
			getData: this.getData.bind(this)
		};
	}
}
