import $ from 'jquery';

const logURL = "http://10.5.35.35:25564/logs";

const Logger = require('js-logger');
Logger.useDefaults();

export function startLogger(){
	$.ajax({
		url: logURL,
		success: function(){
			let participantID = window.prompt("Please enter your participant ID");
			Logger.setHandler(function (messages, context) {
				$.post(logURL, { participant: participantID, message: messages[0], level: context.level });
			});
		}
	});
}