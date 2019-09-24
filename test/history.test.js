import {InternalHistory, encodeJSONtoString, decodeJSONfromString} from '../src/history.js';
import getExampleData from '../src/rete/exampledata.js';

test('Encoding and Decoding a URL should return the same data', function () {
	const OriginalJSON = getExampleData();
	const JSONasString = encodeJSONtoString(OriginalJSON);
	const StringAsJSON = decodeJSONfromString(JSONasString);
	expect(OriginalJSON).toMatchObject(StringAsJSON);
});

test('Pushing a state and then using getState should return the state', function () {
	let historyObj = new InternalHistory;
	let saveData = {
		currentPage: "Special:VGTropes", //current browser page
		filters: getExampleData() //current Filters
	}
	historyObj.pushState(saveData);
	const returnedData = historyObj.getState();
	expect(returnedData).toMatchObject(saveData);
});

test('Pushing a two states then using goBack() should return the first', function () {
	let historyObj = new InternalHistory;
	let saveData = {
		currentPage: "Special:VGTropes", //current browser page
		filters: getExampleData() //current Filters
	}
	let saveData2 = {
		currentPage: "SECOND PAGE", //current browser page
		filters: "NOTHING" //current Filters
	}
	historyObj.pushState(saveData);
	historyObj.pushState(saveData2);
	historyObj.goBack();
	const returnedData = historyObj.getState();
	expect(returnedData).toMatchObject(saveData);
});

var additionalTestData = {
  "currentPage": "Ninja Looting",
  "filters": {
    "id": "tasksample@0.1.0",
    "nodes": {}
  }
};