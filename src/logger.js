/*
	If your looking through the source code and wondering what this is, 
	its a logger which was used to collect data on how my study participants 
	used the software. It tracks opens, closes and clicks for various parts of 
	the system. Feel free to point logURL somewhere else if you are suspicous, 
	but it shouldn't work anyway as it is an interal IP :P
*/
import $ from 'jquery';

const logURL = "http://10.5.35.35:25564/logs";

const Logger = require('js-logger');
Logger.useDefaults();

export default function startLogger(){
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