$(function(){ //Set up button bindings
	$("#AddFilterButton").click(function(){
		addFilter();
	});
	
	$("#ApplyFiltersButton").click(function(){
		refreshGraph();
	});
});

function addExampleFilter(){
	var presetWoWFilter = addFilter();
	presetWoWFilter.find(".FilterTypeSelect").val("game").trigger("change");
	presetWoWFilter.find(".FilterValue").removeAttr('disabled');
	Games.map(game => presetWoWFilter.find(".FilterValue").append(new Option(game.name, game.name)));
	presetWoWFilter.find(".FilterValue").val("World of Warcraft");
	presetWoWFilter.trigger("change");
}

function addFilter(){
	var FilterTypes = [
		{text: "Max Count", value: "count"}, 
		{text: "Game Category", value: "game_category"},
		{text: "Game", value: "game"}];
		/*{text: "Pattern Category", value: "pattern_category"}, */
	var filter = $(`
		<li>
			<select class="FilterTypeSelect" placeholder="Select a filter type...">
				<option></option>
			</select>
			<select disabled class="FilterValue" placeholder="Select a filter...">
			</select>
			<button class="DeleteFilter btn btn-danger">Delete</button>
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
	
	filter.find(".FilterTypeSelect").select2();
	filter.find(".FilterValue").select2({tags: true});
	
	filter.find(".FilterTypeSelect").on('change', function(){
		var currentValue = filter.find(".FilterTypeSelect").val();
		filter.find(".FilterValue").empty();
		switch(currentValue){
			case "count":
				filter.find(".FilterValue").removeAttr('disabled');
				var defaultOption = new Option("50", 50, true, true);
				filter.find(".FilterValue").append(defaultOption).trigger("change");
				break;
			case "pattern_category":
				break;
			case "game_category":
				filter.find(".FilterValue").removeAttr('disabled');
				//filter.find(".FilterValue").attr('multiple', 'multiple');
				//filter.find(".FilterValue").select2({tags: true});
				GameCategories.map(cat => filter.find(".FilterValue").append(new Option(cat, cat)));
				filter.find(".FilterValue").trigger("change");
				break;
			case "game":
				filter.find(".FilterValue").removeAttr('disabled');
				Games.map(game => filter.find(".FilterValue").append(new Option(game.name, game.name)));
				filter.find(".FilterValue").trigger("change");
				break;
		}
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