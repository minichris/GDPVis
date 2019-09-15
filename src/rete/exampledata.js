export default function getExampleData(){
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
				  "node": 5,
				  "input": "patternsInput",
				  "data": {}
				}
			  ]
			}
		  },
		  "position": [
			-99.82572836965808,
			391.62714369277666
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
				  "node": 4,
				  "output": "patterns",
				  "data": {}
				}
			  ]
			}
		  },
		  "outputs": {},
		  "position": [
			883.0746137065316,
			223.37042544224636
		  ],
		  "name": "Output Data"
		},
		"4": {
		  "id": 4,
		  "data": {
			"PatternCategory": {
			  "value": "Negative Patterns",
			  "label": "Negative Patterns"
			}
		  },
		  "inputs": {
			"patternsInput": {
			  "connections": [
				{
				  "node": 5,
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
			593.593076789012,
			222.17088114454072
		  ],
		  "name": "Filter Patterns by Category"
		},
		"5": {
		  "id": 5,
		  "data": {
			"Game": {
			  "value": "World of Warcraft",
			  "label": "World of Warcraft"
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
				  "node": 4,
				  "input": "patternsInput",
				  "data": {}
				}
			  ]
			}
		  },
		  "position": [
			163.1436367828802,
			274.01041945660154
		  ],
		  "name": "Filter Patterns to Those Linked To A Game"
		}
	  }
	});
}