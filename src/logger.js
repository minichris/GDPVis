import $ from 'jquery';

export var participantID;

const Logger = require('js-logger');
Logger.useDefaults();
Logger.setHandler(function (messages, context) {
	$.post('http://10.5.35.35:25564/logs', { participant: participantID, message: messages[0], level: context.level });
});


export function participantIDAlert(){
	participantID = window.prompt("Please enter your participant ID");
}