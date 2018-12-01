class SearchBox extends React.Component {
    constructor(props){
        super(props);
    }

    handleFilterTypeChange(event) {
        console.log(event);
    }

    getOptions(){ //get all the options for the option text
        let options = [];
        Patterns.forEach(pattern =>
            options.push(<option key={options.length} data-type={"Pattern"} value={pattern.Title}>{pattern.Title}</option>)
        );
        Games.forEach(game =>
            options.push(<option key={options.length} data-type={"Game"} value={game.name}>{game.name}</option>)
        );
        PatternCategories.forEach(cat =>
            options.push(<option key={options.length} data-type={"Pattern Category"} value={cat}>{cat}</option>)
        );
        GameCategories.forEach(cat =>
            options.push(<option key={options.length} data-type={"Game Category"} value={cat}>{cat}</option>)
        );
        return options;
    }

    componentDidMount() {
  		$(this.refs["SearchBox"]).select2({
            width: '50%',
            templateResult: this.formatOption,
            minimumInputLength: 3,
            allowClear: true,
            placeholder: "Click here and start typing to search."
        });
	}

    formatOption(option) {
        if (!option.element) {
            return option.text;
        }
        return $('<span>' + option.element.dataset.type + ': ' + option.text + '</span>');
    };

    searchButtonClicked(event){
        let articleSelected = $("#SearchBox").val();
        Filters = generateReleventFilters(articleSelected);
    	refreshGraph(performFiltering(Patterns));
        docViewerComponent.setState({title: articleSelected});
        filterlistComponent.setState({filters: Filters});
    	filterlistComponent.forceUpdate();
    }

    render(){
        return(
            < >
                <select ref="SearchBox" id="SearchBox" value={this.props.value} className="SearchBox">
                    {this.getOptions()}
                </select>
                <button id="SearchButton" className="btn btn-light" onClick={this.searchButtonClicked.bind(this)}>Display</button>
            < />
        );
    }
}
