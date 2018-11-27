//-------------------------------------------------------------------------
//The following section contains the Browser react components
//-------------------------------------------------------------------------
class DocumentViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      title: "Special:VGTropes",
      prevtitle: "Special:VGTropes"
    };
  }

  componentDidUpdate() {
    document.getElementById("DocumentViewer").scrollTop = 0;
    $(".insertedPage").find("a[href]").click(function (e) {
      DocumentViewerEventHandler(e);
    });
    setWindowHistory(docViewerComponent.state.title);
  }

  getSnapshotBeforeUpdate(prevProps, prevState) {
    if (prevState.title != this.state.prevtitle) {
      this.state.prevtitle = prevState.title;
    }

    return null;
  }

  render() {
    let pageTitle = this.state.title;

    if (pageTitle == null) {
      return React.createElement("div", null, React.createElement("h1", null, "Error"), React.createElement("p", null, "Null browser set up"));
    }

    console.log("Creating a document viewer for page '" + pageTitle + "', it is of type: " + getPageType(pageTitle) + ". prevtitle: " + this.state.prevtitle);
    let pageToRender;

    switch (getPageType(pageTitle)) {
      case "Pattern Category":
      case "Game Category":
        pageToRender = React.createElement(CategoryPage, {
          title: pageTitle.replace('Category:', '')
        });
        break;

      case "Game":
        pageToRender = React.createElement(GamePage, {
          title: pageTitle
        });
        break;

      case "Pattern":
        pageToRender = React.createElement(PatternPage, {
          title: pageTitle
        });
        break;

      case "Special":
        pageToRender = React.createElement(SpecialPage, {
          title: pageTitle,
          prevtitle: this.state.prevtitle
        });
        break;
    }

    return pageToRender;
  }

} //function for handling link clicks in the document browser


function DocumentViewerEventHandler(e) {
  //prevent the link from acutally working
  e.stopPropagation();
  e.preventDefault(); //get where the link was going to

  var linkClicked = e.target.attributes['title'].value; //get some new filters based on the selected link and update the filter list

  Filters = generateReleventFilters(linkClicked);
  refreshGraph(performFiltering(Patterns)); //check if the link click was a pattern that would result in a pattern in the node-link diagram being selected

  if (checkPatternCurrentlyFiltered(linkClicked)) {
    ChangePatternSelection(linkClicked); //select the pattern
  } else {
    //handle the document viewer
    docViewerComponent.setState({
      title: linkClicked
    });
  }

  filterlistComponent.setState({
    filters: Filters
  });
  filterlistComponent.forceUpdate();
}

class CategoryPage extends React.Component {
  render() {
    let categoryTitle = this.props.title;
    let pageTitlesInCategory = []; //generic array to hold all the page titles
    //we KNOW it has to be one of the two types of category page

    switch (getPageType(categoryTitle)) {
      case "Pattern Category":
        pageTitlesInCategory = patternCategoryFilter(Patterns, categoryTitle).map(pattern => pattern.Title);
        break;

      case "Game Category":
        pageTitlesInCategory = Games.filter(game => game.categories.some(cat => cat == categoryTitle)).map(game => game.name);
        break;
    }

    return React.createElement("div", {
      className: "insertedPage CategoryPage"
    }, React.createElement("h1", null, categoryTitle), React.createElement("div", {
      id: "CatListBox"
    }, pageTitlesInCategory.map(title => React.createElement("a", {
      key: title,
      title: title,
      href: 'http://virt10.itu.chalmers.se/index.php/' + title.replace(' ', '_')
    }, title))));
  }

}

class GamePage extends React.Component {
  getPatternLink(title) {
    return 'http://virt10.itu.chalmers.se/index.php/' + title.replace(' ', '_');
  }

  getPatternsReasons(game) {
    var gamePatterns = pageFilter(Patterns, game.name);
    var releventParagraphs = [];
    gamePatterns.forEach(function (pattern) {
      let parser = new DOMParser();
      let xmlObject = parser.parseFromString(pattern.Content, "text/xml");
      $(xmlObject).find("#mw-content-text").find("p").each(function () {
        if ($(this).text().includes(game.name)) {
          releventParagraphs.push({
            pattern: pattern.Title,
            reason: "Reasoning: " + $(this).text().replace(game.name, '<b>' + game.name + '</b>')
          });
        }
      });
    });
    return releventParagraphs;
  }

