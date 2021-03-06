import React from "react";
import {Patterns} from '../../loadDataUtil.js';


export default class PatternPage extends React.Component {
	render(){
		let pattern = Patterns.find(pat => pat.Title == this.props.title);
		console.info("Generating page for the following pattern object:", pattern);
		if(pattern != null){ //if the pattern is valid
			return(
				<div className="insertedPage PatternPage" dangerouslySetInnerHTML={{__html: pattern.Content}}></div>
			);
		}
		else{
			return(
				<div className="insertedPage PatternPage">
					<h1>Error :(</h1>
					<p>There was an error getting this pattern page.
                    If you know this page exists on the Gameplay Design Pattern Wiki, please report this to an administrator.</p>
				</div>
			);
		}
	}
}