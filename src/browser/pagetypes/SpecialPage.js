import React from "react";
import OtherPage from "./OtherPage.js";

export default class SpecialPage extends React.Component {
    render(){
        if(this.props.title == "Special:VGTropes"){ //if this is the starting page
            return(
                <div className="insertedPage SpecialPage">
                    <h1>Welcome to VGTropes</h1>
                    <p>
                    VGTropes is a visualization tool built on top of the GameDesignPatterns.org wiki.
                    It can help you browse the collection of patterns, analysis games, contribute to the wiki, and much more.
                    To get started, why not try looking at the <a href="javascript:void(0)" title="Category:Games">Games category</a> for some inspiration,
                    or try filtering the patterns shown by clicking the "Filters" button in the graph view, or just clicking a node in the graph.
                    </p>
                    <h2>Features</h2>
        			<ul>
        				<li>Clicking on a node will change the currently viewed article.</li>
        				<li>Hovering over a node will show its name.</li>
        				<li>The graph can be zoomed using the mouse wheel and can be panned by clicking and dragging the background.</li>
        				<li>The nodes can be tugged about by click-dragging a node.</li>
        				<li>Clicking the "Filters" button will display the currently enabled Filters.</li>
        				<li>In the Filters menu, the Filters are appiled in order, top to bottom. There is currently no way to do "OR" logic.</li>
        				<li>The Filters only update when you press "Apply Filters".</li>
        				<li>Not applying enough filtering will cause a message to come up warning you that you are trying to display too many nodes. It is highly recomended you heed this warning.</li>
                        <li>The visualization starts with example Filters which only show <b>patterns found in the game <i>"World of Warcraft"</i></b> and <b>patterns in the <i>Negative Patterns</i> category</b>.</li>
                        <li>Hovering over the links between nodes shows a tooltip which explains the context of the link from the articles and any "relations" the articles have.</li>
                        <li>The current Filters (but not the current page) are saved to the URL. Copy / bookmark the url to save your Filters.</li>
                        <li>Game and Category pages are generated in-browser.</li>
        			</ul>
        			<h2>Planned</h2>
        			<ul>
        				<li>Currently, the nodes on the graph have random colours and links have random strengths. At some point these will be given meaning.</li>
                        <li>The currently appiled Filters should be shown at the bottom of the graph in a human readable format.</li>
                        <li>NOT gates, OR gates and multi-selects should be added to filtering.</li>
                        <li>Clicking on nodes should "magnetise" connected nodes around it.</li>
                        <li>A "Creator mode".</li>
                        <li>Make zoom configurable to not zoom, but to weaken gravity.</li>
                        <li>Display the amount of currently loaded Patterns and Links somewhere.</li>
        				<li>Working title!</li>
        			</ul>
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