  render() {
    var game = Games.find(game => game.name == this.props.title);
    var gamePatternsWithReasons = this.getPatternsReasons(game);
    return React.createElement("div", {
      className: "insertedPage GamePage"
    }, React.createElement("h1", null, game.name), React.createElement("h2", null, "About"), React.createElement("p", null, "[insert info here]"), React.createElement("h2", null, "Gameplay Patterns Used"), React.createElement("i", null, "Note: this section is automatically generated from parts of pattern pages on the wiki. It can contain examples which aren't relevent to this game. Read with caution."), gamePatternsWithReasons.map(patternreason => React.createElement("div", {
      key: patternreason.pattern + "listObject"
    }, React.createElement("h3", null, patternreason.pattern), React.createElement("p", {
      dangerouslySetInnerHTML: {
        __html: patternreason.reason
      }
    }), React.createElement("a", {
      title: patternreason.pattern,
      href: this.getPatternLink(patternreason.pattern)
    }, "Continue reading about \"", patternreason.pattern, "\"..."))));
  }

}

class PatternPage extends React.Component {
  render() {
    let pattern = Patterns.find(pat => pat.Title == this.props.title);
    console.log("Generating page for the following pattern object:");
    console.log(pattern);

    if (pattern != null) {
      //if the pattern is valid
      return React.createElement("div", {
        className: "insertedPage PatternPage",
        dangerouslySetInnerHTML: {
          __html: pattern.Content
        }
      });
    } else {
      return React.createElement("div", {
        className: "insertedPage PatternPage"
      }, React.createElement("h1", null, "Error :("), React.createElement("p", null, "There was an error getting this pattern page. If you know this page exists on the Gameplay Design Pattern Wiki, please report this to an administrator."));
    }
  }

}

class SpecialPage extends React.Component {
  render() {
    if (this.props.title == "Special:VGTropes") {
      //if this is the starting page
      return React.createElement("div", {
        className: "insertedPage SpecialPage"
      }, React.createElement("h1", null, "Welcome to VGTropes"), React.createElement("p", null, "VGTropes is a visualization tool built on top of the GameDesignPatterns.org wiki. It can help you browse the collection of patterns, analysis games, contribute to the wiki, and much more. To get started, why not try looking at the ", React.createElement("a", {
        href: "javascript:void(0)",
        title: "Category:Patterns"
      }, "Patterns category"), " for some inspiration, or try filtering the patterns shown by clicking the \"Filters\" button in the graph view, or just clicking a node in the graph."), React.createElement("h2", null, "Features"), React.createElement("ul", null, React.createElement("li", null, "Clicking on a node will change the currently viewed article."), React.createElement("li", null, "Hovering over a node will show its name."), React.createElement("li", null, "The graph can be zoomed using the mouse wheel and can be panned by clicking and dragging the background."), React.createElement("li", null, "The nodes can be tugged about by click-dragging a node."), React.createElement("li", null, "Clicking the \"Filters\" button will display the currently enabled filters."), React.createElement("li", null, "In the filters menu, the filters are appiled in order, top to bottom. There is currently no way to do \"OR\" logic."), React.createElement("li", null, "The filters only update when you press \"Apply Filters\"."), React.createElement("li", null, "Not applying enough filtering will cause a message to come up warning you that you are trying to display too many nodes. It is highly recomended you heed this warning."), React.createElement("li", null, "The visualization starts with example filters which only show ", React.createElement("b", null, "patterns found in the game ", React.createElement("i", null, "\"World of Warcraft\"")), " and ", React.createElement("b", null, "patterns in the ", React.createElement("i", null, "Negative Patterns"), " category"), "."), React.createElement("li", null, "Hovering over the links between nodes shows a tooltip which explains the context of the link from the articles and any \"relations\" the articles have."), React.createElement("li", null, "The current filters (but not the current page) are saved to the URL. Copy / bookmark the url to save your filters."), React.createElement("li", null, "Game and Category pages are generated in-browser.")), React.createElement("h2", null, "Planned"), React.createElement("ul", null, React.createElement("li", null, "Currently, the nodes on the graph have random colours and links have random strengths. At some point these will be given meaning."), React.createElement("li", null, "The currently appiled filters should be shown at the bottom of the graph in a human readable format."), React.createElement("li", null, "NOT gates, OR gates and multi-selects should be added to filtering."), React.createElement("li", null, "Clicking on nodes should \"magnetise\" connected nodes around it."), React.createElement("li", null, "A \"Creator mode\"."), React.createElement("li", null, "Make zoom configurable to not zoom, but to weaken gravity."), React.createElement("li", null, "Display the amount of currently loaded Patterns and Links somewhere."), React.createElement("li", null, "Working title!")));
    } else {
      return React.createElement(OtherPage, {
        title: this.props.title,
        prevtitle: this.props.prevtitle
      });
    }
  }

}

