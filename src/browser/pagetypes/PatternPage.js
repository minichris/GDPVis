import React from "react";
import $ from 'jquery';
import {Patterns} from '../../loaddata.js';


export default class PatternPage extends React.Component {
    render(){
        let pattern = Patterns.find(pat => pat.Title == this.props.title);
        console.log("Generating page for the following pattern object:");
        console.log(pattern);
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