//function for creating a document browser
function CreateDocumentViewer(pageTitle){
	$("#DocumentViewer").html('<div class="insertedPage"></div>');
	$("#DocumentViewer").addClass("HasInsertedPage");
	$(".insertedPage").html(Patterns.find(pattern => pattern.Title == pageTitle).Content);
	$("#DocumentViewer").scrollTop(0); //scroll it back to the top for the user
	document.getElementById("DocumentViewer").scrollTop = 0;
	$("#DocumentViewer").find("a[href]").click(function(e){
		DocumentViewerEventHandler(e);
	});
}

//function for handling link clicks in the document browser
function DocumentViewerEventHandler(e){
	//prevent the link from acutally working
	e.stopPropagation();
	e.preventDefault();
	//get where the link was going to
	var linkClicked = e.target.attributes['title'].value;
	//get some new filters based on the selected link and update the filter list
	Filters = generateReleventFilters(linkClicked);
	refreshGraph(performFiltering(Patterns));
	//check if the link click was a pattern that would result in a pattern in the node-link diagram being selected
	if(checkPatternCurrentlyFiltered(linkClicked)){
		ChangeSelection(linkClicked); //select the pattern
	}
    filterlistComponent.setState({filters: Filters});
	filterlistComponent.forceUpdate();
}