class OtherPage extends React.Component {
  constructor(props) {
    super(props);
    this.handleGoToPrevPage = this.handleGoToPrevPage.bind(this);
  }

  handleGoToPrevPage(e) {
    e.preventDefault();
    docViewerComponent.setState({
      title: this.props.prevtitle
    });
  }

  render() {
    let url = "http://virt10.itu.chalmers.se/index.php/" + this.props.title.replace(' ', '_');
    return React.createElement("div", {
      className: "insertediframe"
    }, React.createElement("iframe", {
      src: url
    }), React.createElement("a", {
      id: "iframebacktext",
      onClick: this.handleGoToPrevPage,
      href: "javascript:void(0)"
    }, "While browsing in an iframe, the pattern graph ", React.createElement("b", null, "will not"), " update. Click here to return to the last none iframe article you visited..."));
  }

}
$(function () {
  //Set up button bindings
  $("#AddFilterButton").click(function () {
    Filters.push({
      Type: "pattern_category",
      Value: ""
    });
    filterlistComponent.forceUpdate();
  });
  $("#ApplyFiltersButton").click(function () {
    applyFilters();
  });
  $("#TooManyDialogModal").hide();
  $("#TooManyCloseButton").click(function () {
    $("#TooManyDialogModal").hide();
  });
  $("#TooManyIgnoreButton").click(function () {
    $("#TooManyDialogModal").hide();
    refreshGraph(performFiltering(Patterns));
  });
  $("#TooManyOkButton").click(function () {
    //adding a limiter to the filters
    $("#TooManyDialogModal").hide();
    Filters.push({
      Type: "count",
      Value: 50
    });
    filterlistComponent.setState({
      filters: Filters
    });
    filterlistComponent.forceUpdate();
    refreshGraph(performFiltering(Patterns));
  });
});

function applyFilters() {
  //a function to decide wether to ask the user if they want to add a limiter or just go straight to updating
  var filteredPatterns = performFiltering(Patterns);

  if (filteredPatterns.length > 50) {
    //predetermined dangerous amount of patterns
    $("#TooManyDialogModal").show();
    $("#TooManyDialogPatternCount").text(filteredPatterns.length);
  } else {
    refreshGraph(filteredPatterns);
  }
}

var filterlistComponent;

function OptionList(props) {
  let optionList = [];

  switch (props.filtertype) {
    case "count":
      optionList.push({
        text: "50",
        value: 50
      });
      break;

    case "pattern_linked":
      optionList.push({
        text: "",
        value: ""
      });
      Patterns.map(pattern => optionList.push({
        text: pattern.Title,
        value: pattern.Title
      }));
      break;

    case "pattern_linked2":
      optionList.push({
        text: "",
        value: ""
      });
      Patterns.map(pattern => optionList.push({
        text: pattern.Title,
        value: pattern.Title
      }));
      break;

    case "conflicting":
      optionList.push({
        text: "",
        value: ""
      });
      Patterns.map(pattern => optionList.push({
        text: pattern.Title,
        value: pattern.Title
      }));
      break;

    case "pattern_category":
      optionList.push({
        text: "",
        value: ""
      });
      PatternCategories.map(category => optionList.push({
        text: category,
        value: category
      }));
      break;

    case "game_category":
      optionList.push({
        text: "",
        value: ""
      });
      GameCategories.map(category => optionList.push({
        text: category,
        value: category
      }));
      break;

    case "game":
      optionList.push({
        text: "",
        value: ""
      });
      Games.map(game => optionList.push({
        text: game.name,
        value: game.name
      }));
      break;
  }

  return optionList.map(option => React.createElement("option", {
    key: option.value + option.text,
    value: option.value
  }, option.text));
}

class SingularFilter extends React.Component {
  componentDidMount() {
    $(this.refs["FilterTypeSelect"]).select2().on("change", this.props.handleFilterTypeChange);
    $(this.refs["FilterValue"]).select2().on("change", this.props.handleFilterValueChange);
  }

