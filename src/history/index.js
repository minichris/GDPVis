import React from "react";
import './history.css';
import BackButtonComponent from './components/BackButton.js';
import ForwardButtonComponent from './components/ForwardButton.js';

export default function HistoryButtons(props){
	return(
		<div id="BackButtonOuter">
			<BackButtonComponent />
			<ForwardButtonComponent />
		</div>
	);
}