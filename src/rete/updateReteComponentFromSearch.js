import searchPatternTemplate from './searchtemplates/searchPatternTemplate.js';
import searchGameTemplate from './searchtemplates/searchGameTemplate.js';
import searchPatternCategoryTemplate from './searchtemplates/searchPatternCategoryTemplate.js';
import searchGameCategoryTemplate from './searchtemplates/searchGameCategoryTemplate.js';

export default function updateReteComponentFromSearch(reteFilterComponent, type, query){
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
		default:
			template = null;
			break;
	}
	
	reteFilterComponent.editor.fromJSON(template).then(() => {
		reteFilterComponent.editor.view.resize();
	});
	reteFilterComponent.engine.process(template);
}