  render() {
    let filterTypes = [{
      text: "Patterns which link to Games in Category...",
      value: "game_category"
    }, {
      text: "Patterns in Category",
      value: "pattern_category"
    }, {
      text: "Patterns which link to Game...",
      value: "game"
    }, {
      text: "Patterns which link to Pattern...",
      value: "pattern_linked"
    }, {
      text: "Patterns which link from Pattern...",
      value: "pattern_linked2"
    }, {
      text: "Patterns which conflict with...",
      value: "conflicting"
    }, {
      text: "Max Count",
      value: "count"
    }];
    return React.createElement("li", {
      "data-index": this.props.index
    }, React.createElement("select", {
      ref: "FilterTypeSelect",
      value: this.props.type,
      className: "FilterTypeSelect",
      placeholder: "Select a filter type...",
      onChange: this.props.handleFilterTypeChange
    }, filterTypes.map(filterType => React.createElement("option", {
      key: filterType.value,
      value: filterType.value
    }, filterType.text))), React.createElement("select", {
      ref: "FilterValue",
      value: this.props.value,
      className: "FilterValue",
      placeholder: "Select a filter...",
      onChange: this.props.handleFilterValueChange
    }, React.createElement(OptionList, {
      index: this.props.type,
      filtertype: this.props.type
    })), React.createElement("button", {
      className: "DeleteFilter btn btn-danger",
      onClick: this.props.handleDeleteButton
    }, "X"));
  }

}

class FilterList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filters: []
    };
  }

  handleDeleteButton(event) {
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
    return this.state.filters.map((filter, index) => React.createElement(SingularFilter, {
      parentref: filterlistRef,
      index: index,
      key: filter.Type + filter.Value,
      type: filter.Type,
      value: filter.Value,
      handleDeleteButton: this.handleDeleteButton.bind(this),
      handleFilterTypeChange: this.handleFilterTypeChange.bind(this),
      handleFilterValueChange: this.handleFilterValueChange.bind(this)
    }));
  }

}

function bindFilters() {
  filterlistComponent = ReactDOM.render(React.createElement(FilterList, null), document.getElementById('FiltersList'));
  filterlistComponent.setState({
    filters: Filters
  });
}

;
function resetGraph() {
  ClearSelection();
  $("svg").empty();
}

