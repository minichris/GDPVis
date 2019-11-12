import $ from 'jquery';
import {decodeJSONfromString} from './history.js';

const logURL = "http://10.5.35.35:25564/logs";

const Logger = require('js-logger');
Logger.useDefaults();

export function startLogger(){
	if(LOGIN){
		$.ajax({
			url: logURL,
			success: function(){
				var urlParams = new URLSearchParams( new URL(window.location).search);
				
				let participantID;
				if(urlParams.has('participantid')) { //if the url has Filters in the GET request
					participantID = urlParams.get('participantid');
				}
				else{
					return null;
				}
				
				Logger.setHandler(function (messages, context) {
					let time = Math.round((new Date()).getTime() / 1000);
					$.post(logURL, { timestamp: time, participant: participantID, message: messages[0], level: context.level });
				});
				
			}
		});
	}
}