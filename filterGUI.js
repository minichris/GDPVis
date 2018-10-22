$(function(){ //Set up button bindings
	$("#AddFilterButton").click(function(){
		addFilter();
	});
	
	$("#ApplyFiltersButton").click(function(){
		refreshGraph();
	});
	
	$("#ShowFiltersButton").click(function(){
		
	});
});

function addExampleFilter(){
	var presetWoWFilter = addFilter();
	presetWoWFilter.find(".FilterTypeSelect").val("game").trigger("change");
	presetWoWFilter.find(".FilterValue").val("World of Warcraft").trigger("change");
	
	var presetNegativeFilter = addFilter();
	presetNegativeFilter.find(".FilterTypeSelect").val("pattern_category").trigger("change");
	presetNegativeFilter.find(".FilterValue").val("Negative Patterns").trigger("change");
}

function addFilter(){
	var FilterTypes = [
		{text: "Max Count", value: "count"}, 
		{text: "Game Category", value: "game_category"},
		{text: "Pattern Category", value: "pattern_category"},
		{text: "Game", value: "game"}];
	var filter = $(`
		<li>
			<select class="FilterTypeSelect" placeholder="Select a filter type...">
				<option></option>
			</select>
			<select disabled class="FilterValue" placeholder="Select a filter...">
			</select>
			<button class="DeleteFilter btn btn-danger">X</button>
		</li>`);
	$("#FiltersList").append(filter);
	
	
	$.each(FilterTypes, function (i, element) {
		filter.find(".FilterTypeSelect").append($('<option>', { 
			value: element.value,
			text : element.text
		}));
	});
	
	filter.find(".DeleteFilter").click(function(){
		filter.remove();
	});
	
	filter.find(".FilterTypeSelect").select2({ width: '150px' });
	filter.find(".FilterValue").select2({ width: '180px' });
	
	filter.find(".FilterTypeSelect").on('change', function(){
		var currentValue = filter.find(".FilterTypeSelect").val();
		filter.find(".FilterValue").empty();
		filter.find(".FilterValue").removeAttr('disabled');
		switch(currentValue){
			case "count":
				var defaultOption = new Option("50", 50, true, true);
				filter.find(".FilterValue").append(defaultOption);
				break;
			case "pattern_category":
				PatternCategories.map(cat => filter.find(".FilterValue").append(new Option(cat, cat)));
				break;
			case "game_category":
				GameCategories.map(cat => filter.find(".FilterValue").append(new Option(cat, cat)));
				break;
			case "game":
				Games.map(game => filter.find(".FilterValue").append(new Option(game.name, game.name)));
				break;
		}
		filter.find(".FilterValue").trigger("change");
	});
	
	return filter;
}

function getFilters(){
	var filtersValues = [];
	$("#FiltersList > li").each(function(index){
		var filterType = $(this).find(".FilterTypeSelect").val();
		var filterValue = $(this).find(".FilterValue").val();
		filtersValues.push({Type: filterType, Value: filterValue});
	});
	return filtersValues;
}