function generateGraph(data) {
  console.log("Displaying " + data.nodes.length + " nodes and " + data.links.length + " links.");
  var svg = d3.select("svg");
  var width = 300;
  var height = 300;
  var root = svg.append("g");
  svg.call(d3.zoom().scaleExtent([1 / 2, 4]).on("zoom", function () {
    //Allows the graph to be zoomed and panned
    root.attr("transform", d3.event.transform);
  }));
  var color = d3.scaleOrdinal(d3.schemeCategory20b); //set the color scheme

  var simulation = d3.forceSimulation().force("link", d3.forceLink().id(function (d) {
    return d.id;
  })) //sets up the links to use the nodes ID, rather then its index in the list
  .force("gravity", d3.forceManyBody().strength(50).distanceMin(200)) //stops nodes from being pushed all the way to the edge
  .force("charge", d3.forceManyBody().strength(-50).distanceMax(150)) //stops nodes being stuck too close together
  .force("center", d3.forceCenter(width / 2, height / 2)); //makes the nodes gravitate toward the center (useful for when they spawn)

  var tooltip = d3.select("#Tooltip");
  $("#Tooltip").css("opacity", 0); //Define the div for the tooltip

  var link = root.append("g").attr("class", "links").selectAll("line").data(data.links).enter().append("line").attr("stroke-width", function (d) {
    return Math.sqrt(d.value);
  }).attr("stroke", function (d) {
    return generateLinkColor(d);
  });
  var node = root.append("g").attr("class", "nodes").selectAll("circle").data(data.nodes).enter().append("circle").attr("r", 5).attr("id", function (d) {
    return "Node_" + d.id.replace(/[\W_]/g, '_');
  }).attr("fill", function (d) {
    return color(d.group);
  }).call(d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended));
  node.on("mouseover", function (d) {
    tooltip.transition() //add the tooltip when the user mouses over the node
    .duration(200).style("opacity", .9);
    tooltip.style("left", d3.event.pageX + "px").style("top", d3.event.pageY - 28 + "px");
    toolTipComponent.setState({
      d: d,
      type: "Pattern"
    });
  }).on("mouseout", function (d) {
    //remove the tooltip when the user stops mousing over the node
    tooltip.transition().duration(500).style("opacity", 0);
  }).on("click", function (d) {
    //Click to open the relevent article
    ChangePatternSelection(d.id);
  });
  link.on("mouseover", function (d) {
    tooltip.transition() //add the tooltip when the user mouses over the node
    .duration(200).style("opacity", .9);
    tooltip.style("left", d3.event.pageX + "px").style("top", d3.event.pageY - 28 + "px");
    toolTipComponent.setState({
      d: d,
      type: "Link"
    });
  }).on("mouseout", function (d) {
    //remove the tooltip when the user stops mousing over the node
    tooltip.transition().duration(500).style("opacity", 0);
  });
  simulation.nodes(data.nodes).on("tick", function ticked() {
    //Set the nodes tick function
    link.attr("x1", function (d) {
      return d.source.x;
    }).attr("y1", function (d) {
      return d.source.y;
    }).attr("x2", function (d) {
      return d.target.x;
    }).attr("y2", function (d) {
      return d.target.y;
    });
    node.attr("cx", function (d) {
      return validate(d.x, 0, width);
    }).attr("cy", function (d) {
      return validate(d.y, 0, height);
    });
  });
  simulation.force("link").links(data.links); //Start the simulation of the links

  $('#SearchSelect').empty();
  node.each(function (node) {
    $('#SearchSelect').append($("<option></option>").attr("value", node.id).text(node.id));
  });
  ClearSelection();
  $('#SearchSelect').select2({
    width: '100%'
  });

  function validate(x, a, b) {
    //function to decide with a node is outside the bounds of the graph
    if (x < a) x = a;
    if (x > b) x = b;
    return x;
  }

  function dragstarted(d) {
    //when the user start to drag the node with the mouse
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    //when the user is dragging a node with the mouse
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    //when the user stops dragging the node with the mouse
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  function generateLinkColor(link) {
    function checkForRelation(relation) {
      return getPatternRelationsText(getPatternData(link.source), getPatternData(link.target)).includes(relation) || getPatternRelationsText(getPatternData(link.target), getPatternData(link.source)).includes(relation);
    }

    if (checkForRelation("Potentially Conflicting With")) {
      return "yellow"; //if it is conflicting
    } else {
      return "#999"; //regular gray if it doesn't
    }
  }
}

$('#SearchSelect').change(function () {
  if ($('#SearchSelect').val() != undefined) {
    ChangePatternSelection($('#SearchSelect').val());
  }
}); //function which handles changing the currently selected pattern

function ChangePatternSelection(newSelectionID) {
  //handle the document DocumentViewer
  docViewerComponent.setState({
    title: newSelectionID
  }); //handle the search box

  if ($('#SearchSelect').val() != newSelectionID) {
    $("#SearchSelect").val(newSelectionID).trigger("change");
  } //handle the highlighted node


  var nodeIDToHighlight = "#Node_" + newSelectionID.replace(/[\W_]/g, '_');
  $(".SelectedNode").removeClass('SelectedNode');
  $(nodeIDToHighlight).addClass('SelectedNode');
}

function ClearSelection() {
  $("#SearchSelect").val("");
  $(".SelectedNode").removeClass('SelectedNode');
}

function getPatternRelationsText(sourcePattern, targetPattern) {
  //get the relation between a pattern
  var relationsTexts = [];

  if (sourcePattern.PatternsLinks.find(plink => plink.To == targetPattern.Title) != null) {
    //if a pLink actually exists
    relationsTexts = sourcePattern.PatternsLinks.find(plink => plink.To == targetPattern.Title).AssociatedRelations;
  }

  return relationsTexts;
} //-------------------------------------------------------------------------
//The following section contains the Tooltip react components
//-------------------------------------------------------------------------


class Tooltip extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      d: null,
      type: null
    };
  }

  render() {
    let subcomponent;

    if (this.state.d != null) {
      switch (this.state.type) {
        case "Link":
          subcomponent = React.createElement(LinkTooltip, {
            SourcePattern: this.state.d.source.id,
            TargetPattern: this.state.d.target.id
          });
          break;

        case "Pattern":
          subcomponent = React.createElement(PatternTooltip, {
            Pattern: this.state.d.id
          });
          break;

        case null:
          subcomponent = React.createElement("p", null, "nothing to see here");
          break;
      }
    } else {
      subcomponent = React.createElement("span", null, "No inner tooltip loaded.");
    }

    return subcomponent;
  }

}

