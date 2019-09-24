import React from "react";
import $ from 'jquery';

export default class DocumentViewerTableOfContents extends React.Component{
	componentDidMount(){
		document.getElementById("TableOfContents").style.display = "none";
	}
	
	componentDidUpdate(prevProps) { //this has to be done in here because it works from what is put into the other component
		$("#TableOfContents").empty();
		$("#DocumentContainer").find(":header").each(function(i, heading){
			let marginSize = (heading.tagName.replace('H','') - 1);
			$("#TableOfContents").append("<div style='margin-left: " + marginSize + "rem'>" + heading.innerText + "</div>");
		});
		$("#TableOfContents > div").click(function(event){
			$("#DocumentContainer").find(":header").each(function(i, heading){
				if(heading.innerText == event.target.innerHTML){
					heading.scrollIntoView();
				}
			});
		});
	}
	
	render(){
		return(
			<div style={{display: "none"}} id="TableOfContents"></div>
		);
	}
}