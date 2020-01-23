import React from "react";
import $ from 'jquery';
import {patternCategoryFilter} from '../oldfilters.js';
import {Patterns, Games} from '../../loaddata.js';
import {getPageType} from '../index.js';

export default class CategoryPage extends React.Component{
	render(){
		let categoryTitle = this.props.title;
		let pageTitlesInCategory = []; //generic array to hold all the page titles
		//we KNOW it has to be one of the two types of category page
		switch(getPageType(categoryTitle)){
		case "Pattern Category":
			pageTitlesInCategory = patternCategoryFilter(Patterns, categoryTitle).map(pattern => pattern.Title);
			break;
		case "Game Category":
			pageTitlesInCategory = Games.filter(game => game.categories.some(cat => cat == categoryTitle)).map(game => game.name);
			break;
		}
		return(
			<div className="insertedPage CategoryPage">
				<h1>{categoryTitle}</h1>
				<div id="CatListBox">
					{pageTitlesInCategory.map((title, i) =>
						<a key={i} title={title} href={'http://virt10.itu.chalmers.se/index.php/' + title.replace(' ', '_')}>{title}</a>
					)}
				</div>
			</div>
		);
	}
}