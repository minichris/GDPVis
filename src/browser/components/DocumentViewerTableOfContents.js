import React from "react";
import $ from 'jquery';

export default class DocumentViewerTableOfContents extends React.Component{
	componentDidUpdate() { //this has to be done in here because it works from what is put into the other component
		$("#TableOfContents").empty();
		$("#DocumentContainer").find(":header").each(function(i, heading){
			let marginSize = (heading.tagName.replace('H','') - 1);
			$("#TableOfContents").append("<div style='margin-left: " + marginSize + "rem'>" + heading.innerText + "</div>");
		});
		$("#TableOfContents > div").click(function(event){
			$("#DocumentContainer").find(":header").each(function(i, heading){
				if(heading.innerText == event.target.innerHTML){
					if(heading.parentElement.tagName.toLowerCase() == "summary"){
						heading.parentElement.parentElement.setAttribute("open", true);
					}
					heading.scrollIntoView();
				}
			});
		});
	}
	
	render(){
		return(
			<div id="TableOfContents"></div>
		);
	}
}