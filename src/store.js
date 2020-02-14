import { createStore } from 'redux';
import getExampleData from './rete/exampledata.js';
import undoable, { excludeAction, combineFilters } from 'redux-undo';
import { ActionCreators as UndoActionCreators } from 'redux-undo';
import {getPageType} from './browser';
import getFilterTemplateFromSearch from './rete/getFilterTemplateFromSearch.js';
import {setWindowHistory, getURLasStoreData} from './windowHistoryUtil.js';

export function updateFromSearch(searchTerm){
	let pageType = getPageType(searchTerm);

	return{
		type: 'SEARCH',
		filters: getFilterTemplateFromSearch(pageType, searchTerm),
		page: searchTerm,
		browserVisibility: !searchTerm.includes("GenericSearch:")
	}
}

export function goToSpecificBrowserFilterSetup(page, filters){
	return{
		type: 'SEARCH',
		filters,
		page,
		browserVisibility: true
	}
}

export function goHome(){
	return{
		type: 'SEARCH',
		filters: getExampleData(),
		page: "Special:GDPVis",
		browserVisibility: true
	}
}

export function changeFilters(filters) {
	return {
		type: 'CHANGE_SET',
		filters
	}
}

export function internalChangeFilters(filters) {
	return {
		type: 'INTERNAL_CHANGE_SET',
		filters
	}
}

export function changeDisplayedBrowserPage(page) {
	return {
		type: 'CHANGE_PAGE',
		page
	}
}

export function setBrowserVisibility(browserVisibility){
	return {
		type: 'BROWSER_SET_VISIBILITY',
		browserVisibility
	}
}

const initialState = {
	filters: getExampleData(),
	page: "Special:GDPVis",
	browserVisibility: true
}

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

const undoableGdpReducer = undoable(
	gdpReducer, 
	{filter: combineFilters(
		excludeAction([
			'BROWSER_SET_VISIBILITY', 
			'INTERNAL_CHANGE_SET'
		]),
		function(action, currentState, previousHistory){
			if(action.type == 'CHANGE_PAGE'){
				return currentState.page != previousHistory;
			}
			else{
				return true;
			}
		}
	)
});

const store = createStore(undoableGdpReducer, getURLasStoreData(initialState));
console.log(store.getState());
const loggerUnsubscribe = store.subscribe(() => console.log(store.getState()));
const windowHistoryUnsubscribe = store.subscribe(() => setWindowHistory(store));
//store.dispatch(UndoActionCreators.undo());
//store.dispatch(UndoActionCreators.redo());
//store.dispatch(changeDisplayedBrowserPage("World of Warcraft"));
export default store;