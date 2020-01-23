export default function searchPatternContentTemplate(patternContent){
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
					28.203522619767156,
					365.7164619449168
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
					735.231311968743,
					211.17716344325348
		  ],
		  "name": "Output Data"
			},
			"6": {
		  "id": 6,
		  "data": {
					"PatternContent": patternContent
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
					379.42060213440527,
					207.89266357606976
		  ],
		  "name": "Filter Patterns by Content"
			}
	  }
	});
}