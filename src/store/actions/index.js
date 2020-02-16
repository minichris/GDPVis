import {getPageType} from '../../browser';
import getFilterTemplateFromSearch from '../../rete/getFilterTemplateFromSearch.js';

//when the user performs a search or clicks a link, update both the browser location and the filters, open the browser
export function updateFromSearch(searchTerm){
	let pageType = getPageType(searchTerm);

	return{
		type: 'SEARCH',
		filters: getFilterTemplateFromSearch(pageType, searchTerm),
		page: searchTerm,
		browserVisibility: !searchTerm.includes("GenericSearch:")
	}
}

//when the user changes the filters
export function changeFilters(filters) {
	return {
		type: 'CHANGE_SET',
		filters
	}
}

//when we change the filters for the user (doesn't get saved in history)
export function internalChangeFilters(filters) {
	return {
		type: 'INTERNAL_CHANGE_SET',
		filters
	}
}

//when the user goes to the home screen by clicking the logo
export function goHome(){
	return{
		type: 'SEARCH',
		filters: getExampleData(),
		page: "Special:GDPVis",
		browserVisibility: true
	}
}

//when the user goes to a specific filter setup (used by the thing on the home screen)
export function goToSpecificBrowserFilterSetup(page, filters){
	return{
		type: 'SEARCH',
		filters,
		page,
		browserVisibility: true
	}
}

//when the user changes the displayed browser page
export function changeDisplayedBrowserPage(page) {
	return {
		type: 'CHANGE_PAGE',
		page
	}
}

//when the user sets the browser visibility 
export function setBrowserVisibility(browserVisibility){
	return {
		type: 'BROWSER_SET_VISIBILITY',
		browserVisibility
	}
}