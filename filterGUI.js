$(function(){ //Set up button bindings
	$("#AddFilterButton").click(function(){
		Filters.push({Type: "pattern_category", Value: ""});
		filterlistComponent.forceUpdate();
	});

	$("#ApplyFiltersButton").click(function(){
		applyFilters();
	});

	$("#TooManyDialogModal").hide();

	$("#TooManyCloseButton").click(function(){
		$("#TooManyDialogModal").hide();
	});

	$("#TooManyIgnoreButton").click(function(){
		$("#TooManyDialogModal").hide();
		refreshGraph(performFiltering(Patterns));
	});

	$("#TooManyOkButton").click(function(){ //adding a limiter to the filters
		$("#TooManyDialogModal").hide();
		Filters.push({Type: "count", Value: 50});
		filterlistComponent.setState({filters: Filters});
		filterlistComponent.forceUpdate();
		refreshGraph(performFiltering(Patterns));
	});
});

function applyFilters(){ //a function to decide wether to ask the user if they want to add a limiter or just go straight to updating
	var filteredPatterns = performFiltering(Patterns);
	if(filteredPatterns.length > 50){ //predetermined dangerous amount of patterns
		$("#TooManyDialogModal").show();
		$("#TooManyDialogPatternCount").text(filteredPatterns.length);
	}
	else{
		refreshGraph(filteredPatterns);
	}
}

var filterlistComponent;

function OptionList(props) {
	let optionList = [];
	switch(props.filtertype){
		case "count":
			optionList.push({text: "50", value: 50});
			break;
		case "pattern_linked":
			optionList.push({text: "", value: ""});
			Patterns.map(pattern => optionList.push({text: pattern.Title, value: pattern.Title}));
			break;
		case "pattern_linked2":
			optionList.push({text: "", value: ""});
			Patterns.map(pattern => optionList.push({text: pattern.Title, value: pattern.Title}));
			break;
		case "conflicting":
			optionList.push({text: "", value: ""});
			Patterns.map(pattern => optionList.push({text: pattern.Title, value: pattern.Title}));
			break;
		case "pattern_category":
			optionList.push({text: "", value: ""});
			PatternCategories.map(category => optionList.push({text: category, value: category}));
			break;
		case "game_category":
			optionList.push({text: "", value: ""});
			GameCategories.map(category => optionList.push({text: category, value: category}));
			break;
		case "game":
			optionList.push({text: "", value: ""});
			Games.map(game => optionList.push({text: game.name, value: game.name}));
			break;
	}
	return optionList.map(option => <option key={option.value + option.text} value={option.value}>{option.text}</option>);
}

class SingularFilter extends React.Component  {
	componentDidMount() {
  	$(this.refs["FilterTypeSelect"]).select2().on("change", this.props.handleFilterTypeChange);
		$(this.refs["FilterValue"]).select2().on("change", this.props.handleFilterValueChange);
	}

	render() {
		let filterTypes = [
			{text: "Patterns which link to Games in Category...", value: "game_category"},
			{text: "Patterns in Category", value: "pattern_category"},
			{text: "Patterns which link to Game...", value: "game"},
			{text: "Patterns which link to Pattern...", value: "pattern_linked"},
			{text: "Patterns which link from Pattern...", value: "pattern_linked2"},
			{text: "Patterns which conflict with...", value: "conflicting"},
			{text: "Max Count", value: "count"} ];
		return (
			<li data-index={this.props.index}>
				<select ref="FilterTypeSelect" value={this.props.type} className="FilterTypeSelect" placeholder="Select a filter type..." onChange={this.props.handleFilterTypeChange}>
					{filterTypes.map(filterType => <option key={filterType.value} value={filterType.value}>{filterType.text}</option>)}
				</select>
				<select ref="FilterValue" value={this.props.value} className="FilterValue" placeholder="Select a filter..." onChange={this.props.handleFilterValueChange}>
					<OptionList index={this.props.type} filtertype={this.props.type} />
				</select>
				<button className="DeleteFilter btn btn-danger" onClick={this.props.handleDeleteButton}>X</button>
			</li>
		);
	}
}

class FilterList extends React.Component {
	constructor(props) {
    super(props);
    this.state = {
			filters: []
    };
  }

	handleDeleteButton(event){
		let currentFilters = this.state.filters;
		currentFilters.splice([event.target.parentElement.dataset.index], 1);
		this.setState({
			filters: currentFilters
		});
	}

	handleFilterTypeChange(event) {
		let currentFilters = this.state.filters;
		currentFilters[event.target.parentElement.dataset.index] = {
			Type: event.target.value,
			Value: ""
		};
		this.setState({
			filters: currentFilters
		});
	}

	handleFilterValueChange(event) {
		let currentFilters = this.state.filters;
		currentFilters[event.target.parentElement.dataset.index] = {
			Type: currentFilters[event.target.parentElement.dataset.index].Type,
			Value: event.target.value
		};
		this.setState({
			filters: currentFilters
		});
	}

	render() {
		const filterlistRef = React.createRef();
		return(
			this.state.filters.map((filter, index) => <SingularFilter parentref={filterlistRef} index={index} key={filter.Type + filter.Value} type={filter.Type} value={filter.Value} handleDeleteButton={this.handleDeleteButton.bind(this)} handleFilterTypeChange={this.handleFilterTypeChange.bind(this)} handleFilterValueChange={this.handleFilterValueChange.bind(this)} />)
		);
	}

}

function bindFilters(){
	filterlistComponent = ReactDOM.render(<FilterList />, document.getElementById('FiltersList'));
	filterlistComponent.setState({filters: Filters});
};
