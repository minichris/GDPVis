import { createStore } from 'redux';
import getExampleData from '../rete/exampledata.js';
import undoable, { excludeAction, combineFilters } from 'redux-undo';
import {setWindowHistory, getURLasStoreData} from './windowHistoryUtil.js';
import _ from 'lodash';

//set up the example filters and the home page
const initialState = {
	filters: getExampleData(),
	page: "Special:GDPVis",
	browserVisibility: true
}

//handle all actions
function gdpReducer(state = initialState, action) {
	console.info("Recived action: " + action.type);
	switch(action.type){
		case 'CHANGE_SET':
			return Object.assign({}, state, {
				filters: action.filters
			});
		case 'INTERNAL_CHANGE_SET':
			return Object.assign({}, state, {
				filters: action.filters
			});
		case 'CHANGE_PAGE':
			return Object.assign({}, state, {
				page: action.page
			});
		case 'BROWSER_SET_VISIBILITY':
			return Object.assign({}, state, {
				browserVisibility: action.browserVisibility
			});
		case 'SEARCH':
			return Object.assign({}, state, {
				filters: action.filters,
				page: action.page,
				browserVisibility: action.browserVisibility
			});
		default:
			return state;
	}
}


let samestateRemover = function(action, currentState, previousHistory){
	let currentNodes = Object.values(currentState?.filters?.nodes || []);
	let previousNodes = Object.values(previousHistory?.past[previousHistory?.past.lastIndexOf()]?.filters.nodes || []);
	console.error(currentNodes, previousNodes);
	return (
		!_.isEqual(currentNodes, previousNodes) &&
		currentState.page != previousHistory?.past[previousHistory?.past.lastIndexOf()]?.page
	)
}

const undoableGdpReducer = undoable(
	gdpReducer, 
	{filter: combineFilters(
		excludeAction([
			'BROWSER_SET_VISIBILITY', 
			'INTERNAL_CHANGE_SET'
		]),
		function(action, currentState, previousHistory){
			if(action.type == 'CHANGE_PAGE'){
				Error("Changing page to the same page");
				return currentState.page != previousHistory;
			}
			else{
				return true;
			}
		},
		samestateRemover
	)
});

const store = createStore(undoableGdpReducer, getURLasStoreData(initialState));
console.log(store.getState());
const loggerUnsubscribe = store.subscribe(() => console.log(store.getState()));
const windowHistoryUnsubscribe = store.subscribe(() => setWindowHistory(store));
export default store;