class LinkTooltip extends React.Component {
  getPatternLinksHTML(sourcePattern, targetPattern) {
    var targetLink = $(sourcePattern.Content).find("a[href]").filter(function (linkIndex, linkDOM) {
      //for each link
      var afterRelations = $(linkDOM).parent().prevAll("h2").find("#Relations").length == 0;
      var linksToTargetPattern = $(linkDOM).text() == targetPattern.Title;
      return linksToTargetPattern && afterRelations;
    });
    $(targetLink).parent().find("a").not(targetLink).contents().unwrap();
    $(targetLink).addClass("TooltipHighlighted");
    return targetLink.parent().html();
  }

  formatRelationTexts(sourcePattern, targetPattern) {
    return getPatternRelationsText(sourcePattern, targetPattern).map(function (relation) {
      return '<span class="TooltipHighlighted">' + sourcePattern.Title + "</span> " + relation.toLowerCase() + ' <span class="TooltipHighlighted">' + targetPattern.Title + "</span>";
    }).join('<br>');
  }

  generateLinkTooltipHTML(pattern1, pattern2) {
    //get all the relation texts
    var relationTexts = [this.formatRelationTexts(pattern1, pattern2), this.formatRelationTexts(pattern2, pattern1)].filter(function (para) {
      return para != null;
    }).join('<br>'); //get both possible sides of the relevent paragraphs, then remove any which are blank

    var releventParagraphs = [this.getPatternLinksHTML(pattern1, pattern2), this.getPatternLinksHTML(pattern2, pattern1)].filter(function (para) {
      return para != null;
    }).join('<hr>');
    return [relationTexts, releventParagraphs].join('<hr>');
  }

  render() {
    var pattern1 = Patterns.find(pattern => pattern.Title == this.props.SourcePattern);
    var pattern2 = Patterns.find(pattern => pattern.Title == this.props.TargetPattern);
    return React.createElement("div", {
      id: "TooltipInner",
      dangerouslySetInnerHTML: {
        __html: this.generateLinkTooltipHTML(pattern1, pattern2)
      }
    });
  }

}

class PatternTooltip extends React.Component {
  render() {
    let parser = new DOMParser();
    let patternObj = Patterns.find(pattern => pattern.Title == this.props.Pattern);
    let xmlObject = parser.parseFromString(patternObj.Content, "text/xml");
    let discriptionText = $(xmlObject).find("#mw-content-text > p > i").first().text();
    return React.createElement("div", {
      id: "TooltipInner"
    }, this.props.Pattern, React.createElement("br", null), React.createElement("i", null, discriptionText));
  }

}
var Patterns;
var Games;
var PatternCategories;
var GameCategories;
var docViewerComponent;
var toolTipComponent;
$(document).ready(function () {
  var requiredDataLoadedPromise = Promise.all([loadPatterns(), loadGames()]);
  docViewerComponent = ReactDOM.render(React.createElement(DocumentViewer, null), document.getElementById("DocumentViewer"));
  requiredDataLoadedPromise.then(function () {
    loadFiltersorDefaults();
    bindFilters();
    applyFilters();
    $("#Search").show();
    $("#Graph").show();
    $("#LoadingAjax").hide();
    toolTipComponent = ReactDOM.render(React.createElement(Tooltip, null), document.getElementById("Tooltip"));
  });
});

function refreshGraph(filteredPatterns) {
  resetGraph();
  generateGraph({
    nodes: createNodesObject(filteredPatterns),
    links: createLinksObject(filteredPatterns)
  });
  setWindowHistory(docViewerComponent.state.title);
}

function loadMessageUpdater() {
  $("#LoadingAjax > span").text("Currently loaded " + Math.floor(100 * CurrentFileLoadPercentage) + "% of file " + CurrentLoadingFile + "/2.");
}

var CurrentFileLoadPercentage;
var CurrentLoadingFile = 0;

function loadViaAjax(inputURL) {
  CurrentLoadingFile += 1; //increase the currently downloading file

  var request = $.ajax({
    url: inputURL,
    dataType: "json",
    xhr: function () {
      var xhr = new window.XMLHttpRequest();
      xhr.addEventListener("progress", function (evt) {
        //progress event
        if (evt.lengthComputable) {
          CurrentFileLoadPercentage = evt.loaded / evt.total; // load percentage

          loadMessageUpdater();
        }
      }, false);
      return xhr;
    }
  });
  return request;
}

