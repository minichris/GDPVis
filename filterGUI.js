$(function(){ //Set up button bindings
	$("#AddFilterButton").click(function(){
		Filters.push({Type: "pattern_category", Value: ""});
		filterlistComponent.forceUpdate();
	});

	$("#ApplyFiltersButton").click(function(){
		refreshGraph();
	});
});

var Filters = [{Type: "game", Value: "World of Warcraft"}, {Type: "pattern_category", Value: "Negative Patterns"}];
var filterlistComponent;

function OptionList(props) {
	let optionList = [];
	switch(props.filtertype){
		case "count":
			optionList.push({text: "50", value: 50});
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
	return optionList.map(option => <option key={option.value} value={option.value}>{option.text}</option>);
}

function SingularFilter(props) {
	let filterTypes = [ {text: "Game Category", value: "game_category"},	{text: "Pattern Category", value: "pattern_category"}, {text: "Game", value: "game"}, {text: "Max Count", value: "count"} ];
	return (
		<li data-index={props.index}>
			<select value={props.type} className="FilterTypeSelect" placeholder="Select a filter type..." onChange={props.handleFilterTypeChange}>
				{filterTypes.map(filterType => <option key={filterType.value} value={filterType.value}>{filterType.text}</option>)}
			</select>
			<select value={props.value} className="FilterValue" placeholder="Select a filter..." onChange={props.handleFilterValueChange}>
				<OptionList filtertype={props.type} />
			</select>
			<button className="DeleteFilter btn btn-danger" onClick={props.handleDeleteButton}>X</button>
		</li>
	);
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
			this.state.filters.map((filter, index) => <SingularFilter parentref={filterlistRef} index={index} key={index} type={filter.Type} value={filter.Value} handleDeleteButton={this.handleDeleteButton.bind(this)} handleFilterTypeChange={this.handleFilterTypeChange.bind(this)} handleFilterValueChange={this.handleFilterValueChange.bind(this)} />)
		);
	}

}

function addExampleFilter(){
	filterlistComponent = ReactDOM.render(<FilterList />, document.getElementById('FilterListComponent'));
	filterlistComponent.setState({filters: Filters});
};
