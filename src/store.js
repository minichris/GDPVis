import { createStore } from 'redux';
import getExampleData from './rete/exampledata.js';
import {getURLasJSON} from './history.js';
import undoable from 'redux-undo';
import { ActionCreators as UndoActionCreators } from 'redux-undo'
import { ChangePatternSelection } from './graph.js';


function changeFilters(filters) {
	return {
		type: 'CHANGE_SET',
		filters
	}
}

function changeDisplayedBrowserPage(page) {
	return {
		type: 'CHANGE_PAGE',
		page
	}
}

const initialState = {
	filters: getExampleData(),
	page: "Special:GDPVis"
}

function gdpReducer(state = initialState, action) {
	switch(action.type){
		case 'CHANGE_SET':
			return Object.assign({}, state, {
				filters: action.filters
			});
		case 'CHANGE_PAGE':
			return Object.assign({}, state, {
				page: action.page
			});
		default:
			return state;
	}
}

const undoableGdpReducer = undoable(gdpReducer);

const store = createStore(undoableGdpReducer);
console.log(store.getState());
const unsubscribe = store.subscribe(() => console.log(store.getState()));
store.dispatch(changeFilters({"test": "test"}));
store.dispatch(UndoActionCreators.undo());
store.dispatch(UndoActionCreators.undo());
store.dispatch(UndoActionCreators.redo());
store.dispatch(UndoActionCreators.redo());
store.dispatch(changeDisplayedBrowserPage("World of Warcraft"));
unsubscribe();
export default store;