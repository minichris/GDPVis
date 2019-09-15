export default function searchPatternCategoryTemplate(patternCategoryName){
	return({
	  "id": "tasksample@0.1.0",
	  "nodes": {
		"1": {
		  "id": 1,
		  "data": {},
		  "inputs": {},
		  "outputs": {
			"patterns": {
			  "connections": [
				{
				  "node": 9,
				  "input": "patternsInput",
				  "data": {}
				}
			  ]
			}
		  },
		  "position": [
			47.95759732846598,
			347.181019686584
		  ],
		  "name": "All Patterns"
		},
		"3": {
		  "id": 3,
		  "data": {},
		  "inputs": {
			"patternsInput": {
			  "connections": [
				{
				  "node": 9,
				  "output": "patterns",
				  "data": {}
				}
			  ]
			}
		  },
		  "outputs": {},
		  "position": [
			773.0704629934341,
			255.59383979313162
		  ],
		  "name": "Output Data"
		},
		"9": {
		  "id": 9,
		  "data": {
			"PatternCategory": {
			  "value": patternCategoryName,
			  "label": patternCategoryName
			}
		  },
		  "inputs": {
			"patternsInput": {
			  "connections": [
				{
				  "node": 1,
				  "output": "patterns",
				  "data": {}
				}
			  ]
			}
		  },
		  "outputs": {
			"patterns": {
			  "connections": [
				{
				  "node": 3,
				  "input": "patternsInput",
				  "data": {}
				}
			  ]
			}
		  },
		  "position": [
			400.2888954433009,
			318.81006796193503
		  ],
		  "name": "Filter Patterns by Category"
		}
	  }
	});
}