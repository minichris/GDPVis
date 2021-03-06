import $ from 'jquery';
import 'select2';
import 'select2/dist/css/select2.css';
import React from "react";
import {Patterns, Games, PatternCategories, GameCategories} from '../loadDataUtil.js';
import store from '../store';
import {updateFromSearch} from '../store/actions';

export default class SearchBox extends React.Component {
	constructor(props){
		super(props);
	}

	getOptions(){ //get all the options for the option text
		let options = [];
		options.push(<option key="BLANKER" value=""></option>)
		Patterns.forEach((pattern, i) =>
			options.push(<option key={i + "_Pattern"} data-type={"Pattern"} value={pattern.Title}>{pattern.Title}</option>)
		);
		Games.forEach((game, i) =>
			options.push(<option key={i + "_Game"} data-type={"Game"} value={game.name}>{game.name}</option>)
		);
		PatternCategories.forEach((cat, i) =>
			options.push(<option key={i + "_PCat"} data-type={"Pattern Category"} value={cat}>{cat}</option>)
		);
		GameCategories.forEach((cat, i) =>
			options.push(<option key={i + "_GCat"} data-type={"Game Category"} value={cat}>{cat}</option>)
		);
		return options;
	}

	componentDidMount() {
  		$(this.refs["SearchBox"]).select2({
			width: '20%',
			templateResult: this.formatOption,
			minimumInputLength: 3,
			allowClear: true,
			placeholder: "Search...",
			tags: true,
			SelectOnClose: false,
			createTag: function (params) {
				return {
					id: "GenericSearch:" + params.term,
					text: 'Search in patterns for "' + params.term + '"'
				}
			},
			insertTag: function (data, tag) {
				data.push(tag);
			}
		});
		
		let component = this;
		let searchBoxRef = this.refs["SearchBox"];
		
		$(this.refs["SearchBox"]).on('select2:select', function() {
			component.searchButtonClicked(store);
			$(searchBoxRef).val([]).trigger('change');
		});
		
		$(this.refs["SearchBox"]).val(null).trigger('change');
	}
	
	componentWillUnmount() {
		$(this.refs["SearchBox"]).off('select2:select');
	}

	formatOption(option) {
		if (!option.element) {
			return option.text;
		}
		if(!option.element.dataset.type){
			return null;	
		}
		return $('<span>' + option.element.dataset.type + ': ' + option.text + '</span>');
	}

	searchButtonClicked(store){
		let articleSelected = $("#SearchBox").val();
		store.dispatch(updateFromSearch(articleSelected));
		logger.info("User used search bar to search for " + articleSelected + " @ " + Math.round((new Date()).getTime() / 1000));
	}

	render(){
		return(
			<div id="SearchBoxOuter">
				<select ref="SearchBox" id="SearchBox" className="SearchBox">
					{this.getOptions()}
				</select>
				<button id="SearchButton" className="btn btn-light" onClick={this.searchButtonClicked.bind(this)}>Display</button>
			</div>
		);
	}
}
