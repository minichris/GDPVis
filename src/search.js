import $ from 'jquery';
import 'select2';
import 'select2/dist/css/select2.css';
import React from "react";
import {getBrowserComponentSingleton} from './browser.js';
import {performFiltering, generateReleventFilters} from './oldfilters.js';

import {Patterns, Games, PatternCategories, GameCategories, loadPatterns, loadGames} from './loaddata.js';

export class SearchBox extends React.Component {
    constructor(props){
        super(props);
    }

    getOptions(){ //get all the options for the option text
        let options = [];
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
            placeholder: "Search..."
        });
		
		let component = this;
		
		$(this.refs["SearchBox"]).on('select2:select', function (e) {
			component.searchButtonClicked(null);
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
        return $('<span>' + option.element.dataset.type + ': ' + option.text + '</span>');
    };

    searchButtonClicked(event){
        let articleSelected = $("#SearchBox").val();
        global.Filters = generateReleventFilters(articleSelected);
    	global.refreshGraph(performFiltering(global.Filters));
        getBrowserComponentSingleton().setState({title: articleSelected});
        updateFiltersGUI();
    }

    render(){
        return(
            < >
                <select ref="SearchBox" id="SearchBox" value={this.props.value} className="SearchBox">
                    {this.getOptions()}
                </select>
                <button id="SearchButton" className="btn btn-light" onClick={this.searchButtonClicked.bind(this)}>Display</button>
            < />
        );
    }
}
