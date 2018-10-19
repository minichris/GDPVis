$("#AddFilterButton").ready(function() {
	$("#AddFilterButton").click(function(){
		addFilter();
	});
});

function addFilter(){
	var FilterTypes = ["Count", "Pattern Category", "Game Category", "Game"];
	var filter = $('<li><select class="FilterTypeSelect" placeholder="Select a filter type..."><option></option></select><select class="FilterValue" placeholder="Select a filter..."><option></option></select></li>');
	$("#FiltersList").append(filter);
	
	
	$.each(FilterTypes, function (i, element) {
		filter.find(".FilterTypeSelect").append($('<option>', { 
			value: element,
			text : element 
		}));
	});

	filter.find("select").selectize({ //enable the selectize library for these select boxes
		sortField: 'text',
		searchField: 'item',
		placeholder: "Select a pattern...",
		create: function(input) {
			return { value: input, text: input }
		}
	});
}