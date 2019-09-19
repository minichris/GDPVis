import React from "react";
import OtherPage from "./OtherPage.js";

export default class SpecialPage extends React.Component {
    render(){
        if(this.props.title == "Special:VGTropes"){ //if this is the starting page
            return(
                <div className="insertedPage SpecialPage">
                    <h1>Welcome to VGTropes</h1>
                    <p>
						Hello and welcome to VGTropes. This is a visualization tool built to help you view the information found on the GameplayDesignPatterns.org wiki, with a major focus on allowing better understanding of the links found between patterns.
                    </p>
                    <h2>How do I use it?</h2>
						There are three main ways to use VGTropes...
        			<h3>Filtering</h3>
						Write about filtering
        			<h3>Browsing</h3>
						Write about browsing
        			<h3>Searching</h3>
						Know what you are looking for already? The search bar in the top left will allow you to quickly jump to any Pattern, Game, Pattern category or Game category on the wiki. When you press enter, not only will it bring up this page, but it will also set up the filters to display a graph of related patterns. For example, selecting a pattern page from your search will create a graph of all the patterns relating to the selected pattern. Selecting a game page will show all the patterns which are linked to that game. Selecting category pages will fill the graph will patterns or games from that category. It can also search within the content of a pattern page, and from that will create a graph of patterns that contain those words.
        			<h3>Other Features</h3>
						Write about the ToC, links, etc
        			<h2>Q&A</h2>
        			<i>Some pages look different to the original wiki, why is that?</i>
					<br />
						The game pages and category pages you find on this system are generated from the patterns in this system, rather then using the wiki’s own pages. Also, the pattern information in this system is only updated every so often, which means any recent changes on the wiki will take some time to propagate to this visualization. Don’t worry, edits to the wiki will get here eventually!
                </div>
            );
        }
        else{
            return(
                <OtherPage title={this.props.title} prevtitle={this.props.prevtitle}/>
            );
        }
    }
}