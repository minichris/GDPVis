import searchPatternTemplate from './searchtemplates/searchPatternTemplate.js';
import searchGameTemplate from './searchtemplates/searchGameTemplate.js';
import searchPatternCategoryTemplate from './searchtemplates/searchPatternCategoryTemplate.js';
import searchGameCategoryTemplate from './searchtemplates/searchGameCategoryTemplate.js';
import searchPatternContentTemplate from './searchtemplates/searchPatternContentTemplate.js';

export default function getFilterTemplateFromSearch(type, query){
	var template;
	switch(type){
	case "Pattern":
		template = searchPatternTemplate(query);
		break;
	case "Game":
		template = searchGameTemplate(query);
		break;
	case "Pattern Category":
		template = searchPatternCategoryTemplate(query);
		break;
	case "Game Category":
		template = searchGameCategoryTemplate(query);
		break;
	case "Pattern Content":
		template = searchPatternContentTemplate(query.replace("GenericSearch:", ""));
		break;
	default:
		template = null;
		break;
	}
	
	return template;
}