function loadPatterns() {
  var request = loadViaAjax("AllPatterns.json");
  request.done(function (data) {
    Patterns = data;
    PatternCategories = new Set();
    Patterns.map(pattern => pattern.Categories).flat().forEach(function (subcategory) {
      PatternCategories.add(subcategory);
    });
    PatternCategories = Array.from(PatternCategories);
  });
  return request;
}

function loadGames() {
  var request = loadViaAjax("AllGames.json");
  request.done(function (data) {
    Games = data;
    GameCategories = new Set();
    Games.map(game => game.categories).flat().forEach(function (subcategory) {
      GameCategories.add(subcategory);
    });
    GameCategories = Array.from(GameCategories); //turn the set into an array
  });
  return request;
} //Give a page title, find the type of the page


function getPageType(pageTitle) {
  if (pageTitle.includes("Special:")) {
    return "Special";
  }

  if (Patterns.find(pattern => pattern.Title == pageTitle) != null) {
    return "Pattern";
  }

  if (Games.find(game => game.name == pageTitle) != null) {
    return "Game";
  } //pattern category names may contain this string, remove it before next tests, but not before


  pageTitle = pageTitle.replace('Category:', '');

  if (PatternCategories.find(cat => cat == pageTitle) != null) {
    return "Pattern Category";
  }

  if (GameCategories.find(cat => cat == pageTitle) != null) {
    return "Game Category";
  }

  return "Other";
}

function checkPatternCurrentlyFiltered(patternName) {
  //get the currently filtered patterns
  var currentlyFilteredPatterns = performFiltering(Patterns); //check if the page we are looking for is in the current patterns

  return currentlyFilteredPatterns.find(fPattern => fPattern.Title == patternName) != null;
}

function generateReleventFilters(pageTitle) {
  switch (getPageType(pageTitle)) {
    case "Pattern":
      if (checkPatternCurrentlyFiltered(pageTitle)) {
        //if the pattern is currently visable
        return Filters; //just return the current filters, unchanged
      } else {
        //if the pattern isn't currently visable
        return [{
          Type: "pattern_linked",
          Value: pageTitle
        }, {
          Type: "count",
          Value: 50
        }];
      }

      break;

    case "Game":
      return [{
        Type: "game",
        Value: pageTitle
      }, {
        Type: "count",
        Value: 50
      }];
      break;

    case "Pattern Category":
      return [{
        Type: "pattern_category",
        Value: pageTitle.replace('Category:', '')
      }, {
        Type: "count",
        Value: 50
      }];
      break;

    case "Game Category":
      return [{
        Type: "game_category",
        Value: pageTitle.replace('Category:', '')
      }, {
        Type: "count",
        Value: 50
      }];
      break;

    case "Other":
    case "Special":
      return Filters; //just return the current filters, unchanged

      break;
  }
}

function getPatternData(patternName) {
  return Patterns.find(pattern => pattern.Title == patternName);
}

function patternCategoryFilter(inputPatterns, inputPatternSubcategory) {
  //filters a list of patterns to only ones that are found in a pattern subcategory
  var outputPatterns = inputPatterns.filter(pattern => pattern.Categories.some(category => category == inputPatternSubcategory));
  return outputPatterns;
}

function gameCategoryFilter(inputPatterns, inputGameSubcategory) {
  //filters a list of patterns to only ones that link to games found in a game subcategory
  var gamesOfCategory = Games.filter(game => game.categories.includes(inputGameSubcategory));
  var outputPatterns = inputPatterns.filter(pattern => pattern.PatternsLinks.some(pLink => gamesOfCategory.some(game => game.name == pLink.To)));
  return outputPatterns;
}

function pageFilter(inputPatterns, inputPage) {
  //filters a list of patterns to only ones that link to a specific page (game or pattern), including that page
  var outputPatterns = inputPatterns.filter(pattern => pattern.PatternsLinks.some(pLink => pLink.To == inputPage) || pattern.Title == inputPage);
  return outputPatterns;
}

function reverseRelationLookupFilter(inputPatterns, inputPage, relationString) {
  //filters a list of patterns to only ones that link to a specific page with a relation
  var outputPatterns = inputPatterns.filter(pattern => pattern.PatternsLinks.some(pLink => pLink.To == inputPage && pLink.AssociatedRelations.some(relation => relation == relationString)));
  outputPatterns.push(Patterns.filter(pattern => pattern.Title == inputPage)[0]); //also include the original page

  return outputPatterns;
}

