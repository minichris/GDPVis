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
						VGTropes has an experimental filtering system inspired by Unreal Engine 4's blueprint programming system. It uses the <a target="_blank" href="http://rete.js.org">rete.js</a> library to create the filtering graphs. <br />
						The reasoning for a somewhat more complex than usual filtering system is it is it allows the end-user (a.k.a you) a modular system of filtering for both the games and patterns found on the wiki, which allows a finer control of the output than a more standard filter setup. <br />
						<ul>
							<li>You can open the filtering system by clicking the "Change Filters" button in the bottom left, which only appears when the document viewer (this panel) is closed. </li>
							<li>When the panel is open, right clicking the background will open a menu which contains a list of all of the filtering nodes in the system.</li>
							<li>Purple connectors are arrays (lists) of patterns, and green connectors are arrays of games. Gray connections accept either an array of games or an array of patterns, but keep in mind that games and patterns can not be displayed at the same time. </li>
							<li>You can only have one <i>working</i> output node. </li> 
							<li>A node's output connections can be plugged into many nodes inputs, but one input can only accept one connection.</li>
							<li>If you need to merge arrays, check out the "Array Union", "Array Intersection" and "Array Difference" nodes (these can be thought of as "lets through if in either", "lets through if in both" and "lets through those from A if not in B").</li>
							<li>The graph won't update while nothing is plugged into the output node.</li>
							<li>Right clicking a node will allow you to clone the node or delete it. You can also delete by pressing the delete key.</li>
							<li>Don't know where to start? Try searching something, which will generate a set of example filter nodes.</li>
						</ul>
					<h4>Example Filters</h4>
						Why not check out some of these patterns for insperation?
						<ul>
						<li><a href="javascript:void(0)" title="Category:Games">
						All Games
						</a></li>
						<li><a href="javascript:void(0)" title="Game World Exploration">
						All patterns relating to Game World Exploration
						</a></li>
						<li><a href="javascript:void(0)" title="Category:FPS Games">
						All games in the category "FPS Games"
						</a></li>
						</ul>
        			<h3>Browsing</h3>
						Just want to browse like on a regular wiki? This panel will display page content. Hovering or clicking on nodes on the graph will will give information about that pattern / game, and the same with the links between them.
        			<h3>Searching</h3>
						Know what you are looking for already? The search bar in the top left will allow you to quickly jump to any Pattern, Game, Pattern category or Game category on the wiki. When you press enter, not only will it bring up this page, but it will also set up the filters to display a graph of related patterns. For example, selecting a pattern page from your search will create a graph of all the patterns relating to the selected pattern. Selecting a game page will show all the patterns which are linked to that game. Selecting category pages will fill the graph will patterns or games from that category. It can also search within the content of a pattern page, and from that will create a graph of patterns that contain those words.
        			<h3>Other Features</h3>
					<p style={{color: "red"}}>Write about the ToC, links, etc</p>
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