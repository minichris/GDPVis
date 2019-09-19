import React from "react";
import $ from 'jquery';
import {Patterns, Games} from '../../loaddata.js';


export default class GamePage extends React.Component {
    getPatternLink(title){
        return ('http://virt10.itu.chalmers.se/index.php/' + title.replace(' ', '_'));
    }

    getPatternsReasons(game){
		function pageFilter(inputPatterns, inputPage){ 
			return inputPatterns.filter(pattern => (pattern.PatternsLinks.some(pLink => pLink.To == inputPage)) || (pattern.Title == inputPage));
		}
		
        var gamePatterns = pageFilter(Patterns, game.name);
        var releventParagraphs = [];
        gamePatterns.forEach(function(pattern){
            let parser = new DOMParser();
            let xmlObject = parser.parseFromString(pattern.Content, "text/xml");
            $(xmlObject).find("#mw-content-text").find("p").each(function(){
                if($(this).text().includes(game.name)){
                    releventParagraphs.push({
                        pattern: pattern.Title,
                        reason: "Reasoning: " + $(this).text().replace(game.name, '<b>' + game.name + '</b>')
                    });
                }
            });
        });
        return releventParagraphs;
    }

    render() {
        var game = Games.find(game => game.name == this.props.title);
        var gamePatternsWithReasons = this.getPatternsReasons(game);

        return(
            <div className="insertedPage GamePage">
                <h1 className="firstHeading">{game.name}</h1>
                <h2>About</h2>
                <p>[insert info here]</p>
                <h2>Gameplay Patterns Used</h2>
                <i>Note: this section is automatically generated from parts of pattern pages on the wiki. It can contain examples which aren't relevent to this game. Read with caution.</i>
                {gamePatternsWithReasons.map((patternreason, i) =>
                    <div key={i}>
                        <h3>{patternreason.pattern}</h3>
                        <p dangerouslySetInnerHTML={{__html: patternreason.reason}}></p>
                        <a title={patternreason.pattern} href={this.getPatternLink(patternreason.pattern)}>Continue reading about "{patternreason.pattern}"...</a>
                    </div>
                )}
            </div>
        );
    }
}