function patternsLinkedToByPattern(inputPatterns, inputPattern) {
  //filters a list of patterns to only ones that come FROM a pattern page
  var inputPatternObject = Patterns.filter(pattern => pattern.Title == inputPattern)[0];
  var outputPatterns = inputPatterns.filter(pattern => inputPatternObject.PatternsLinks.map(pLink => pLink.To).includes(pattern.Title));
  outputPatterns.push(inputPatternObject); //also include the original page

  return outputPatterns;
}

function performFiltering(inputPatterns) {
  var outputPatterns = inputPatterns; //outputPatterns is the list of patterns we will be operating on the most

  var filtersValues = Filters; //gets the current filters from the GUI

  console.log("_________FILTERS_________");
  filtersValues.forEach(function (filter) {
    switch (filter.Type) {
      case "pattern_category":
        outputPatterns = patternCategoryFilter(outputPatterns, filter.Value);
        console.log("Filtering output to only patterns which are in the subcategory: " + filter.Value);
        break;

      case "game_category":
        outputPatterns = gameCategoryFilter(outputPatterns, filter.Value);
        console.log("Filtering output to only patterns which link to games in the subcategory: " + filter.Value);
        break;

      case "game":
        outputPatterns = pageFilter(outputPatterns, filter.Value);
        console.log("Filtering output to only patterns which link to the game: " + filter.Value);
        break;

      case "count":
        outputPatterns = outputPatterns.slice(0, filter.Value);
        console.log("Filtering output to a count of: " + filter.Value);
        break;

      case "pattern_linked":
        outputPatterns = pageFilter(outputPatterns, filter.Value);
        console.log("Filtering output to only patterns which link to the pattern: " + filter.Value);
        break;

      case "pattern_linked2":
        outputPatterns = patternsLinkedToByPattern(outputPatterns, filter.Value);
        console.log("Filtering output to only patterns which link from the pattern: " + filter.Value);
        break;

      case "conflicting":
        outputPatterns = reverseRelationLookupFilter(outputPatterns, filter.Value, "Potentially Conflicting With");
        console.log("Filtering output to only patterns which conflict with the pattern: " + filter.Value);
        break;
    }
  });
  console.log("_________________________");
  return outputPatterns;
}

function createNodesObject(patterns) {
  function getGroup() {
    return Math.floor(Math.random() * 6) + 1;
  }

  var nodesObject = []; //array to store the output of the function

  patterns.forEach(function (pattern) {
    nodesObject.push({
      id: pattern.Title,
      group: getGroup()
    });
  });
  return nodesObject;
}

function createLinksObject(patterns) {
  var linksObject = []; //array to store the output of the function

  var includedPatternNames = patterns.map(pattern => pattern.Title); //all included pattern's names

  patterns.forEach(function (pattern) {
    pattern["PatternsLinks"].forEach(function (pLink) {
      if (includedPatternNames.includes(pLink.To)) {
        //if the link is to a pattern that is included
        linksObject.push({
          //create the array member
          source: pattern.Title,
          target: pLink.To,
          value: 1
        });
      }
    });
  });
  return linksObject;
} //-------------------------------------------------------------------------
//The following section controls the saving and loading filters from the URL
//-------------------------------------------------------------------------


var Filters;

function loadFiltersorDefaults() {
  var urlParams = new URLSearchParams(new URL(window.location).search);

  if (urlParams.has('data')) {
    //if the url has filters in the GET request
    Filters = JSON.parse(atob(urlParams.get('data')))["filters"]; //parse the filters

    let pageToDisplay = JSON.parse(atob(urlParams.get('data')))["currentPage"];
    docViewerComponent.setState({
      title: pageToDisplay
    });
  } else {
    //set example filters
    Filters = [{
      Type: "game",
      Value: "World of Warcraft"
    }, {
      Type: "pattern_category",
      Value: "Negative Patterns"
    }];
  }
}

function setWindowHistory(currentPage) {
  let saveData = {
    filters: Filters,
    //current filters
    currentPage: currentPage //current browser page

  };
  let encoded = btoa(JSON.stringify(saveData));
  window.history.pushState('VGTropes', 'VGTropes', '?data=' + encoded);
}
