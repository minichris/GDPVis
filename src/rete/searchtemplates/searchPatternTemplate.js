export default function searchPatternTemplate(patternName){
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
				  "node": 6,
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
				  "node": 6,
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
			"6": {
		  "id": 6,
		  "data": {
					"RelationType": [
			  {
							"value": "Can Modulate",
							"label": "Can Modulate"
			  },
			  {
							"value": "Can Be Modulated By",
							"label": "Can Be Modulated By"
			  },
			  {
							"value": "Can Instantiate",
							"label": "Can Instantiate"
			  },
			  {
							"value": "Can Be Instantiated By",
							"label": "Can Be Instantiated By"
			  },
			  {
							"value": "Potentially Conflicting With",
							"label": "Potentially Conflicting With"
			  },
			  {
							"value": "Possible Closure Effects",
							"label": "Possible Closure Effects"
			  },
			  {
							"value": "Self Reference", 
							"label": "The pattern being related to"
			  }
					],
					"Pattern": {
			  "value": patternName,
			  "label": patternName
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
					344.6868801718012,
					171.32310364443236
		  ],
		  "name": "Filter Patterns By Those With Relation To Pattern"
			}
	  }
	});
}